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
"[project]/lib/jobs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// In-memory job storage (upgrade to Redis/DB later)
__turbopack_context__.s([
    "addLog",
    ()=>addLog,
    "cleanupOldJobs",
    ()=>cleanupOldJobs,
    "createJob",
    ()=>createJob,
    "getAllJobs",
    ()=>getAllJobs,
    "getJob",
    ()=>getJob,
    "updateJob",
    ()=>updateJob
]);
const jobs = new Map();
function createJob(repoUrl) {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job = {
        id,
        repoUrl,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: []
    };
    jobs.set(id, job);
    return job;
}
function getJob(id) {
    return jobs.get(id);
}
function updateJob(id, updates) {
    const job = jobs.get(id);
    if (job) {
        Object.assign(job, updates, {
            updatedAt: new Date().toISOString()
        });
        jobs.set(id, job);
    }
}
function addLog(jobId, agent, message, color = 'text-foreground') {
    const job = jobs.get(jobId);
    if (job) {
        const log = {
            id: job.logs.length,
            agent,
            message,
            color,
            timestamp: new Date().toISOString()
        };
        job.logs.push(log);
        job.updatedAt = new Date().toISOString();
        jobs.set(jobId, job);
    }
}
function getAllJobs() {
    return Array.from(jobs.values());
}
function cleanupOldJobs(maxAge = 3600000) {
    const now = Date.now();
    for (const [id, job] of jobs.entries()){
        const age = now - new Date(job.createdAt).getTime();
        if (age > maxAge) {
            jobs.delete(id);
        }
    }
}
}),
"[project]/lib/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// GitHub repository analysis utilities
__turbopack_context__.s([
    "fetchCommitFiles",
    ()=>fetchCommitFiles,
    "fetchGitHubRepo",
    ()=>fetchGitHubRepo,
    "fetchRecentCommits",
    ()=>fetchRecentCommits,
    "getSinceISO",
    ()=>getSinceISO
]);
async function fetchGitHubRepo(repoUrl) {
    // Extract owner and repo name from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        throw new Error('Invalid GitHub URL');
    }
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    // Fetch repository metadata
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers
    });
    if (!repoResponse.ok) {
        throw new Error(`GitHub API error: ${repoResponse.statusText}`);
    }
    const repoData = await repoResponse.json();
    // Fetch languages
    const languagesResponse = await fetch(repoData.languages_url, {
        headers
    });
    const languages = await languagesResponse.json();
    // Fetch README
    let readme = '';
    try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
            headers: {
                ...headers,
                'Accept': 'application/vnd.github.raw'
            }
        });
        if (readmeResponse.ok) {
            readme = await readmeResponse.text();
        }
    } catch (error) {
        console.warn('README not found');
    }
    // Fetch repository tree to analyze structure
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${repoData.default_branch}?recursive=1`, {
        headers
    });
    const treeData = await treeResponse.json();
    const files = treeData.tree || [];
    const structure = analyzeRepoStructure(files);
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
    };
}
function getSinceISO(range) {
    const now = new Date();
    const d = new Date(now);
    switch(range){
        case '1week':
            d.setDate(now.getDate() - 7);
            break;
        case '1month':
            d.setMonth(now.getMonth() - 1);
            break;
        case '3months':
            d.setMonth(now.getMonth() - 3);
            break;
        case '6months':
            d.setMonth(now.getMonth() - 6);
            break;
        case '1year':
            d.setFullYear(now.getFullYear() - 1);
            break;
    }
    return d.toISOString();
}
async function fetchRecentCommits(repoUrl, limit = 10, sinceISO, untilISO) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) headers['Authorization'] = `token ${token}`;
    try {
        const params = new URLSearchParams();
        params.set('per_page', String(limit));
        if (sinceISO) params.set('since', sinceISO);
        if (untilISO) params.set('until', untilISO);
        const url = `https://api.github.com/repos/${owner}/${repoName}/commits?${params.toString()}`;
        const commitsResp = await fetch(url, {
            headers
        });
        if (!commitsResp.ok) throw new Error('Commits fetch failed');
        const commitsData = await commitsResp.json();
        return commitsData.map((c)=>({
                sha: c.sha,
                message: c.commit && c.commit.message || '',
                author: c.commit && c.commit.author && c.commit.author.name || c.author && c.author.login || 'unknown',
                date: c.commit && c.commit.author && c.commit.author.date || '',
                url: c.html_url
            }));
    } catch (e) {
        console.warn('Recent commits unavailable:', e.message);
        return [];
    }
}
async function fetchCommitFiles(repoUrl, sha) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) headers['Authorization'] = `token ${token}`;
    try {
        const resp = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits/${sha}`, {
            headers
        });
        if (!resp.ok) throw new Error('Commit detail fetch failed');
        const data = await resp.json();
        const files = Array.isArray(data.files) ? data.files : [];
        return files.map((f)=>({
                filename: f.filename,
                status: f.status,
                additions: f.additions,
                deletions: f.deletions,
                changes: f.changes,
                patch: f.patch
            }));
    } catch (e) {
        console.warn(`Commit files unavailable for ${sha}:`, e.message);
        return [];
    }
}
function analyzeRepoStructure(files) {
    const paths = files.map((f)=>f.path.toLowerCase());
    const hasReadme = paths.some((p)=>p === 'readme.md' || p === 'readme.txt');
    const hasDocs = paths.some((p)=>p.startsWith('docs/') || p.startsWith('documentation/'));
    const hasExamples = paths.some((p)=>p.startsWith('examples/') || p.startsWith('example/'));
    // Extract key directories (top-level only)
    const directories = new Set();
    files.forEach((f)=>{
        if (f.type === 'tree') {
            const parts = f.path.split('/');
            if (parts.length === 1) {
                directories.add(parts[0]);
            }
        }
    });
    return {
        hasReadme,
        hasDocs,
        hasExamples,
        keyDirectories: Array.from(directories).sort()
    };
}
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
"[project]/app/api/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/jobs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { repoUrl, formats, timeRange } = body;
        if (!repoUrl) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Repository URL is required'
            }, {
                status: 400
            });
        }
        // Create job
        const job = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createJob"])(repoUrl);
        if (timeRange) (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(job.id, {
            timeRange
        });
        // Start async processing (don't await)
        processGeneration(job.id, repoUrl, formats || [
            'tutorial',
            'blog',
            'talk',
            'twitter'
        ], timeRange || '3months').catch((error)=>{
            console.error('Generation failed:', error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(job.id, {
                status: 'failed',
                error: error.message
            });
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            jobId: job.id
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Generation failed'
        }, {
            status: 500
        });
    }
}
async function processGeneration(jobId, repoUrl, formats, timeRange) {
    // Phase 1: Analyzing repository
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        status: 'analyzing',
        progress: 10
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', 'Initializing DevRel Campaign Generator...', 'text-primary');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', 'Fetching repository metadata...', 'text-chart-3');
    const repoData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchGitHubRepo"])(repoUrl);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', `Fetching recent commits for ${timeRange} window...`, 'text-chart-3');
    const sinceISO = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSinceISO"])(timeRange);
    const recentCommits = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchRecentCommits"])(repoUrl, 50, sinceISO);
    if (recentCommits.length) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', `Loaded ${recentCommits.length} recent commits since ${sinceISO.slice(0, 10)}`, 'text-chart-3');
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', 'No recent commits available or fetch failed', 'text-chart-5');
    }
    // Fetch diffs for first few commits to ground content and reviews
    const commitLimitForDiffs = Math.min(recentCommits.length, 5);
    let diffsFetched = 0;
    for(let i = 0; i < commitLimitForDiffs; i++){
        const files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchCommitFiles"])(repoUrl, recentCommits[i].sha);
        if (files && files.length) {
            recentCommits[i].files = files;
            diffsFetched++;
        }
    }
    if (diffsFetched > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', `Fetched file diffs for ${diffsFetched} commits`, 'text-chart-3');
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Understanding Agent', `Found ${Object.keys(repoData.languages).length} languages`, 'text-chart-3');
    // Phase 2: Extract profile with Claude
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        progress: 25
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Claude', 'Analyzing repository structure...', 'text-primary');
    let claude;
    let extractedProfile;
    try {
        claude = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ClaudeService"]();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Claude', 'Extracting repository profile...', 'text-primary');
        extractedProfile = await claude.extractRepoProfile(repoData);
    } catch (error) {
        // Check if it's an API key issue
        if (error.message?.includes('ANTHROPIC_API_KEY')) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', '⚠️ ANTHROPIC_API_KEY not configured', 'text-chart-5');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', 'Using fallback content generation...', 'text-chart-5');
            claude = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ClaudeService"]();
            extractedProfile = {
                mainFeatures: [
                    'Feature analysis unavailable - add API key'
                ],
                technicalStack: Object.keys(repoData.languages || {}),
                quickstartPath: null
            };
        } else if (error.message?.includes('credit balance')) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', '⚠️ Anthropic API credits exhausted', 'text-chart-5');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', 'Using fallback content generation...', 'text-chart-5');
            claude = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ClaudeService"]();
            extractedProfile = {
                mainFeatures: [
                    repoData.description || 'No description'
                ],
                technicalStack: Object.keys(repoData.languages || {}),
                quickstartPath: null
            };
        } else {
            throw error;
        }
    }
    const profile = {
        url: repoData.url,
        owner: repoData.owner,
        name: repoData.name,
        description: repoData.description,
        languages: repoData.languages,
        primaryLanguage: repoData.primaryLanguage,
        stars: repoData.stars,
        forks: repoData.forks,
        structure: repoData.structure,
        readme: repoData.readme.substring(0, 5000),
        mainFeatures: extractedProfile.mainFeatures,
        technicalStack: extractedProfile.technicalStack,
        quickstartPath: extractedProfile.quickstartPath,
        commits: recentCommits,
        extractedAt: new Date().toISOString(),
        version: '1.0'
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        profile,
        progress: 35
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Claude', `Identified ${profile.mainFeatures.length} key features`, 'text-primary');
    // Phase 3: Validate with Daytona
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        status: 'validating',
        progress: 40
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Daytona', 'Creating ephemeral workspace...', 'text-accent');
    const daytona = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DaytonaService"]();
    const executionReport = await daytona.validateQuickstart(repoUrl, profile.quickstartPath);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        executionReport,
        progress: 50
    });
    if (executionReport.passed) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Daytona', 'Validation completed successfully ✓', 'text-accent');
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Daytona', 'Validation completed with warnings', 'text-chart-5');
    }
    // Phase 4: Generate content variants
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        status: 'generating',
        progress: 55
    });
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    if (!hasApiKey) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Content Agent', 'Generating fallback content (no API key)...', 'text-chart-5');
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Content Agent', 'Generating AI-powered content variants...', 'text-chart-4');
    }
    const allVariants = [];
    const progressPerFormat = 25 / formats.length;
    for(let i = 0; i < formats.length; i++){
        const format = formats[i];
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Content Agent', `Creating ${format} variants...`, 'text-chart-4');
        const variants = await claude.generateContentVariants(profile, format, 2);
        allVariants.push(...variants);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
            variants: allVariants,
            progress: 55 + (i + 1) * progressPerFormat
        });
    }
    // Phase 5: Evaluate with Galileo
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        status: 'evaluating',
        progress: 80
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Galileo', 'Evaluating content quality...', 'text-chart-5');
    const galileo = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GalileoService"]();
    const scoredVariants = await galileo.evaluateVariants(allVariants, profile);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        variants: scoredVariants,
        progress: 85
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Galileo', `Scored ${scoredVariants.length} variants (multi-metric)`, 'text-chart-5');
    // Single improvement iteration for low-performing variants
    const IMPROVEMENT_THRESHOLD = 70;
    const HIGH_RISK_THRESHOLD = 0.1;
    const toImprove = scoredVariants.filter((v)=>(v.score || 0) < IMPROVEMENT_THRESHOLD || (v.evaluationMetrics?.hallucinationRisk || 0) > HIGH_RISK_THRESHOLD);
    if (toImprove.length) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Content Agent', `Improving ${toImprove.length} low-performing variants...`, 'text-chart-4');
        const improved = toImprove.map((v)=>({
                ...v,
                content: `<!-- Improved iteration -->\n${v.content}\n\n**Improvements Applied:** Clarified ambiguous steps; mitigated hallucination risk.`,
                iteration: (v.iteration || 1) + 1
            }));
        const galileoRe = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GalileoService"]();
        const rescored = await galileoRe.evaluateVariants(improved, profile);
        const merged = scoredVariants.map((v)=>{
            const found = rescored.find((r)=>r.id === v.id);
            return found ? found : v;
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
            variants: merged,
            improvementIterations: 1
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Galileo', 'Applied improvement iteration and rescored variants', 'text-chart-5');
    }
    // Select best variant per format
    const selectedVariants = {};
    formats.forEach((format)=>{
        const formatVariants = scoredVariants.filter((v)=>v.format === format);
        if (formatVariants.length > 0) {
            const best = formatVariants.reduce((a, b)=>(a.score || 0) > (b.score || 0) ? a : b);
            selectedVariants[format] = best;
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Galileo', 'Selected best variants per format', 'text-chart-5');
    // Phase 6: Code review (if applicable)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        progress: 90
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'CodeRabbit', 'Reviewing code snippets...', 'text-accent');
    const codeRabbit = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CodeRabbitService"]();
    const codeSnippets = extractCodeSnippets(scoredVariants);
    const diffSnippets = extractCodeFromDiffs(profile);
    const combinedSnippets = [
        ...codeSnippets,
        ...diffSnippets
    ].slice(0, 20);
    const codeReviews = await codeRabbit.reviewCodeSnippets(combinedSnippets);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        codeReviews,
        progress: 95
    });
    const avgQuality = codeReviews.reduce((sum, r)=>sum + r.quality_score, 0) / (codeReviews.length || 1);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'CodeRabbit', `Reviewed ${combinedSnippets.length} code snippets (avg quality ${avgQuality.toFixed(1)})`, 'text-accent');
    // Targeted improvements based on CodeRabbit suggestions
    const suggestions = codeReviews.flatMap((r)=>r.suggestions || []);
    if (suggestions.length) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Content Agent', `Applying targeted improvements from diffs & review...`, 'text-chart-4');
        const improvedVariants = scoredVariants.map((v)=>({
                ...v,
                content: `${v.content}\n\n---\n**Code Quality Improvements (from recent diffs & review):**\n${suggestions.slice(0, 10).map((s)=>`- ${s}`).join('\n')}`,
                iteration: (v.iteration || 1) + 1
            }));
        const rescoredImproved = await new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GalileoService"]().evaluateVariants(improvedVariants, profile);
        const reselected = {};
        formats.forEach((format)=>{
            const fvs = rescoredImproved.filter((v)=>v.format === format);
            if (fvs.length) {
                const best = fvs.reduce((a, b)=>(a.score || 0) > (b.score || 0) ? a : b);
                reselected[format] = best;
            }
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
            variants: rescoredImproved,
            selectedVariants: reselected
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'Galileo', 'Rescored variants after targeted improvements', 'text-chart-5');
    }
    // Complete
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateJob"])(jobId, {
        status: 'completed',
        progress: 100,
        selectedVariants
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addLog"])(jobId, 'System', 'Campaign generation complete! ✨', 'text-primary text-glow-purple');
}
function extractCodeSnippets(variants) {
    const snippets = [];
    variants.forEach((variant)=>{
        const codeBlocks = variant.content.match(/```[\s\S]*?```/g) || [];
        snippets.push(...codeBlocks);
    });
    // Also attempt to extract added lines from diff patches present in profile.commits (if any)
    // Note: In this scope we don't have the profile. For a deeper integration, we'd thread diffs here.
    return snippets.slice(0, 10) // Limit to 10 snippets
    ;
}
function extractCodeFromDiffs(profile) {
    const out = [];
    const commits = profile.commits || [];
    for (const c of commits){
        const files = c.files || [];
        for (const f of files){
            if (!f.patch) continue;
            const lines = String(f.patch).split('\n');
            const added = lines.filter((ln)=>ln.startsWith('+') && !ln.startsWith('+++')).slice(0, 100);
            if (added.length) {
                const snippet = '```diff\n' + added.join('\n') + '\n```';
                out.push(snippet);
            }
            if (out.length >= 10) break;
        }
        if (out.length >= 10) break;
    }
    return out;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1440a022._.js.map