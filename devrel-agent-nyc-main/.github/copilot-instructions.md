# DevRel Campaign Generator – Copilot Instructions (Concise)

Purpose: Enable AI agents to rapidly contribute code & features for this Next.js 16 + Claude-powered DevRel content generator.

## 1. Core Architecture
- App Router: `app/` (server components + a single client dashboard `page.tsx`).
- Pipeline entry: `POST /api/generate` (`app/api/generate/route.ts`).
- Status polling: `GET /api/status/[jobId]` (`app/api/status/[jobId]/route.ts`).
- Services/adapters: `lib/services.ts` (Claude + mocked Daytona, CodeRabbit, Galileo). Graceful mock fallback if API key missing.
- Job state: `lib/jobs.ts` (in‑memory Map, auto cleanup after 1h). Non‑persistent (restart loses jobs).
- Repo ingest: `lib/github.ts` (README, languages, basic metadata).

## 2. Data Flow (Generation Job)
User action → `generate` route creates job (ID + initial log) → GitHub fetch → Claude profile & variants → mock validation & scoring → selection → status endpoint streams progress/logs until `completed`.

## 3. Key Types (`lib/types.ts`)
- `GenerationJob`: { id, status, progress, logs[], variants, selections }.
- `ContentFormat`: union of supported formats (add here first when extending).
- `RepoProfile`, `ContentVariant` define analysis + generated artifact shape.

## 4. Development Workflow
```bash
pnpm dev      # run locally (localhost:3000)
pnpm build    # production build
pnpm start    # run production output
pnpm lint     # lint (TS build errors ignored via next.config.mjs)
```
Env setup: copy `.env.example` → `.env.local`; populate `ANTHROPIC_API_KEY` (required for real generation), optional `GITHUB_TOKEN` for rate limits; other service keys currently optional/mocked.

## 5. Conventions & Patterns
- Imports: always use path alias `@/` (configured in `tsconfig.json`).
- API service pattern: constructor validates key; real call in try/catch; fallback mock object on error/missing key (see Claude section in `lib/services.ts`).
- Polling: 1s interval in `app/page.tsx`; must clear on unmount (memory leak risk).
- Styling: Cyberpunk OKLCH palette & glow utilities in `app/globals.css`; preserve classnames like `glow-purple`, `text-glow-green`.
- Dark mode forced: `<html className="dark">` in `app/layout.tsx` (do not remove).
- Content rendering: use `whitespace-pre-wrap` to keep Markdown formatting.
- Height/layout: viewport math classes (`h-[calc(100vh-12rem)]`) + responsive grid (`lg:col-span-2` / `lg:col-span-3`).

## 6. Adding a New Content Format
1. Extend `ContentFormat` union in `lib/types.ts`.
2. Add prompt logic in Claude adapter (create helper or extend existing method).
3. Update request body builder in frontend to include new format.
4. Add UI tab (TabsTrigger + TabsContent) in `app/page.tsx`.

## 7. Adding a New External Service
1. Create adapter in `lib/services.ts` (follow existing constructor + fallback pattern).
2. Insert into pipeline in `app/api/generate/route.ts` with log entries via `addLog(jobId, agent, message, color)`.
3. Return structured results appended to job (extend `GenerationJob` cautiously—add optional fields).

## 8. Common Pitfalls
- Missing `ANTHROPIC_API_KEY` ⇒ job logs error; variants won’t generate (others still mock). Provide clear log message, do not crash server.
- Forgetting interval cleanup ⇒ duplicate polling after navigation.
- Removing glow/theme classes ⇒ visual regression (avoid).
- Large repos: limit GitHub fetch scope; current code grabs README + languages only—keep lightweight.

## 9. Safe Modification Guidelines
- Keep job mutation atomic: fetch job via helper, mutate fields, then set back (see `lib/jobs.ts`).
- Never block the event loop with long synchronous logic—wrap in async steps.
- Preserve existing log color taxonomy (`text-primary`, `text-accent`, `text-chart-*`).

## 10. Example: Add a Log Entry
```ts
import { addLog } from '@/lib/jobs'
addLog(jobId, 'galileo', 'Scoring variants', 'text-chart-4')
```

## 11. When Extending Types
- Add optional fields to avoid breaking existing consumers in `app/page.tsx`.
- Update only the minimal UI section that reads them (search for property name with grep before broad changes).

## 12. Non-Goals (Current Phase)
- Persistent storage (Redis/DB) – planned, not implemented.
- Real execution environments (Daytona) – mocked.
- Real hallucination scoring (Galileo) – mocked.

Focus contributions on: new formats, service adapter scaffolding, UI clarity, robustness of logging & error messaging.

---
Questions or unclear patterns? Propose changes with rationale in PR description.
