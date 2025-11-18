# Project Brief: DevRel Campaign Generator

## 1. Vision & Executive Summary (ELICIT)

**Pitch Line**  
Turn any GitHub repo into a complete DevRel campaign in minutes, with high-quality content tailored to every developer touchpoint.

**What It Does**  
Ingests a repository, builds a factual project profile (structure, key modules, feature surfaces), and auto-generates multi‑format, channel‑optimized developer relations assets (tutorial, blog, talk outline, Twitter/X thread, LinkedIn post, hackathon theme) with accuracy validation, multi‑variant evaluation, and rapid environment spin‑ups.

**Why It Matters**  
DevRel & OSS teams spend significant time distilling repos into coherent narratives. This platform compresses hours of manual synthesis, writing, reviewing, and technical validation into a sub‑90 second pipeline while preserving fidelity via code execution, review, and evaluation loops.

**Strategic Differentiators**  
- Quality Assurance Loop: Execution (Daytona) + Code Review (CodeRabbit) + Evaluation (Galileo) → higher trust vs raw LLM output.
- Repo Truth Anchoring: All generated content constrained to extracted repository facts; hallucination risk flagged.
- Multi‑Variant Scoring: Automatic generation & scoring of 2+ variants per format; best surfaced.
- Campaign Cohesion: Shared canonical repo profile reused across channels ensuring consistent messaging.
- Extensible Agent Mesh: Orchestrated specialized agents (ingestion, planner, writers, verifier, evaluator, voice, storage, collaboration).

### Audience Perspective Expansion
| Persona | Immediate Value | Deeper/Retained Value | What They Care About | Our Explicit Response |
|---------|-----------------|-----------------------|----------------------|-----------------------|
| DevRel Lead | Compress prep time for multi‑channel launch assets | Consistency across future releases (reuse repo profile delta) | Speed, brand consistency, measurable engagement lift | Canonical repo profile + versioned content kit + evaluation scores |
| OSS Maintainer | Regular, high‑signal updates without writing fatigue | Community growth & contributor activation | Accuracy, low noise, authentic tone | Fact‑anchored summaries + variant style tuning |
| Developer Marketer | Narrative & positioning aligned to product messaging | Scalable campaign calendars | Alignment to positioning guidelines | Structured outline with CTA slots & audience level tags |
| Hackathon Participant | Fast storytelling for judging & social traction | Post‑event assets (blog / thread) for continued visibility | Polished narrative & demo reliability | Generated talk outline + verified code examples (Daytona) |
| Community Organizer | Ready-to-use talk & workshop materials | Ongoing event cadence with minimal prep | Speaker confidence, relevance, pacing | Slide skeleton + speaker notes + 3 interaction prompts |
| Sales/BD Engineer (Secondary) | Technical credibility in customer-facing assets | Reusable explainer baseline for prospects | Accuracy, architectural clarity | Deep dive feature articles + architecture summary |
| Developer Tool Vendor Partner (Secondary) | Showcasing integrations quickly | Co‑marketing collateral reuse | Integration accuracy & speed | Plugin/integration quickstart section derived from repo scan |
| New Contributor (Secondary) | Understanding project surface area | Faster pathway to first PR | Clarity, concrete steps | Onboarding tutorial + “First Issue” suggestion heuristics (future) |

**Audience Insight Summary**  
The platform’s stickiness increases when the canonical repo profile becomes a shared primitive reused by multiple roles (DevRel, Maintainers, Marketing, Events). Extending beyond primary users (e.g., Sales Engineers, Tool Vendors) creates expansion paths without inflating MVP scope. Each persona’s trust hinge (accuracy, pacing, narrative clarity, integration correctness) maps directly to sponsor capabilities (Claude extraction quality, Daytona verification, CodeRabbit review, Galileo scoring). This justifies early investment in profile fidelity and execution validation over breadth of formats.

**Primary Outcomes (MVP)**  
Produce accurate step‑by‑step tutorial, technical blog post, talk outline, and social thread set (Twitter/X + LinkedIn) from a repo with <90s end‑to‑end latency and ≥90% executable code snippet validity.

### Rationale
The vision emphasizes speed (hackathon feasible), multi‑format breadth (clear sponsor showcasing), and trust (judges resonate with QA + evaluation). Differentiators map directly to top‑priority sponsor integrations and justify partial integrations of lower‑priority services as roadmap items. Focusing initial outcomes tightens scope to four core formats ensuring depth over superficial breadth, aligning with risk mitigation (avoid overextension while still being compelling).

### Advanced Elicitation Options (Select number 0–9 or give freeform feedback)
0. Expand Audience Perspectives (broaden target user framing)
1. Critique & Refine (challenge clarity, overclaims, jargon)
2. Risk Deepening (surface hidden threats to vision execution)
3. Goal Alignment Audit (map vision lines to measurable KPIs)
4. Tree of Thoughts Expansion (generate alternative strategic differentiators)
5. Red Team Challenge (attack feasibility & credibility)
6. Stakeholder Roundtable (simulate DevRel lead, maintainer, hackathon judge viewpoints)
7. Innovation Tournament (produce 5 bolder enhancement ideas, pick top 2)
8. Concise Pitch Compression (reduce to 2 striking sentences)
9. Proceed / Accept Section

> Respond with 0–9 to refine this section or provide direct edits; choosing 9 moves to next sections.

## 2. Target Users

| Segment | Core Need | How We Address |
|---------|-----------|----------------|
| DevRel & Developer Marketing Teams | Rapid campaign & launch collateral | Multi‑format generation + consistency via repo profile |
| OSS Maintainers & Core Contributors | Sustained, high‑quality communication to grow community | Automated release kits + deep dive content |
| Hackathon Participants & Project Teams | Polished storytelling & presentation scaffolding | Talk outline + challenge theme + tutorial pack |
| Community / Meetup Organizers | Event content & speaker enablement | Talk outline + speaker notes + announcement bundle |

## 3. Core Use Cases
1. **Release Campaign Kit** → Repo + release notes ⇒ X thread, LinkedIn update, release blog draft, CTA snippets.
2. **Onboarding Tutorial Pack** → Repo + audience level ⇒ step‑by‑step guide + troubleshooting section.
3. **Meetup / Conference Talk Prep** → Repo + event theme ⇒ 30–45 min outline + slide structure + speaker notes.
4. **Hackathon Track Design** → Repo + hackathon goals ⇒ challenge description + sample tasks + judging criteria + starter guide.
5. **Community Announcement Bundle** → Repo + key update ⇒ Discord/Slack copy + newsletter blurb + blog summary.
6. **Feature Deep Dive Content** → Repo + feature path ⇒ in‑depth blog post with code examples & best practices.

## 4. Sponsor Integration Strategy (Top 4 MVP)
| Sponsor | Role in Pipeline | Integration Phase | Measurable Output |
|---------|------------------|-------------------|-------------------|
| Anthropic (Claude) | Core LLM for repo understanding & content generation | Profile extraction → planning → draft variants | Repo profile JSON, content drafts, structured outlines |
| Daytona | Ephemeral environment to execute quickstart & examples | Post‑profile validation | Execution report: pass/fail, runtime metadata |
| CodeRabbit | Automated PR/code snippet review & static analysis aggregation | After draft variant selection & example generation | Review summary, quality score, remediation notes |
| Galileo | Multi‑variant scoring & hallucination risk evaluation | After content generation (pre final selection) | Variant scores (coherence, fidelity), hallucination flags |

Roadmap (Secondary): ElevenLabs (voice for talks), Tigris (object store + retrieval), Sentry (observability), Hathora (real‑time collaboration).

## 5. MVP Content Formats & Priority
1. Tutorial / Getting Started
2. Technical Blog Post
3. Talk Outline (Meetup / Conference)
4. Twitter / X Thread
5. LinkedIn Post (stretch if time remains)
6. Hackathon Theme & Challenge (stretch)

## 6. Non‑Functional Goals
- **Accuracy:** ≥90% of code snippets executable; failed snippets auto‑flagged.
- **Latency:** Full kit (tutorial+blog+talk+thread) in ≤90s typical repo (<30K LOC sampling boundaries).
- **Variant Evaluation:** ≥2 variants per format scored; best selected automatically.
- **Idempotence:** Same inputs → deterministic profile + stored version IDs.
- **Traceability:** Each step logs trace ID; failures surfaced with reason codes.

## 7. Key Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Model hallucination vs repo truth | Low trust in content | Strict fact extraction + Galileo scoring + inline flags |
| Sponsor API integration delays | Feature gaps in demo | Modular adapters + MVP focus on 4 + graceful fallbacks |
| Large repo processing slowness | Timeouts / poor UX | Sampling strategy + token caps + user transparency banner |
| Non‑runnable code examples | Undermines credibility | Daytona execution loop + limited retries + auto adjustments |
| Uncontrolled cost (LLM/eval/storage) | Budget overrun | Variant cap, cached repo profile, selective evaluation |

## 8. Initial Tech Stack Preferences
- **Backend:** Node.js (Next.js API routes) for rapid unification (single deploy). (Fallback: FastAPI if Python expertise required.)
- **Frontend:** Next.js + React + Tailwind (dashboard: input repo → select formats → view generated assets & scores).
- **Model Invocation:** Direct Anthropic Claude API wrapper service (retry + trace ID + streaming).
- **Processing:** In‑memory task tracker + async polling (upgrade path to Redis/BullMQ). Daytona jobs tracked via job ID.
- **Persistence (MVP):** Local disk / simple KV for versions (upgrade path Tigris).

## 9. Internationalization Roadmap
MVP: English only.  
Phase 2: English + Simplified Chinese (shared repo profile, localized narrative layers).  
I18n gating by stable accuracy + lower latency baseline.

## 10. High‑Level Flow (Text)
Repo URL → Profile Extract (Claude) → Daytona Validation → Generate Draft Variants (Claude) → Galileo Score → Select Best → CodeRabbit Review (examples/patch) → Assemble DevRel Kit → Persist & Display → (Optional Voice & Collaboration)

## 11. Immediate Next Steps (Execution Order)
1. Implement repo ingestion & profile summarizer (language stats + key dirs + README summary).
2. Wire Daytona adapter to run quickstart script / example path.
3. Generate tutorial + blog + talk outline + X thread (2 variants each) → raw JSON artifact.
4. Integrate Galileo evaluation stub (mock if real API latency/keys not ready).
5. Variant selection + surface best versions.
6. CodeRabbit integration for example snippet PR (if time) else stub.
7. Basic web dashboard (upload/enter repo → show assets & scores & validation badges).
8. Stretch: LinkedIn post + hackathon challenge + voice synth.

---
*Pending user elicitation selection for Section 1 before locking draft.*
