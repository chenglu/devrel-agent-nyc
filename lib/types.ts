// Core type definitions for DevRel Campaign Generator

export type RepoProfile = {
  url: string
  owner: string
  name: string
  description: string
  languages: Record<string, number>
  primaryLanguage: string
  stars: number
  forks: number
  structure: {
    hasReadme: boolean
    hasDocs: boolean
    hasExamples: boolean
    keyDirectories: string[]
  }
  readme: string
  mainFeatures: string[]
  technicalStack: string[]
  quickstartPath?: string
  // Recent commits (optional, fetched separately)
  commits?: RepoCommit[]
  extractedAt: string
  version: string
}

export type RepoCommit = {
  sha: string
  message: string
  author: string
  date: string
  url: string
  files?: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
    changes: number
    patch?: string
  }>
}

export type ContentVariant = {
  id: string
  format: ContentFormat
  content: string
  score?: number
  hallucination_risk?: number
  coherence_score?: number
  // Extended multi-metric evaluation (Galileo mock)
  evaluationMetrics?: EvaluationMetrics
  // Code review summary applied to this variant
  codeReviewSummary?: CodeReviewSummary
  // Iteration label (e.g., initial, improved)
  iteration?: number
}

export type ContentFormat = 
  | 'tutorial'
  | 'blog'
  | 'talk'
  | 'twitter'
  | 'linkedin'
  | 'hackathon'

export type ExecutionReport = {
  passed: boolean
  runtime: number
  output: string
  errors?: string[]
  retries: number
}

export type ExecutionMatrixEntry = {
  script: string
  passed: boolean
  time: number
  logExcerpt: string
  retries: number
}

export type CodeReview = {
  snippet_id: string
  quality_score: number
  issues: string[]
  suggestions: string[]
  reviewed_at: string
}

export type CodeReviewSummary = {
  totalSnippets: number
  avgQuality: number
  issueCategories: Record<string, number>
  suggestionCount: number
}

export type EvaluationMetrics = {
  clarity: number
  technicalAccuracy: number
  audienceFit: number
  actionability: number
  originality: number
  hallucinationRisk: number
}

export type GenerationJob = {
  id: string
  repoUrl: string
  status: 'pending' | 'analyzing' | 'validating' | 'generating' | 'evaluating' | 'completed' | 'failed'
  progress: number
  timeRange?: '1week' | '1month' | '3months' | '6months' | '1year'
  profile?: RepoProfile
  variants?: ContentVariant[]
  selectedVariants?: Record<ContentFormat, ContentVariant>
  executionReport?: ExecutionReport
  codeReviews?: CodeReview[]
  executionMatrix?: ExecutionMatrixEntry[]
  improvementIterations?: number
  error?: string
  createdAt: string
  updatedAt: string
  logs: LogEntry[]
}

export type LogEntry = {
  id: number
  agent: string
  message: string
  color: string
  timestamp: string
}
