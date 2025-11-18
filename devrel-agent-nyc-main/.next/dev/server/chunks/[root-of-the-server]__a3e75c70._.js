module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/services.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Service adapters for external APIs
__turbopack_context__.s([
    "ClaudeService",
    ()=>ClaudeService,
    "CodeRabbitService",
    ()=>CodeRabbitService,
    "DaytonaService",
    ()=>DaytonaService,
    "ElevenLabsTtsService",
    ()=>ElevenLabsTtsService,
    "GalileoService",
    ()=>GalileoService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$anthropic$2d$ai$2b$sdk$40$0$2e$70$2e$0_zod$40$3$2e$25$2e$76$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@anthropic-ai+sdk@0.70.0_zod@3.25.76/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$anthropic$2d$ai$2b$sdk$40$0$2e$70$2e$0_zod$40$3$2e$25$2e$76$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@anthropic-ai+sdk@0.70.0_zod@3.25.76/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
;
class ClaudeService {
    client;
    constructor(){
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not configured');
        }
        this.client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$anthropic$2d$ai$2b$sdk$40$0$2e$70$2e$0_zod$40$3$2e$25$2e$76$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]({
            apiKey
        });
    }
    async extractRepoProfile(repoData) {
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
}`;
        try {
            const response = await this.client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
            const content = response.content[0];
            if (content.type !== 'text') {
                throw new Error('Unexpected response format');
            }
            return JSON.parse(content.text);
        } catch (error) {
            console.error('Claude API error:', error.message);
            // Fallback to basic extraction
            return this.extractProfileFallback(repoData);
        }
    }
    extractProfileFallback(repoData) {
        // Simple extraction without AI when API fails
        return {
            mainFeatures: [
                repoData.description || 'No description available',
                'See README for details'
            ],
            technicalStack: Object.keys(repoData.languages || {}).slice(0, 5),
            useCases: [
                'General development'
            ],
            keyDirectories: repoData.structure?.keyDirectories || [],
            quickstartPath: null
        };
    }
    async generateContentVariants(profile, format, variantCount = 2) {
        const prompts = this.getPromptForFormat(format, profile);
        const variants = [];
        try {
            for(let i = 0; i < variantCount; i++){
                const response = await this.client.messages.create({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4096,
                    temperature: 0.7 + i * 0.1,
                    messages: [
                        {
                            role: 'user',
                            content: prompts
                        }
                    ]
                });
                const content = response.content[0];
                if (content.type === 'text') {
                    variants.push({
                        id: `${format}-variant-${i + 1}`,
                        format,
                        content: content.text
                    });
                }
            }
        } catch (error) {
            console.error('Claude generation error:', error.message);
            // Return fallback content
            variants.push({
                id: `${format}-variant-1`,
                format,
                content: this.generateFallbackContent(format, profile)
            });
        }
        return variants;
    }
    generateFallbackContent(format, profile) {
        const repoName = profile.name;
        const description = profile.description;
        switch(format){
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

*Note: This is a fallback tutorial. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
            case 'blog':
                return `# Introducing ${repoName}

${description}

## Key Features
${profile.mainFeatures.map((f)=>`- ${f}`).join('\n')}

## Tech Stack
Built with ${profile.technicalStack.join(', ')}

## Get Started
Visit the repository: ${profile.url}

*Note: This is a fallback blog post. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
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

*Note: This is a fallback talk outline. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
            case 'twitter':
                return `🚀 Check out ${repoName}!

${description}

Built with ${profile.primaryLanguage}
⭐ ${profile.stars} stars

Learn more: ${profile.url}

#OpenSource #${profile.primaryLanguage}

*Note: This is a fallback tweet. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
            case 'linkedin':
                return `I'm excited to share ${repoName} with the community.

${description}

Key highlights:
${profile.mainFeatures.map((f)=>`• ${f}`).join('\n')}

Check it out: ${profile.url}

*Note: This is a fallback LinkedIn post. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
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

*Note: This is a fallback challenge. For AI-generated content, please add valid ANTHROPIC_API_KEY.*`;
            default:
                return `Content for ${format} format.\n\n*Note: Add ANTHROPIC_API_KEY for AI-generated content.*`;
        }
    }
    getPromptForFormat(format, profile) {
        const commitsList = Array.isArray(profile.commits) ? profile.commits.slice(0, 5) : [];
        const recentCommits = commitsList.length ? `\nRecent Commits (most recent first):\n${commitsList.map((c)=>`- ${new Date(c.date).toISOString().slice(0, 10)}: ${String(c.message || '').split('\n')[0]}`).join('\n')}` : '';
        const baseContext = `Repository: ${profile.name}
Description: ${profile.description}
Main Features: ${profile.mainFeatures.join(', ')}
Tech Stack: ${profile.technicalStack.join(', ')}
Primary Language: ${profile.primaryLanguage}${recentCommits}\nNote: Focus content on changes within the selected analysis period when relevant.`;
        switch(format){
            case 'tutorial':
                return `${baseContext}

Create a step-by-step getting started tutorial for developers new to this project.
Include:
- Prerequisites
- Installation steps
- First example with working code
- Common troubleshooting tips
- Next steps

Make it executable and accurate. Use markdown format.`;
            case 'blog':
                return `${baseContext}

Write a technical blog post announcing or explaining this project.
Include:
- Hook: Why this project matters
- Technical overview
- Key features with code examples
- Use cases
- Getting started link
- Call to action

Target audience: Technical developers. Use markdown format.`;
            case 'talk':
                return `${baseContext}

Create a 30-45 minute conference talk outline about this project.
Include:
- Talk title
- Abstract (150 words)
- Slide structure (15-20 slides)
- Speaker notes for key slides
- Demo points
- Q&A preparation notes

Format as markdown with clear sections.`;
            case 'twitter':
                return `${baseContext}

Write an engaging Twitter/X thread (5-7 tweets) announcing this project.
Make it:
- Technical but accessible
- Include key features
- Add relevant emojis
- End with link and CTA
- Each tweet under 280 chars

Format as numbered thread.`;
            case 'linkedin':
                return `${baseContext}

Write a LinkedIn post for a technical leadership audience.
Include:
- Professional hook
- Business value
- Technical highlights
- Team/community angle
- Call to action

Tone: Professional, insightful, 200-300 words.`;
            case 'hackathon':
                return `${baseContext}

Design a hackathon challenge based on this project.
Include:
- Challenge title and theme
- Problem statement
- Required deliverables
- Judging criteria (4-5 points)
- Starter resources
- Sample tasks (3-5)
- Difficulty level

Make it engaging and achievable in 24-48 hours.`;
            default:
                throw new Error(`Unknown format: ${format}`);
        }
    }
}
class DaytonaService {
    apiUrl;
    apiKey;
    constructor(){
        this.apiUrl = process.env.DAYTONA_API_URL || 'https://api.daytona.io';
        this.apiKey = process.env.DAYTONA_API_KEY || '';
    }
    async validateQuickstart(repoUrl, quickstartPath) {
        // Mock implementation - replace with actual Daytona API
        if (!this.apiKey) {
            return this.mockValidation();
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
            });
            const ct = response.headers.get('content-type') || '';
            if (!response.ok || !ct.includes('application/json')) {
                throw new Error(`Daytona API bad response: ${response.status} ${ct}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Daytona validation failed:', error);
            return this.mockValidation();
        }
    }
    mockValidation() {
        return {
            passed: true,
            runtime: 12.5,
            output: 'Setup completed successfully ✓\nTests passed: 15/15',
            retries: 0
        };
    }
}
class CodeRabbitService {
    apiUrl;
    apiKey;
    constructor(){
        this.apiUrl = process.env.CODERABBIT_API_URL || 'https://api.coderabbit.ai';
        this.apiKey = process.env.CODERABBIT_API_KEY || '';
    }
    async reviewCodeSnippets(snippets) {
        // Mock implementation - replace with actual CodeRabbit API
        if (!this.apiKey) {
            return snippets.map((_, idx)=>this.mockReview(idx));
        }
        try {
            const response = await fetch(`${this.apiUrl}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    snippets
                })
            });
            const ct = response.headers.get('content-type') || '';
            if (!response.ok || !ct.includes('application/json')) {
                throw new Error(`CodeRabbit API bad response: ${response.status} ${ct}`);
            }
            return await response.json();
        } catch (error) {
            console.error('CodeRabbit review failed:', error);
            return snippets.map((_, idx)=>this.mockReview(idx));
        }
    }
    mockReview(index) {
        return {
            snippet_id: `snippet-${index}`,
            quality_score: 92 + Math.floor(Math.random() * 8),
            issues: [],
            suggestions: [
                'Consider adding error handling',
                'Add type annotations'
            ],
            reviewed_at: new Date().toISOString()
        };
    }
}
class GalileoService {
    apiUrl;
    apiKey;
    constructor(){
        this.apiUrl = process.env.GALILEO_API_URL || 'https://api.galileo.ai';
        this.apiKey = process.env.GALILEO_API_KEY || '';
    }
    async evaluateVariants(variants, profile) {
        // Extended mock multi-metric evaluation. Replace with real API when available.
        if (!this.apiKey) {
            return variants.map((v)=>this.mockEvaluation(v));
        }
        try {
            const response = await fetch(`${this.apiUrl}/evaluate-multi`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    variants: variants.map((v)=>v.content),
                    context: profile,
                    metrics: [
                        'clarity',
                        'technicalAccuracy',
                        'audienceFit',
                        'actionability',
                        'originality',
                        'hallucinationRisk'
                    ]
                })
            });
            const ct = response.headers.get('content-type') || '';
            if (!response.ok || !ct.includes('application/json')) {
                throw new Error(`Galileo API bad response: ${response.status} ${ct}`);
            }
            const results = await response.json();
            const safeArray = Array.isArray(results) ? results : [];
            return variants.map((v, idx)=>{
                const r = safeArray[idx];
                if (!r || typeof r !== 'object') {
                    return this.mockEvaluation(v);
                }
                const evaluationMetrics = {
                    clarity: Number(r.clarity) || 0,
                    technicalAccuracy: Number(r.technicalAccuracy) || 0,
                    audienceFit: Number(r.audienceFit) || 0,
                    actionability: Number(r.actionability) || 0,
                    originality: Number(r.originality) || 0,
                    hallucinationRisk: Number(r.hallucinationRisk) || 0
                };
                // Composite score example weighting
                const score = Math.round(evaluationMetrics.clarity * 0.2 + evaluationMetrics.technicalAccuracy * 0.25 + evaluationMetrics.audienceFit * 0.15 + evaluationMetrics.actionability * 0.15 + evaluationMetrics.originality * 0.15 - evaluationMetrics.hallucinationRisk * 100 * 0.15);
                return {
                    ...v,
                    score,
                    evaluationMetrics,
                    hallucination_risk: evaluationMetrics.hallucinationRisk,
                    coherence_score: evaluationMetrics.clarity
                };
            });
        } catch (error) {
            console.error('Galileo evaluation failed:', error);
            return variants.map((v)=>this.mockEvaluation(v));
        }
    }
    mockEvaluation(variant) {
        const metrics = {
            clarity: 80 + Math.random() * 15,
            technicalAccuracy: 78 + Math.random() * 18,
            audienceFit: 75 + Math.random() * 20,
            actionability: 70 + Math.random() * 25,
            originality: 72 + Math.random() * 22,
            hallucinationRisk: Math.random() * 0.12
        };
        const score = Math.round(metrics.clarity * 0.2 + metrics.technicalAccuracy * 0.25 + metrics.audienceFit * 0.15 + metrics.actionability * 0.15 + metrics.originality * 0.15 - metrics.hallucinationRisk * 100 * 0.15);
        return {
            ...variant,
            score,
            evaluationMetrics: metrics,
            hallucination_risk: metrics.hallucinationRisk,
            coherence_score: metrics.clarity
        };
    }
}
class ElevenLabsTtsService {
    apiKey;
    voiceId;
    apiUrl;
    constructor(){
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
        this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // default voice
        this.apiUrl = process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1';
    }
    async synthesizeToBase64(text, format = 'mp3') {
        if (!this.apiKey) {
            throw new Error('ELEVENLABS_API_KEY not configured');
        }
        const url = `${this.apiUrl}/text-to-speech/${this.voiceId}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'xi-api-key': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.4,
                    similarity_boost: 0.8
                },
                output_format: format === 'mp3' ? 'mp3_44100_128' : 'pcm_16000'
            })
        });
        if (!response.ok) {
            const ct = response.headers.get('content-type') || '';
            const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();
            throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
        }
        const arrayBuf = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString('base64');
        const contentType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
        return {
            base64,
            contentType
        };
    }
}
}),
"[project]/app/api/tts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { text, format } = body;
        if (!text || typeof text !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing text'
            }, {
                status: 400
            });
        }
        const tts = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ElevenLabsTtsService"]();
        const { base64, contentType } = await tts.synthesizeToBase64(text.slice(0, 5000), format || 'mp3');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            audioBase64: base64,
            contentType
        }, {
            status: 200
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message || 'TTS failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a3e75c70._.js.map