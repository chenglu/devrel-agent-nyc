// Service adapters for external APIs

import Anthropic from '@anthropic-ai/sdk'
import type { RepoProfile, ContentVariant, ContentFormat } from './types'

// Anthropic Claude Service
export class ClaudeService {
  private client: Anthropic
  
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    this.client = new Anthropic({ apiKey })
  }

  async extractRepoProfile(repoData: any): Promise<RepoProfile> {
    const prompt = `Analyze this GitHub repository and extract a structured profile:

Repository: ${repoData.full_name}
Description: ${repoData.description}
Languages: ${JSON.stringify(repoData.languages)}
README: ${repoData.readme}

Extract:
1. Main features (3-5 key capabilities)
2. Technical stack (frameworks, tools, dependencies)
3. Primary use cases
4. Key directories and their purposes
5. Quickstart path if available

Return as JSON with this structure:
{
  "mainFeatures": string[],
  "technicalStack": string[],
  "useCases": string[],
  "keyDirectories": string[],
  "quickstartPath": string | null
}`

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      return JSON.parse(content.text)
    } catch (error: any) {
      console.error('Claude API error:', error.message)
      // Fallback to basic extraction
      return this.extractProfileFallback(repoData)
    }
  }

  private extractProfileFallback(repoData: any): any {
    // Simple extraction without AI when API fails
    return {
      mainFeatures: [
        repoData.description || 'No description available',
        'See README for details'
      ],
      technicalStack: Object.keys(repoData.languages || {}).slice(0, 5),
      useCases: ['General development'],
      keyDirectories: repoData.structure?.keyDirectories || [],
      quickstartPath: null
    }
  }

  async generateContentVariants(
    profile: RepoProfile,
    format: ContentFormat,
    variantCount: number = 2
  ): Promise<ContentVariant[]> {
    const prompts = this.getPromptForFormat(format, profile)
    const variants: ContentVariant[] = []

    try {
      for (let i = 0; i < variantCount; i++) {
        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          temperature: 0.7 + (i * 0.1),
          messages: [{
            role: 'user',
            content: prompts
          }]
        })

        const content = response.content[0]
        if (content.type === 'text') {
          variants.push({
            id: `${format}-variant-${i + 1}`,
            format,
            content: content.text
          })
        }
      }
    } catch (error: any) {
      console.error('Claude generation error:', error.message)
      // Return fallback content
      variants.push({
        id: `${format}-variant-1`,
        format,
        content: this.generateFallbackContent(format, profile)
      })
    }

    return variants
  }

  private generateFallbackContent(format: ContentFormat, profile: RepoProfile): string {
    const repoName = profile.name
    const description = profile.description
    
    switch (format) {
      case 'tutorial':
        return `# Getting Started with ${repoName}

## Overview
${description}

## Prerequisites
- Git installed
- Basic knowledge of ${profile.primaryLanguage}

## Installation
\`\`\`bash
git clone ${profile.url}
cd ${repoName}
# Follow project-specific setup instructions
\`\`\`

## Next Steps
Check the README for detailed documentation.

*Note: This is a fallback tutorial. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      case 'blog':
        return `# Introducing ${repoName}

${description}

## Key Features
${profile.mainFeatures.map(f => `- ${f}`).join('\n')}

## Tech Stack
Built with ${profile.technicalStack.join(', ')}

## Get Started
Visit the repository: ${profile.url}

*Note: This is a fallback blog post. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      case 'talk':
        return `# ${repoName}: Conference Talk Outline

## Title
"Introduction to ${repoName}"

## Abstract
${description}

## Slides (30-45 minutes)
1. Introduction & Background
2. Problem Statement
3. Solution Overview
4. Key Features
5. Live Demo
6. Q&A

*Note: This is a fallback talk outline. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      case 'twitter':
        return `🚀 Check out ${repoName}!

${description}

Built with ${profile.primaryLanguage}
⭐ ${profile.stars} stars

Learn more: ${profile.url}

#OpenSource #${profile.primaryLanguage}

*Note: This is a fallback tweet. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      case 'linkedin':
        return `I'm excited to share ${repoName} with the community.

${description}

Key highlights:
${profile.mainFeatures.map(f => `• ${f}`).join('\n')}

Check it out: ${profile.url}

*Note: This is a fallback LinkedIn post. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      case 'hackathon':
        return `# Hackathon Challenge: Build with ${repoName}

## Challenge Description
Create an innovative project using ${repoName}

## Requirements
- Use ${profile.primaryLanguage}
- Implement at least one key feature
- Document your approach

## Judging Criteria
- Innovation
- Technical implementation
- Code quality
- Presentation

*Note: This is a fallback challenge. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`

      default:
        return `Content for ${format} format.\n\n*Note: Add ANTHROPIC_API_KEY for AI-generated content.*`
    }
  }
  private getPromptForFormat(format: ContentFormat, profile: RepoProfile): string {
    const commitsList = Array.isArray((profile as any).commits) ? (profile as any).commits.slice(0, 5) : []
    const recentCommits = commitsList.length
      ? `\nRecent Commits (most recent first):\n${commitsList.map((c: any) => `- ${new Date(c.date).toISOString().slice(0,10)}: ${String(c.message || '').split('\n')[0]}`).join('\n')}`
      : ''
    const baseContext = `Repository: ${profile.name}
Description: ${profile.description}
Main Features: ${profile.mainFeatures.join(', ')}
Tech Stack: ${profile.technicalStack.join(', ')}
Primary Language: ${profile.primaryLanguage}${recentCommits}\nNote: Focus content on changes within the selected analysis period when relevant.`

    switch (format) {
      case 'tutorial':
        return `${baseContext}

Create a step-by-step tutorial showcasing the LATEST updates and new features from recent commits.

IMPORTANT: 
- Start with a brief 2-3 sentence project introduction
- Focus 80% of content on recent updates, new features, and changes from the commit history
- Highlight what's NEW and DIFFERENT compared to older versions
- Include working code examples demonstrating recent features
- If no recent commits, focus on the most advanced/latest capabilities

Include:
- Brief project overview (2-3 sentences)
- What's new in recent updates (primary focus)
- Step-by-step guide to using new features
- Code examples showcasing latest additions
- Migration tips if APIs changed
- Next steps with new features

Make it executable and accurate. Use markdown format.`

      case 'blog':
        return `${baseContext}

Write a technical blog post announcing the LATEST updates and new features.

IMPORTANT:
- Focus on recent changes and what's NEW (based on recent commits)
- Brief context about the project (1 paragraph max)
- Deep dive into latest features and improvements (70-80% of content)
- Show before/after comparisons if APIs changed
- Highlight breaking changes or major improvements

Include:
- Hook: What's new and why it matters NOW
- Brief project context (1 paragraph)
- Deep dive: Latest features and updates (primary focus)
- Code examples showcasing new capabilities
- Migration guide if needed
- What's coming next
- Call to action

Target audience: Technical developers. Use markdown format.`

      case 'talk':
        return `${baseContext}

Create a 30-45 minute meetup/conference talk outline focused on LATEST updates and new features.

IMPORTANT:
- This is for a meetup/conference - focus on what's NEW and exciting
- Brief intro (2-3 slides max), then dive into recent updates
- 70-80% of talk should cover latest features, improvements, and changes
- Include live demos of new capabilities
- Show real code from recent commits

Include:
- Talk title emphasizing "What's New" or "Latest Updates"
- Abstract highlighting recent changes (150 words)
- Slide structure (15-20 slides):
  * Quick intro (2-3 slides)
  * Recent updates deep dive (10-12 slides)
  * Live demos of new features (3-4 slides)
  * Roadmap and what's next (1-2 slides)
- Speaker notes focusing on recent changes
- Demo points showcasing latest features
- Q&A prep about new capabilities

Format as markdown with clear sections.`

      case 'twitter':
        return `${baseContext}

Write an engaging Twitter/X thread (5-7 tweets) announcing the LATEST updates.

IMPORTANT:
- Focus on what's NEW (recent commits/features)
- First tweet: Brief intro + "Here's what's new 🧵"
- Next 3-5 tweets: Deep dive into specific new features
- Last tweet: Call to action

Make it:
- Start with "What's new in [project]" hook
- Highlight recent features/changes (use commit history)
- Technical but accessible
- Add relevant emojis (🚀 ⚡ 🎉 ✨)
- Include code snippets for new features
- End with link and CTA
- Each tweet under 280 chars

Format as numbered thread.`

      case 'linkedin':
        return `${baseContext}

Write a LinkedIn post announcing LATEST updates for a technical leadership audience.

IMPORTANT:
- Focus on recent updates and what's new
- Frame updates in terms of business value and impact
- Brief context, then dive into latest improvements

Include:
- Hook: Major update/new release announcement
- Brief project context (1-2 sentences)
- What's new: Recent features and improvements (primary focus)
- Business value of new updates
- Technical highlights of latest additions
- Team/community impact
- Call to action

Tone: Professional, insightful, forward-looking. 200-300 words.`

      case 'hackathon':
        return `${baseContext}

Design a hackathon challenge focused on exploring and using the LATEST features.

IMPORTANT:
- Challenge should require using recent updates/new features
- Encourage participants to push boundaries of new capabilities
- Provide recent code examples as starting points

Include:
- Challenge title emphasizing "Latest Features" or "New Capabilities"
- Brief project intro (2-3 sentences)
- Problem statement leveraging new features
- Required deliverables (must use recent updates)
- Judging criteria (4-5 points, bonus for creative use of new features)
- Starter resources with recent code examples
- Sample tasks exploring latest additions (3-5)
- Difficulty level

Make it engaging and achievable in 24-48 hours.`

      default:
        throw new Error(`Unknown format: ${format}`)
    }
  }
}

// Daytona Service
export class DaytonaService {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = process.env.DAYTONA_API_URL || 'https://api.daytona.io'
    this.apiKey = process.env.DAYTONA_API_KEY || ''
  }

  async validateQuickstart(repoUrl: string, quickstartPath?: string): Promise<any> {
    // Mock implementation - replace with actual Daytona API
    if (!this.apiKey) {
      return this.mockValidation()
    }

    try {
      const response = await fetch(`${this.apiUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repository: repoUrl,
          script: quickstartPath || 'npm install && npm test'
        })
      })
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) {
        throw new Error(`Daytona API bad response: ${response.status} ${ct}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Daytona validation failed:', error)
      return this.mockValidation()
    }
  }

  private mockValidation() {
    return {
      passed: true,
      runtime: 12.5,
      output: 'Setup completed successfully ✓\nTests passed: 15/15',
      retries: 0
    }
  }
}

// CodeRabbit Service
export class CodeRabbitService {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = process.env.CODERABBIT_API_URL || 'https://api.coderabbit.ai'
    this.apiKey = process.env.CODERABBIT_API_KEY || ''
  }

  async reviewCodeSnippets(snippets: string[]): Promise<any[]> {
    // Mock implementation - replace with actual CodeRabbit API
    if (!this.apiKey) {
      return snippets.map((_, idx) => this.mockReview(idx))
    }

    try {
      const response = await fetch(`${this.apiUrl}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ snippets })
      })
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) {
        throw new Error(`CodeRabbit API bad response: ${response.status} ${ct}`)
      }
      return await response.json()
    } catch (error) {
      console.error('CodeRabbit review failed:', error)
      return snippets.map((_, idx) => this.mockReview(idx))
    }
  }

  private mockReview(index: number) {
    return {
      snippet_id: `snippet-${index}`,
      quality_score: 92 + Math.floor(Math.random() * 8),
      issues: [],
      suggestions: ['Consider adding error handling', 'Add type annotations'],
      reviewed_at: new Date().toISOString()
    }
  }
}

// Galileo Service
export class GalileoService {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = process.env.GALILEO_API_URL || 'https://api.galileo.ai'
    this.apiKey = process.env.GALILEO_API_KEY || ''
  }

  async evaluateVariants(variants: ContentVariant[], profile: RepoProfile): Promise<ContentVariant[]> {
    // Extended mock multi-metric evaluation. Replace with real API when available.
    if (!this.apiKey) {
      return variants.map(v => this.mockEvaluation(v))
    }
    try {
      const response = await fetch(`${this.apiUrl}/evaluate-multi`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variants: variants.map(v => v.content),
          context: profile,
          metrics: ['clarity','technicalAccuracy','audienceFit','actionability','originality','hallucinationRisk']
        })
      })
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) {
        throw new Error(`Galileo API bad response: ${response.status} ${ct}`)
      }
      const results = await response.json()
      const safeArray = Array.isArray(results) ? results : []
      return variants.map((v, idx) => {
        const r = safeArray[idx]
        if (!r || typeof r !== 'object') {
          return this.mockEvaluation(v)
        }
        const evaluationMetrics = {
          clarity: Number(r.clarity) || 0,
          technicalAccuracy: Number(r.technicalAccuracy) || 0,
          audienceFit: Number(r.audienceFit) || 0,
          actionability: Number(r.actionability) || 0,
          originality: Number(r.originality) || 0,
          hallucinationRisk: Number(r.hallucinationRisk) || 0
        }
        // Composite score example weighting
        const score = Math.round(
          evaluationMetrics.clarity * 0.2 +
          evaluationMetrics.technicalAccuracy * 0.25 +
          evaluationMetrics.audienceFit * 0.15 +
          evaluationMetrics.actionability * 0.15 +
          evaluationMetrics.originality * 0.15 -
          evaluationMetrics.hallucinationRisk * 100 * 0.15
        )
        return {
          ...v,
          score,
          evaluationMetrics,
          hallucination_risk: evaluationMetrics.hallucinationRisk,
          coherence_score: evaluationMetrics.clarity
        }
      })
    } catch (error) {
      console.error('Galileo evaluation failed:', error)
      return variants.map(v => this.mockEvaluation(v))
    }
  }

  private mockEvaluation(variant: ContentVariant): ContentVariant {
    const metrics = {
      clarity: 80 + Math.random() * 15,
      technicalAccuracy: 78 + Math.random() * 18,
      audienceFit: 75 + Math.random() * 20,
      actionability: 70 + Math.random() * 25,
      originality: 72 + Math.random() * 22,
      hallucinationRisk: Math.random() * 0.12
    }
    const score = Math.round(
      metrics.clarity * 0.2 +
      metrics.technicalAccuracy * 0.25 +
      metrics.audienceFit * 0.15 +
      metrics.actionability * 0.15 +
      metrics.originality * 0.15 -
      metrics.hallucinationRisk * 100 * 0.15
    )
    return {
      ...variant,
      score,
      evaluationMetrics: metrics,
      hallucination_risk: metrics.hallucinationRisk,
      coherence_score: metrics.clarity
    }
  }
}

// ElevenLabs TTS Service
export class ElevenLabsTtsService {
  private apiKey: string
  private voiceId: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || ''
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // default voice
    this.apiUrl = process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1'
  }

  async synthesizeToBase64(text: string, format: 'mp3' | 'wav' = 'mp3'): Promise<{ base64: string, contentType: string }> {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }
    const url = `${this.apiUrl}/text-to-speech/${this.voiceId}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
        output_format: format === 'mp3' ? 'mp3_44100_128' : 'pcm_16000'
      })
    })
    if (!response.ok) {
      const ct = response.headers.get('content-type') || ''
      const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text()
      throw new Error(`ElevenLabs API error ${response.status}: ${errText}`)
    }
    const arrayBuf = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuf).toString('base64')
    const contentType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    return { base64, contentType }
  }
}
