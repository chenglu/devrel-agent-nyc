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
"[project]/app/api/status/[jobId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/jobs.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    const { jobId } = await params;
    const job = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$jobs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getJob"])(jobId);
    if (!job) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Job not found'
        }, {
            status: 404
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(job);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__004571fc._.js.map