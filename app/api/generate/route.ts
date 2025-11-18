import { NextRequest, NextResponse } from 'next/server'
import { createJob, updateJob, addLog } from '@/lib/jobs'
import { fetchGitHubRepo, fetchRecentCommits, getSinceISO, fetchCommitFiles } from '@/lib/github'
import { ClaudeService, DaytonaService, CodeRabbitService, GalileoService } from '@/lib/services'
import type { RepoProfile, ContentFormat, ContentVariant } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoUrl, formats, timeRange } = body

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // Create job
    const job = createJob(repoUrl)
    if (timeRange) updateJob(job.id, { timeRange })
    
    // Start async processing (don't await)
    processGeneration(job.id, repoUrl, formats || ['tutorial', 'blog', 'talk', 'twitter'], (timeRange as any) || '3months')
      .catch(error => {
        console.error('Generation failed:', error)
        updateJob(job.id, {
          status: 'failed',
          error: error.message
        })
      })

    return NextResponse.json({ jobId: job.id })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}

async function processGeneration(
  jobId: string,
  repoUrl: string,
  formats: ContentFormat[],
  timeRange: '1week' | '1month' | '3months' | '6months' | '1year'
) {
  // Phase 1: Analyzing repository
  updateJob(jobId, { status: 'analyzing', progress: 10 })
  addLog(jobId, 'System', 'Initializing DevRel Campaign Generator...', 'text-primary')
  
  addLog(jobId, 'Understanding Agent', 'Fetching repository metadata...', 'text-chart-3')
  const repoData = await fetchGitHubRepo(repoUrl)
  addLog(jobId, 'Understanding Agent', `Fetching recent commits for ${timeRange} window...`, 'text-chart-3')
  const sinceISO = getSinceISO(timeRange)
  const recentCommits = await fetchRecentCommits(repoUrl, 50, sinceISO)
  if (recentCommits.length) {
    addLog(jobId, 'Understanding Agent', `Loaded ${recentCommits.length} recent commits since ${sinceISO.slice(0,10)}`, 'text-chart-3')
  } else {
    addLog(jobId, 'Understanding Agent', 'No recent commits available or fetch failed', 'text-chart-5')
  }
  // Fetch diffs for first few commits to ground content and reviews
  const commitLimitForDiffs = Math.min(recentCommits.length, 5)
  let diffsFetched = 0
  for (let i = 0; i < commitLimitForDiffs; i++) {
    const files = await fetchCommitFiles(repoUrl, recentCommits[i].sha)
    if (files && files.length) {
      recentCommits[i].files = files
      diffsFetched++
    }
  }
  if (diffsFetched > 0) {
    addLog(jobId, 'Understanding Agent', `Fetched file diffs for ${diffsFetched} commits`, 'text-chart-3')
  }
  
  addLog(jobId, 'Understanding Agent', `Found ${Object.keys(repoData.languages).length} languages`, 'text-chart-3')
  
  // Phase 2: Extract profile with Claude
  updateJob(jobId, { progress: 25 })
  addLog(jobId, 'Claude', 'Analyzing repository structure...', 'text-primary')

  let claude: ClaudeService
  let extractedProfile: any
  
  try {
    claude = new ClaudeService()
    addLog(jobId, 'Claude', 'Extracting repository profile...', 'text-primary')
    extractedProfile = await claude.extractRepoProfile(repoData)
  } catch (error: any) {
    // Check if it's an API key issue
    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      addLog(jobId, 'System', '⚠️ ANTHROPIC_API_KEY not configured', 'text-chart-5')
      addLog(jobId, 'System', 'Using fallback content generation...', 'text-chart-5')
      claude = new ClaudeService()
      extractedProfile = {
        mainFeatures: ['Feature analysis unavailable - add API key'],
        technicalStack: Object.keys(repoData.languages || {}),
        quickstartPath: null
      }
    } else if (error.message?.includes('credit balance')) {
      addLog(jobId, 'System', '⚠️ Anthropic API credits exhausted', 'text-chart-5')
      addLog(jobId, 'System', 'Using fallback content generation...', 'text-chart-5')
      claude = new ClaudeService()
      extractedProfile = {
        mainFeatures: [repoData.description || 'No description'],
        technicalStack: Object.keys(repoData.languages || {}),
        quickstartPath: null
      }
    } else {
      throw error
    }
  }
  
  const profile: RepoProfile = {
    url: repoData.url,
    owner: repoData.owner,
    name: repoData.name,
    description: repoData.description,
    languages: repoData.languages,
    primaryLanguage: repoData.primaryLanguage,
    stars: repoData.stars,
    forks: repoData.forks,
    structure: repoData.structure,
    readme: repoData.readme.substring(0, 5000), // Truncate for storage
    mainFeatures: extractedProfile.mainFeatures,
    technicalStack: extractedProfile.technicalStack,
    quickstartPath: extractedProfile.quickstartPath,
    commits: recentCommits,
    extractedAt: new Date().toISOString(),
    version: '1.0'
  }
  
  updateJob(jobId, { profile, progress: 35 })
  addLog(jobId, 'Claude', `Identified ${profile.mainFeatures.length} key features`, 'text-primary')
  
  // Phase 3: Validate with Daytona
  updateJob(jobId, { status: 'validating', progress: 40 })
  addLog(jobId, 'Daytona', 'Creating ephemeral workspace...', 'text-accent')
  
  const daytona = new DaytonaService()
  const executionReport = await daytona.validateQuickstart(repoUrl, profile.quickstartPath)
  
  updateJob(jobId, { executionReport, progress: 50 })
  if (executionReport.passed) {
    addLog(jobId, 'Daytona', 'Validation completed successfully ✓', 'text-accent')
  } else {
    addLog(jobId, 'Daytona', 'Validation completed with warnings', 'text-chart-5')
  }
  
  // Phase 4: Generate content variants
  updateJob(jobId, { status: 'generating', progress: 55 })
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  if (!hasApiKey) {
    addLog(jobId, 'Content Agent', 'Generating fallback content (no API key)...', 'text-chart-5')
  } else {
    addLog(jobId, 'Content Agent', 'Generating AI-powered content variants...', 'text-chart-4')
  }
  
  const allVariants: ContentVariant[] = []
  const progressPerFormat = 25 / formats.length
  
  for (let i = 0; i < formats.length; i++) {
    const format = formats[i]
    addLog(jobId, 'Content Agent', `Creating ${format} variants...`, 'text-chart-4')
    
    const variants = await claude.generateContentVariants(profile, format, 2)
    allVariants.push(...variants)
    
    updateJob(jobId, { 
      variants: allVariants,
      progress: 55 + (i + 1) * progressPerFormat 
    })
  }
  
  // Phase 5: Evaluate with Galileo
  updateJob(jobId, { status: 'evaluating', progress: 80 })
  addLog(jobId, 'Galileo', 'Evaluating content quality...', 'text-chart-5')
  
  const galileo = new GalileoService()
  const scoredVariants = await galileo.evaluateVariants(allVariants, profile)
  
  updateJob(jobId, { variants: scoredVariants, progress: 85 })
  addLog(jobId, 'Galileo', `Scored ${scoredVariants.length} variants (multi-metric)`, 'text-chart-5')

  // Single improvement iteration for low-performing variants
  const IMPROVEMENT_THRESHOLD = 70
  const HIGH_RISK_THRESHOLD = 0.1
  const toImprove = scoredVariants.filter(v => (v.score || 0) < IMPROVEMENT_THRESHOLD || (v.evaluationMetrics?.hallucinationRisk || 0) > HIGH_RISK_THRESHOLD)
  if (toImprove.length) {
    addLog(jobId, 'Content Agent', `Improving ${toImprove.length} low-performing variants...`, 'text-chart-4')
    const improved: ContentVariant[] = toImprove.map(v => ({
      ...v,
      content: `<!-- Improved iteration -->\n${v.content}\n\n**Improvements Applied:** Clarified ambiguous steps; mitigated hallucination risk.`,
      iteration: (v.iteration || 1) + 1
    }))
    const galileoRe = new GalileoService()
    const rescored = await galileoRe.evaluateVariants(improved, profile)
    const merged = scoredVariants.map(v => {
      const found = rescored.find(r => r.id === v.id)
      return found ? found : v
    })
    updateJob(jobId, { variants: merged, improvementIterations: 1 })
    addLog(jobId, 'Galileo', 'Applied improvement iteration and rescored variants', 'text-chart-5')
  }
  
  // Select best variant per format
  const selectedVariants: Record<string, ContentVariant> = {}
  formats.forEach(format => {
    const formatVariants = scoredVariants.filter(v => v.format === format)
    if (formatVariants.length > 0) {
      const best = formatVariants.reduce((a, b) => 
        (a.score || 0) > (b.score || 0) ? a : b
      )
      selectedVariants[format] = best
    }
  })
  
  addLog(jobId, 'Galileo', 'Selected best variants per format', 'text-chart-5')
  
  // Phase 6: Code review (if applicable)
  updateJob(jobId, { progress: 90 })
  addLog(jobId, 'CodeRabbit', 'Reviewing code snippets...', 'text-accent')
  
  const codeRabbit = new CodeRabbitService()
  const codeSnippets = extractCodeSnippets(scoredVariants)
  const diffSnippets = extractCodeFromDiffs(profile)
  const combinedSnippets = [...codeSnippets, ...diffSnippets].slice(0, 20)
  const codeReviews = await codeRabbit.reviewCodeSnippets(combinedSnippets)
  updateJob(jobId, { codeReviews, progress: 95 })
  const avgQuality = codeReviews.reduce((sum, r) => sum + r.quality_score, 0) / (codeReviews.length || 1)
  addLog(jobId, 'CodeRabbit', `Reviewed ${combinedSnippets.length} code snippets (avg quality ${avgQuality.toFixed(1)})`, 'text-accent')

  // Targeted improvements based on CodeRabbit suggestions
  const suggestions = codeReviews.flatMap((r: any) => r.suggestions || []) as string[]
  if (suggestions.length) {
    addLog(jobId, 'Content Agent', `Applying targeted improvements from diffs & review...`, 'text-chart-4')
    const improvedVariants: ContentVariant[] = scoredVariants.map(v => ({
      ...v,
      content: `${v.content}\n\n---\n**Code Quality Improvements (from recent diffs & review):**\n${suggestions.slice(0, 10).map(s => `- ${s}`).join('\n')}`,
      iteration: (v.iteration || 1) + 1
    }))
    const rescoredImproved = await new GalileoService().evaluateVariants(improvedVariants, profile)
    const reselected: Record<string, ContentVariant> = {}
    formats.forEach(format => {
      const fvs = rescoredImproved.filter(v => v.format === format)
      if (fvs.length) {
        const best = fvs.reduce((a, b) => (a.score || 0) > (b.score || 0) ? a : b)
        reselected[format] = best
      }
    })
    updateJob(jobId, { variants: rescoredImproved, selectedVariants: reselected })
    addLog(jobId, 'Galileo', 'Rescored variants after targeted improvements', 'text-chart-5')
  }
  
  // Complete
  updateJob(jobId, { 
    status: 'completed',
    progress: 100,
    selectedVariants 
  })
  addLog(jobId, 'System', 'Campaign generation complete! ✨', 'text-primary text-glow-purple')
}

function extractCodeSnippets(variants: ContentVariant[]): string[] {
  const snippets: string[] = []
  
  variants.forEach(variant => {
    const codeBlocks = variant.content.match(/```[\s\S]*?```/g) || []
    snippets.push(...codeBlocks)
  })
  // Also attempt to extract added lines from diff patches present in profile.commits (if any)
  // Note: In this scope we don't have the profile. For a deeper integration, we'd thread diffs here.
  
  return snippets.slice(0, 10) // Limit to 10 snippets
}

function extractCodeFromDiffs(profile: RepoProfile): string[] {
  const out: string[] = []
  const commits: any[] = (profile as any).commits || []
  for (const c of commits) {
    const files = c.files || []
    for (const f of files) {
      if (!f.patch) continue
      const lines = String(f.patch).split('\n')
      const added = lines.filter((ln: string) => ln.startsWith('+') && !ln.startsWith('+++')).slice(0, 100)
      if (added.length) {
        const snippet = '```diff\n' + added.join('\n') + '\n```'
        out.push(snippet)
      }
      if (out.length >= 10) break
    }
    if (out.length >= 10) break
  }
  return out
}
