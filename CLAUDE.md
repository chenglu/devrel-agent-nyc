# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevRel Campaign Generator is an AI-powered Next.js 16 application that transforms GitHub repositories into complete DevRel campaigns. It uses a multi-agent pipeline to generate tutorials, blog posts, conference talks, social media content, and hackathon challenges—all validated for accuracy and quality.

## Development Commands

```bash
pnpm dev      # Start development server (localhost:3000)
pnpm build    # Production build
pnpm start    # Run production server
pnpm lint     # Run ESLint (TS errors ignored via next.config.mjs)
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Required: `ANTHROPIC_API_KEY` (for content generation)
3. Optional: `GITHUB_TOKEN`, `DAYTONA_API_KEY`, `CODERABBIT_API_KEY`, `GALILEO_API_KEY`, `ELEVENLABS_API_KEY`

**Service Fallback Pattern**: All services gracefully fallback to mock data when API keys are missing. The system continues to function with reduced capabilities rather than failing.

## Architecture Overview

### Multi-Agent Pipeline

The core workflow is a sequential pipeline managed in `app/api/generate/route.ts`:

1. **Understanding Agent** (`lib/github.ts`) - Fetches repo metadata, README, languages, and recent commits with diffs
2. **Claude** (`lib/services.ts: ClaudeService`) - Extracts repo profile and generates 2 variants per content format
3. **Daytona** (`lib/services.ts: DaytonaService`) - Validates code examples in ephemeral environments (currently mocked)
4. **Galileo** (`lib/services.ts: GalileoService`) - Multi-metric evaluation: clarity, technical accuracy, audience fit, actionability, originality, hallucination risk
5. **CodeRabbit** (`lib/services.ts: CodeRabbitService`) - Reviews code snippets from variants and commit diffs
6. **Improvement Loop** - Low-performing variants (<70 score or >0.1 hallucination risk) are improved and rescored

### Key Files

- `app/api/generate/route.ts` - Pipeline orchestration, POST endpoint creates job and starts async processing
- `app/api/status/[jobId]/route.ts` - Polling endpoint for real-time progress/logs
- `lib/jobs.ts` - In-memory job state (Map-based, non-persistent, 1h auto-cleanup)
- `lib/services.ts` - Service adapters with fallback pattern
- `lib/types.ts` - Core type definitions (`GenerationJob`, `ContentFormat`, `RepoProfile`, `ContentVariant`)
- `lib/github.ts` - GitHub API integration (metadata + recent commits with diffs)
- `app/page.tsx` - Client-side dashboard with 1s polling interval

### Data Flow

```
User submits repo URL
  ↓
POST /api/generate creates job (pending)
  ↓
processGeneration() runs async:
  → GitHub fetch (metadata + commits)
  → Claude profile extraction
  → Claude variant generation (2 per format)
  → Galileo evaluation & scoring
  → Improvement iteration (if needed)
  → CodeRabbit review
  → Targeted improvements from diffs
  → Select best variant per format
  ↓
Frontend polls GET /api/status/[jobId] every 1s
```

## Service Adapter Pattern

All external services follow this pattern (see `lib/services.ts`):

```typescript
export class ServiceName {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.SERVICE_API_KEY || ''
    // Validate key if required, or allow empty for mock fallback
  }

  async method(): Promise<Result> {
    if (!this.apiKey) {
      return this.mockMethod() // Fallback to mock
    }

    try {
      // Real API call with proper error handling
      const response = await fetch(...)
      const ct = response.headers.get('content-type') || ''
      if (!response.ok || !ct.includes('application/json')) {
        throw new Error(`API bad response: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Service failed:', error)
      return this.mockMethod() // Graceful degradation
    }
  }

  private mockMethod() {
    // Return realistic mock data
  }
}
```

## Job State Management

Jobs are stored in-memory (non-persistent):
- `createJob(repoUrl)` - Initialize with ID, timestamps, empty logs
- `updateJob(jobId, updates)` - Atomic field updates
- `addLog(jobId, agent, message, color)` - Append timestamped log entry
- Auto-cleanup after 1 hour via `startJobCleanup()`

**Important**: Server restarts lose all jobs. For persistence, implement Redis/DB storage.

## Content Generation

Content is generated with focus on **recent updates** (see `lib/services.ts: getPromptForFormat()`):
- Recent commits are fetched based on `timeRange` parameter (1week to 1year)
- Prompts emphasize "What's New" and latest features (70-80% of content)
- Tutorial/Blog/Talk formats highlight recent changes from commit history
- Commit diffs are extracted and used for code review grounding

### Content Formats

Defined in `lib/types.ts: ContentFormat`:
- `tutorial` - Step-by-step guide focusing on latest features
- `blog` - Technical blog post announcing updates
- `talk` - 30-45min conference/meetup outline
- `twitter` - 5-7 tweet thread
- `linkedin` - Professional post for technical leadership
- `hackathon` - Challenge using latest capabilities

## UI Conventions

- **Dark mode forced**: `<html className="dark">` in `app/layout.tsx` - do not remove
- **Cyberpunk theme**: OKLCH palette in `app/globals.css` with glow utilities (`glow-purple`, `text-glow-green`)
- **Responsive layout**: `h-[calc(100vh-12rem)]`, `lg:col-span-2/3` patterns
- **Content rendering**: Use `whitespace-pre-wrap` to preserve markdown formatting
- **Polling cleanup**: Must clear interval on unmount to prevent memory leaks

## Path Aliases

All imports use `@/` alias (configured in `tsconfig.json`):
```typescript
import { createJob } from '@/lib/jobs'
import type { ContentFormat } from '@/lib/types'
```

## Adding New Features

### New Content Format
1. Add to `ContentFormat` union in `lib/types.ts`
2. Add prompt logic in `ClaudeService.getPromptForFormat()`
3. Add fallback content in `ClaudeService.generateFallbackContent()`
4. Update frontend: Add TabsTrigger + TabsContent in `app/page.tsx`

### New External Service
1. Create adapter class in `lib/services.ts` following service pattern above
2. Add to pipeline in `app/api/generate/route.ts` with `addLog()` calls
3. Extend `GenerationJob` type cautiously (use optional fields)
4. Update UI to display results if needed

## Common Pitfalls

- **Missing API key handling**: Never crash server on missing keys—log error and use mock fallback
- **Polling interval cleanup**: Forgetting to clear interval causes duplicate polling after navigation
- **Theme class removal**: Removing glow/theme classes causes visual regression
- **Large repos**: Current code limits to README + 50 commits + 5 diffs—keep lightweight
- **Job mutation**: Always fetch via helper, mutate, then set back for atomicity
- **Blocking event loop**: Wrap long operations in async steps

## Log Color Taxonomy

Standardized colors for agent logs (see `addLog()` calls):
- `text-primary` - System/Claude messages
- `text-accent` - Daytona/CodeRabbit
- `text-chart-3` - Understanding Agent (green)
- `text-chart-4` - Content Agent (orange)
- `text-chart-5` - Galileo/warnings (yellow)
- `text-glow-purple` - Success highlights

## Current Phase Status

**Implemented**:
- GitHub repo ingestion with commit history
- Claude profile extraction & content generation
- Real-time job tracking with polling
- Mock service integrations with graceful fallback
- Improvement iterations based on quality scores
- Code review integration using commit diffs

**Planned (Phase 2-3)**:
- Real Daytona workspace validation
- Real CodeRabbit/Galileo API integration
- ElevenLabs voice synthesis (service exists in `lib/services.ts`)
- Redis/DB job persistence
- Content export/download
