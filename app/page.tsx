'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Github, Sparkles, Play, Volume2, Edit2 } from 'lucide-react'
import type { GenerationJob, ContentVariant } from '@/lib/types'

type LogEntry = {
  id: number
  agent: string
  message: string
  color: string
  timestamp?: string
}

export default function DevRelDashboard() {
  const [repoUrl, setRepoUrl] = useState('')
  const [timeRange, setTimeRange] = useState('3months')
  const [isGenerating, setIsGenerating] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showResults, setShowResults] = useState(false)
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ContentVariant>>({})
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/status/${jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job status')

      const job: GenerationJob = await response.json()

      // Update logs and job
      setLogs(job.logs)
      setCurrentJob(job)

      // Surface partial results as they arrive
      const hasSelected = job.selectedVariants && Object.keys(job.selectedVariants).length > 0
      const hasVariants = Array.isArray(job.variants) && job.variants.length > 0

      if (hasSelected) {
        setSelectedVariants(job.selectedVariants as Record<string, ContentVariant>)
        setShowResults(true)
      } else if (hasVariants) {
        // Build a latest-by-format view for live display
        const latestByFormat: Record<string, ContentVariant> = {}
        for (const v of job.variants!) {
          latestByFormat[v.format] = v
        }
        setSelectedVariants(latestByFormat)
        setShowResults(true)
      }

      // Handle terminal states
      if (job.status === 'completed') {
        setIsGenerating(false)
        setShowResults(true)
        setSelectedVariants(job.selectedVariants || {})
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      } else if (job.status === 'failed') {
        // Add error message to logs if not already present
        if (job.error && !logs.find(l => l.message.includes('Error:'))) {
          setLogs(prev => [
            ...prev,
            {
              id: Date.now(),
              agent: 'System',
              message: `❌ Error: ${job.error}`,
              color: 'text-destructive',
              timestamp: new Date().toISOString(),
            },
          ])
        }
        setIsGenerating(false)
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }

  const handleGenerate = async () => {
    if (!repoUrl) return
    
    setIsGenerating(true)
    setLogs([])
    setShowResults(false)
    setCurrentJob(null)
    setSelectedVariants({})
    
    try {
      // Start generation job
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repoUrl,
          timeRange,
          // Request full set including stretch formats
          formats: ['tutorial', 'blog', 'talk', 'twitter', 'linkedin', 'hackathon']
        })
      })
      
      if (!response.ok) throw new Error('Failed to start generation')
      
      const { jobId } = await response.json()
      
      // Start polling for status
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(jobId)
      }, 1000) // Poll every second
      
      // Initial poll
      pollJobStatus(jobId)
      
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setLogs([{
        id: 0,
        agent: 'System',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'text-destructive'
      }])
    }
  }

  const handleReset = () => {
    setShowResults(false)
    setLogs([])
    setCurrentJob(null)
    setSelectedVariants({})
    setAudioSrc(null)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const latestVariantFor = (format: string) => {
    const list = currentJob?.variants?.filter(v => v.format === format) || []
    return list.length ? list[list.length - 1] : undefined
  }

  const getVariantContent = (format: string) => {
    const variant = selectedVariants[format] || latestVariantFor(format)
    return variant?.content || 'Content not yet generated...'
  }

  const getVariantScore = (format: string) => {
    const variant = selectedVariants[format] || latestVariantFor(format)
    return variant?.score ? Math.round(variant.score) : null
  }
  const getVariantMetrics = (format: string) => {
    const variant = selectedVariants[format] || latestVariantFor(format)
    return variant?.evaluationMetrics || null
  }
  const renderMetrics = (format: string) => {
    const m = getVariantMetrics(format)
    if (!m) return null
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] font-mono">clarity {Math.round(m.clarity)}</span>
        <span className="px-1.5 py-0.5 rounded bg-chart-3/20 text-[10px] font-mono">accuracy {Math.round(m.technicalAccuracy)}</span>
        <span className="px-1.5 py-0.5 rounded bg-chart-4/20 text-[10px] font-mono">fit {Math.round(m.audienceFit)}</span>
        <span className="px-1.5 py-0.5 rounded bg-chart-5/20 text-[10px] font-mono">action {Math.round(m.actionability)}</span>
        <span className="px-1.5 py-0.5 rounded bg-accent/20 text-[10px] font-mono">orig {Math.round(m.originality)}</span>
        <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-[10px] font-mono">risk {(m.hallucinationRisk * 100).toFixed(1)}%</span>
      </div>
    )
  }

  const generateAudioFrom = async (format: string) => {
    const text = selectedVariants[format]?.content
    if (!text) return
    try {
      setIsGeneratingAudio(true)
      setAudioSrc(null)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, format: 'mp3' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'TTS failed')
      const src = `data:${data.contentType};base64,${data.audioBase64}`
      setAudioSrc(src)
    } catch (e) {
      console.error('TTS error', e)
      setAudioSrc(null)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary text-glow-purple">DevRel Campaign Generator</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent">System Online</span>
          </div>
        </header>

        {/* API Status Banner */}
        {logs.some(log => log.message.includes('API key') || log.message.includes('credit balance')) && (
          <div className="mb-4 p-4 border border-chart-5 bg-chart-5/10 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <span className="text-chart-5 text-xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-chart-5 mb-1">API Configuration Issue</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The system is using fallback content generation. For AI-powered content:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 font-mono">
                  <li>• Add valid <code className="text-primary">ANTHROPIC_API_KEY</code> to <code>.env.local</code></li>
                  <li>• Ensure your Anthropic account has sufficient credits</li>
                  <li>• Restart the dev server after updating env vars</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Command Center (40%) */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-12rem)]">
            {/* Collapsible Command Center */}
            {!showResults ? (
              <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur shrink-0">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  Command Center
                </h2>

                {/* GitHub Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-mono">Repository URL</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/username/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="pl-10 bg-input border-border font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Time Range Selector */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-mono">Analysis Period</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="bg-input border-border font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">Last 1 week</SelectItem>
                        <SelectItem value="1month">Last 1 month</SelectItem>
                        <SelectItem value="3months">Last 3 months</SelectItem>
                        <SelectItem value="6months">Last 6 months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!repoUrl || isGenerating}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-purple transition-all"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Campaign
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur shrink-0 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Github className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-muted-foreground font-mono">Active Repository</span>
                    <span className="font-mono text-sm truncate">{repoUrl}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-primary">
                  <Edit2 className="h-4 w-4 mr-2" />
                  New
                </Button>
              </Card>
            )}

            {/* Results Tabs */}
            {showResults && (
              <Card className="flex-1 border-accent/20 bg-card/50 backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-accent text-glow-green">Campaign Output</h2>
                </div>
                
                <Tabs defaultValue="social" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="w-full justify-start overflow-x-auto bg-muted/30 p-0 h-12 border-b border-border rounded-none px-4 gap-2">
                    <TabsTrigger value="social" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      🐦 Social
                    </TabsTrigger>
                    <TabsTrigger value="blog" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      📝 Blog
                    </TabsTrigger>
                    <TabsTrigger value="tutorial" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      📚 Tutorial
                    </TabsTrigger>
                    <TabsTrigger value="talk" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      🎤 Talk
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      💼 LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="podcast" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      🎧 Podcast
                    </TabsTrigger>
                    <TabsTrigger value="hackathon" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-mono text-xs">
                      🏆 Hackathon
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value="social" className="mt-0 space-y-4 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">Twitter Thread</label>
                          {getVariantScore('twitter') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('twitter')}/100</span>)}
                        </div>
                        {renderMetrics('twitter')}
                        <div className="bg-input/50 p-3 rounded-md border border-border font-mono text-sm whitespace-pre-wrap">
                          {getVariantContent('twitter')}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="blog" className="mt-0 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">Technical Blog Post</label>
                          {getVariantScore('blog') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('blog')}/100</span>)}
                        </div>
                        {renderMetrics('blog')}
                        <div className="bg-muted/30 p-6 rounded-md border border-border font-mono text-sm space-y-4 whitespace-pre-wrap">
                          {getVariantContent('blog')}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tutorial" className="mt-0 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">Getting Started Tutorial</label>
                          {getVariantScore('tutorial') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('tutorial')}/100</span>)}
                        </div>
                        {renderMetrics('tutorial')}
                        <div className="bg-muted/30 p-6 rounded-md border border-border font-mono text-sm space-y-4 whitespace-pre-wrap">
                          {getVariantContent('tutorial')}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="talk" className="mt-0 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">Conference Talk Outline</label>
                          {getVariantScore('talk') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('talk')}/100</span>)}
                        </div>
                        {renderMetrics('talk')}
                        <div className="bg-muted/30 p-6 rounded-md border border-border font-mono text-sm space-y-4 whitespace-pre-wrap">
                          {getVariantContent('talk')}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="linkedin" className="mt-0 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">LinkedIn Post</label>
                          {getVariantScore('linkedin') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('linkedin')}/100</span>)}
                        </div>
                        {renderMetrics('linkedin')}
                        <div className="bg-muted/30 p-6 rounded-md border border-border font-mono text-sm space-y-4 whitespace-pre-wrap">
                          {getVariantContent('linkedin')}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="podcast" className="mt-0 h-full">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-md border border-border">
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="bg-primary" disabled={isGeneratingAudio || !selectedVariants['blog']} onClick={() => generateAudioFrom('blog')}>
                              {isGeneratingAudio ? 'Generating…' : 'Generate from Blog'}
                            </Button>
                            <Button size="sm" variant="secondary" disabled={isGeneratingAudio || !selectedVariants['talk']} onClick={() => generateAudioFrom('talk')}>
                              {isGeneratingAudio ? 'Generating…' : 'Generate from Talk'}
                            </Button>
                          </div>
                          <div className="flex-1 space-y-2">
                            {audioSrc ? (
                              <audio controls className="w-full">
                                <source src={audioSrc} type="audio/mpeg" />
                              </audio>
                            ) : (
                              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                                <Volume2 className="h-3 w-3" />
                                Generate audio from Blog or Talk content
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="hackathon" className="mt-0 h-full">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-mono">Hackathon Challenge</label>
                          {getVariantScore('hackathon') && (<span className="text-xs text-accent font-mono">Score: {getVariantScore('hackathon')}/100</span>)}
                        </div>
                        {renderMetrics('hackathon')}
                        <div className="bg-muted/30 p-6 rounded-md border border-border font-mono text-sm space-y-4 whitespace-pre-wrap">
                          {getVariantContent('hackathon')}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            )}
          </div>

          {/* Right Column: Agent Brain (60%) */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)] border-accent/20 bg-card/50 backdrop-blur flex flex-col">
              {/* Status Overview */}
              <div className="p-4 border-b border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-semibold">Pipeline Status</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-background/40">
                    {currentJob?.status || 'idle'}
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-primary/10 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${currentJob?.progress || 0}%` }}
                  />
                </div>
                {currentJob?.timeRange && (
                  <div className="text-[10px] font-mono text-muted-foreground">
                    Analysis window: {{
                      '1week': 'Last 1 week',
                      '1month': 'Last 1 month',
                      '3months': 'Last 3 months',
                      '6months': 'Last 6 months',
                      '1year': 'Last Year',
                    }[currentJob.timeRange] }
                  </div>
                )}
                {currentJob?.profile && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Repo</p>
                        <p className="truncate text-primary">{currentJob.profile.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Language</p>
                        <p className="text-chart-3">{currentJob.profile.primaryLanguage}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-muted-foreground">Features</p>
                        <p className="line-clamp-2 text-xs">{currentJob.profile.mainFeatures.join(', ')}</p>
                      </div>
                    </div>
                    {currentJob.profile.commits && currentJob.profile.commits.length > 0 && (
                      <div className="border border-border rounded-md p-2 bg-background/40 max-h-32 overflow-y-auto">
                        <p className="text-muted-foreground text-[10px] mb-1 font-mono">Recent Commits</p>
                        <ul className="space-y-1">
                          {currentJob.profile.commits.map(c => (
                            <li key={c.sha} className="text-[10px] font-mono flex justify-between gap-2">
                              <span className="truncate" title={c.message}>{c.message.split('\n')[0]}</span>
                              <a href={c.url} target="_blank" rel="noreferrer" className="text-accent underline">{c.sha.substring(0,7)}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentJob.profile.commits && currentJob.profile.commits.length === 0 && (
                      <div className="border border-border rounded-md p-2 bg-background/40">
                        <p className="text-muted-foreground text-[10px] font-mono">
                          No commits in selected window.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <div className="h-3 w-3 rounded-full bg-chart-5" />
                    <div className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <span className="font-mono text-sm font-semibold">Event Log</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse glow-green" />
                  <span className="text-xs text-accent font-mono">LIVE</span>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
                {logs.length === 0 && !isGenerating && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-center">
                      Waiting for input...<br />
                      <span className="text-xs">Enter a GitHub repo URL to begin</span>
                    </p>
                  </div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-muted-foreground shrink-0">{'>'}</span>
                    <span className={log.color}>
                      [{log.agent}]
                    </span>
                    <span className="text-foreground">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* Summary Footer */}
              <div className="p-3 border-t border-border bg-muted/30 font-mono text-xs text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">Powered:</span>
                  <span className="text-primary">Claude</span>
                  <span className="text-chart-3">Daytona</span>
                  <span className="text-chart-4">Galileo</span>
                  <span className="text-chart-5">CodeRabbit</span>
                </span>
                <div className="flex items-center gap-4">
                  {currentJob && (
                    <span className="text-accent">
                      {currentJob.progress}%
                    </span>
                  )}
                  <span>{logs.length} events</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
