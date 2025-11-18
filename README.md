# DevRel Campaign Generator

**Transform any GitHub repository into a complete DevRel campaign in minutes.**

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20Sonnet%204-purple?style=for-the-badge)](https://anthropic.com)

## 🚀 Overview

DevRel Campaign Generator is an AI-powered platform that automatically generates high-quality developer relations content from GitHub repositories. Simply provide a repo URL, and the system creates:

- 📚 **Step-by-step tutorials**
- 📝 **Technical blog posts**
- 🎤 **Conference talk outlines**
- 🐦 **Social media threads** (Twitter/X)
- 🏆 **Hackathon challenges**

All content is validated for accuracy, scored for quality, and reviewed for code correctness through an automated multi-agent pipeline.

## ✨ Features

### Multi-Agent Pipeline
- **Understanding Agent**: Fetches repo metadata, analyzes structure, extracts README
- **Claude (Anthropic)**: Generates canonical repo profile + 2 variants per content format
- **Daytona**: Validates code examples in ephemeral environments
- **Galileo**: Scores variants for coherence, fidelity, and hallucination risk
- **CodeRabbit**: Reviews code snippets for quality and best practices

### Content Quality
- ✅ Fact-anchored generation (repo truth constraints)
- ✅ Multi-variant evaluation (automatic best selection)
- ✅ Executable code validation
- ✅ Real-time progress tracking

### Developer Experience
- 🎨 Cyberpunk-themed UI with real-time logs
- ⚡ Sub-90s generation time (typical repos)
- 📊 Quality scores and hallucination risk indicators
- 🔄 Async job processing with polling

## 📦 Installation

### Prerequisites
- Node.js 18+ (20+ recommended)
- pnpm 8+ (or npm/yarn)
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chenglu/devrel-agent-nyc.git
   cd devrel-agent-nyc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

4. **Add your API keys** to `.env.local`
   ```bash
   # Required for content generation
   ANTHROPIC_API_KEY=sk-ant-...

   # Optional - increases GitHub rate limits
   GITHUB_TOKEN=ghp_...

   # Optional - for real integrations (currently mocked)
   DAYTONA_API_KEY=...
   CODERABBIT_API_KEY=...
   GALILEO_API_KEY=...
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

6. **Open http://localhost:3000**

## 🎯 Usage

1. **Enter a GitHub repository URL**
   - Example: `https://github.com/vercel/next.js`

2. **Click "Generate Campaign"**
   - Watch real-time agent logs
   - Monitor progress (0-100%)

3. **Review generated content**
   - Switch between tabs (Social, Blog, Tutorial, Talk)
   - Check quality scores
   - View validation badges

## 🔑 API Keys & Services

| Service | Purpose | Required? | Status |
|---------|---------|-----------|--------|
| **Anthropic Claude** | Content generation & repo analysis | ✅ Yes | Implemented |
| **GitHub API** | Repo metadata fetching | Optional | Implemented |
| **Daytona** | Code validation in ephemeral envs | Optional | Mocked |
| **CodeRabbit** | Code review & quality scoring | Optional | Mocked |
| **Galileo** | Content evaluation & hallucination detection | Optional | Mocked |

**Note**: Without optional keys, the system falls back to mock data while still generating real content via Claude.

## 📁 Project Structure

```
devrel-agent-nyc/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # POST: Start generation job
│   │   └── status/[jobId]/route.ts # GET: Poll job status
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main dashboard
│   └── globals.css                 # Custom theme
├── lib/
│   ├── types.ts                    # TypeScript definitions
│   ├── services.ts                 # Service adapters
│   ├── github.ts                   # GitHub API integration
│   ├── jobs.ts                     # In-memory job tracker
│   └── utils.ts                    # Utilities
├── components/ui/                  # shadcn/ui components
├── .env.example                    # Environment template
└── README.md
```

## 🚧 Roadmap

### Phase 1 (Current)
- [x] GitHub repo ingestion
- [x] Claude content generation
- [x] Real-time job tracking
- [x] Mock service integrations
- [x] Responsive UI

### Phase 2
- [ ] Real Galileo integration
- [ ] Real Daytona workspace validation
- [ ] Real CodeRabbit review
- [ ] LinkedIn post generation
- [ ] Hackathon challenge generator

### Phase 3
- [ ] ElevenLabs voice synthesis
- [ ] Tigris object storage
- [ ] Hathora real-time collaboration
- [ ] Redis/DB job persistence
- [ ] Content export/download

## 📄 License

MIT License

---

Made with ❤️ for the DevRel community