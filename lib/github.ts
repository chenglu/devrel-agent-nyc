// GitHub repository analysis utilities

export async function fetchGitHubRepo(repoUrl: string) {
  // Extract owner and repo name from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) {
    throw new Error('Invalid GitHub URL')
  }

  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  }
  
  if (token) {
    headers['Authorization'] = `token ${token}`
  }

  // Fetch repository metadata
  const repoResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}`,
    { headers }
  )

  if (!repoResponse.ok) {
    throw new Error(`GitHub API error: ${repoResponse.statusText}`)
  }

  const repoData = await repoResponse.json()

  // Fetch languages
  const languagesResponse = await fetch(repoData.languages_url, { headers })
  const languages = await languagesResponse.json()

  // Fetch README
  let readme = ''
  try {
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/readme`,
      { headers: { ...headers, 'Accept': 'application/vnd.github.raw' } }
    )
    if (readmeResponse.ok) {
      readme = await readmeResponse.text()
    }
  } catch (error) {
    console.warn('README not found')
  }

  // Fetch repository tree to analyze structure
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/trees/${repoData.default_branch}?recursive=1`,
    { headers }
  )
  
  const treeData = await treeResponse.json()
  const files = treeData.tree || []

  const structure = analyzeRepoStructure(files)

  return {
    full_name: repoData.full_name,
    owner,
    name: repoName,
    description: repoData.description || '',
    languages,
    primaryLanguage: repoData.language || 'Unknown',
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    readme,
    structure,
    url: repoUrl
  }
}

// Helper: compute ISO since date for a given window
export function getSinceISO(range: '1week'|'1month'|'3months'|'6months'|'1year'): string {
  const now = new Date()
  const d = new Date(now)
  switch (range) {
    case '1week': d.setDate(now.getDate() - 7); break
    case '1month': d.setMonth(now.getMonth() - 1); break
    case '3months': d.setMonth(now.getMonth() - 3); break
    case '6months': d.setMonth(now.getMonth() - 6); break
    case '1year': d.setFullYear(now.getFullYear() - 1); break
  }
  return d.toISOString()
}

// Fetch recent commits (optionally in a date range)
export async function fetchRecentCommits(repoUrl: string, limit: number = 10, sinceISO?: string, untilISO?: string) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  }
  if (token) headers['Authorization'] = `token ${token}`

  try {
    const params = new URLSearchParams()
    params.set('per_page', String(limit))
    if (sinceISO) params.set('since', sinceISO)
    if (untilISO) params.set('until', untilISO)
    const url = `https://api.github.com/repos/${owner}/${repoName}/commits?${params.toString()}`
    const commitsResp = await fetch(url, { headers })
    if (!commitsResp.ok) throw new Error('Commits fetch failed')
    const commitsData = await commitsResp.json()
    return commitsData.map((c: any) => ({
      sha: c.sha,
      message: (c.commit && c.commit.message) || '',
      author: (c.commit && c.commit.author && c.commit.author.name) || (c.author && c.author.login) || 'unknown',
      date: (c.commit && c.commit.author && c.commit.author.date) || '',
      url: c.html_url
    }))
  } catch (e) {
    console.warn('Recent commits unavailable:', (e as Error).message)
    return []
  }
}

// Fetch changed files for a single commit (limited)
export async function fetchCommitFiles(repoUrl: string, sha: string) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' }
  if (token) headers['Authorization'] = `token ${token}`

  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits/${sha}`, { headers })
    if (!resp.ok) throw new Error('Commit detail fetch failed')
    const data = await resp.json()
    const files = Array.isArray(data.files) ? data.files : []
    return files.map((f: any) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch
    }))
  } catch (e) {
    console.warn(`Commit files unavailable for ${sha}:`, (e as Error).message)
    return []
  }
}

function analyzeRepoStructure(files: any[]) {
  const paths = files.map((f: any) => f.path.toLowerCase())
  
  const hasReadme = paths.some(p => p === 'readme.md' || p === 'readme.txt')
  const hasDocs = paths.some(p => p.startsWith('docs/') || p.startsWith('documentation/'))
  const hasExamples = paths.some(p => p.startsWith('examples/') || p.startsWith('example/'))
  
  // Extract key directories (top-level only)
  const directories = new Set<string>()
  files.forEach((f: any) => {
    if (f.type === 'tree') {
      const parts = f.path.split('/')
      if (parts.length === 1) {
        directories.add(parts[0])
      }
    }
  })

  return {
    hasReadme,
    hasDocs,
    hasExamples,
    keyDirectories: Array.from(directories).sort()
  }
}
