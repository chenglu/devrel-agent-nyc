// In-memory job storage (upgrade to Redis/DB later)

import type { GenerationJob, LogEntry } from './types'

const jobs = new Map<string, GenerationJob>()

export function createJob(repoUrl: string): GenerationJob {
  const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const job: GenerationJob = {
    id,
    repoUrl,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logs: []
  }

  jobs.set(id, job)
  return job
}

export function getJob(id: string): GenerationJob | undefined {
  return jobs.get(id)
}

export function updateJob(id: string, updates: Partial<GenerationJob>): void {
  const job = jobs.get(id)
  if (job) {
    Object.assign(job, updates, { updatedAt: new Date().toISOString() })
    jobs.set(id, job)
  }
}

export function addLog(jobId: string, agent: string, message: string, color: string = 'text-foreground'): void {
  const job = jobs.get(jobId)
  if (job) {
    const log: LogEntry = {
      id: job.logs.length,
      agent,
      message,
      color,
      timestamp: new Date().toISOString()
    }
    job.logs.push(log)
    job.updatedAt = new Date().toISOString()
    jobs.set(jobId, job)
  }
}

export function getAllJobs(): GenerationJob[] {
  return Array.from(jobs.values())
}

// Cleanup old jobs (optional, for memory management)
export function cleanupOldJobs(maxAge: number = 3600000): void {
  const now = Date.now()
  for (const [id, job] of jobs.entries()) {
    const age = now - new Date(job.createdAt).getTime()
    if (age > maxAge) {
      jobs.delete(id)
    }
  }
}
