'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import CountdownTimer from '@/components/CountdownTimer'
import TimelineView from '@/components/TimelineView'
import WritingProgress from '@/components/WritingProgress'
import PapersList from '@/components/PapersList'
import NotionTasks from '@/components/NotionTasks'
import ContentIdeas from '@/components/ContentIdeas'
import AdvisorDeliverables from '@/components/AdvisorDeliverables'
import DailyBriefs from '@/components/DailyBriefs'
import { getMilestones, getWritingSections, getPapers, getContentIdeas, getAdvisorDeliverables } from '@/lib/data'
import { Milestone, WritingSection, Paper, ContentIdea, AdvisorDeliverable } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

type Tab = 'timeline' | 'writing' | 'papers' | 'content' | 'deliverables' | 'briefs'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [sections, setSections] = useState<WritingSection[]>([])
  const [papers, setPapers] = useState<Paper[]>([])
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [deliverables, setDeliverables] = useState<AdvisorDeliverable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [m, s, p, c, d] = await Promise.all([
          getMilestones(), 
          getWritingSections(), 
          getPapers(), 
          getContentIdeas(),
          getAdvisorDeliverables()
        ])
        setMilestones(m)
        setSections(s)
        setPapers(p)
        setContentIdeas(c)
        setDeliverables(d)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🚀</div>
          <div className="text-zinc-500 font-body text-sm tracking-wide animate-pulse">
            Initializing Mission Control...
          </div>
        </div>
      </div>
    )
  }

  const defenseDate = '2026-06-28'
  const now = new Date()

  // Stats
  const completedMilestones = milestones.filter(m => m.status === 'complete').length
  const totalMilestones = milestones.length
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const totalWords = sections.reduce((sum, s) => sum + s.current_word_count, 0)
  const targetWords = sections.reduce((sum, s) => sum + (s.target_word_count || 0), 0)
  const wordPercent = targetWords > 0 ? (totalWords / targetWords) * 100 : 0

  const nextMilestone = milestones.find(m => m.status !== 'complete' && new Date(m.due_date) >= now)
  const currentPhase = nextMilestone?.phase || 'build'

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'timeline', label: 'Timeline', icon: '◆' },
    { key: 'deliverables', label: 'Deliverables', icon: '◆' },
    { key: 'writing', label: 'Writing', icon: '◇' },
    { key: 'papers', label: 'Research', icon: '◈' },
    { key: 'briefs', label: 'Briefs', icon: '◉' },
    { key: 'content', label: 'Content', icon: '◎' },
  ]

  const phaseInfo: Record<string, { label: string; color: string; description: string }> = {
    'build': { label: 'Writing & Building', color: 'from-violet-500/15 to-violet-500/0 border-violet-500/20', description: 'Write Chs. 1-3 while building the RAG pipeline and AI Expert artifact' },
    'data-collection': { label: 'Evaluation Study', color: 'from-blue-500/15 to-blue-500/0 border-blue-500/20', description: 'Run experiment sessions, collect survey data, write Ch.4 Artifact Design' },
    'analysis': { label: 'Results & Discussion', color: 'from-emerald-500/15 to-emerald-500/0 border-emerald-500/20', description: 'Write Chs. 5-6, assemble complete thesis draft for committee' },
    'writing': { label: 'Review & Revisions', color: 'from-amber-500/15 to-amber-500/0 border-amber-500/20', description: 'Incorporate committee feedback, polish and finalize thesis' },
    'defense': { label: 'Defense Prep', color: 'from-rose-500/15 to-rose-500/0 border-rose-500/20', description: 'Build defense presentation, practice, submit final document' },
  }

  const phase = phaseInfo[currentPhase]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800/40 sticky top-0 z-50 bg-[#06060b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
                🚀
              </div>
              <div>
                <h1 className="font-display text-lg tracking-tight">Mission Control</h1>
                <p className="text-[11px] text-zinc-500 font-mono tracking-wide mt-0.5">
                  K-12 Risk Assessment · DSR · HCC
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-zinc-500 font-body">{format(now, 'EEEE, MMMM d')}</div>
                <div className="text-[10px] text-zinc-600 font-mono mt-0.5">James Heldridge · UNL</div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Countdown + Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in">
          <CountdownTimer targetDate={defenseDate} label="Defense Day" variant="hero" />
          {nextMilestone && (
            <CountdownTimer targetDate={nextMilestone.due_date} label={nextMilestone.title} />
          )}

          {/* Milestones stat */}
          <div className="card-gradient p-4">
            <div className="relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-indigo-400">{completedMilestones}</span>
                <span className="font-mono text-lg text-zinc-600">/{totalMilestones}</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1">milestones</div>
              <div className="mt-3">
                <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full progress-bar" style={{ width: `${milestonePercent}%` }} />
                </div>
                <div className="text-[10px] text-zinc-600 font-mono mt-1">{milestonePercent}%</div>
              </div>
            </div>
          </div>

          {/* Words stat */}
          <div className="card-gradient p-4">
            <div className="relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold text-emerald-400">{(totalWords / 1000).toFixed(1)}</span>
                <span className="font-mono text-sm text-zinc-600">k words</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1">
                of {(targetWords / 1000).toFixed(0)}k target
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full progress-bar" style={{ width: `${wordPercent}%` }} />
                </div>
                <div className="text-[10px] text-zinc-600 font-mono mt-1">{wordPercent.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Phase & Tabs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Phase */}
            <div className={`rounded-2xl bg-gradient-to-r ${phase.color} border p-5 animate-in`} style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                  🔧
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Current Phase</div>
                  <div className="font-display text-lg mt-0.5">{phase.label}</div>
                  <div className="text-[12px] text-zinc-400 mt-0.5">{phase.description}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Milestone</div>
                  <div className="text-sm text-zinc-300 mt-0.5 font-body">Week {(() => { const weekNum = Math.ceil((now.getTime() - new Date('2026-02-09').getTime()) / (7 * 24 * 60 * 60 * 1000)); return Math.max(1, Math.min(weekNum, 18)); })()} of 18</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 flex-wrap animate-in" style={{ animationDelay: '200ms' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab.key
                      ? 'bg-zinc-800/80 text-white border border-zinc-700/50 shadow-lg shadow-black/20 tab-active'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
                  }`}
                >
                  <span className="mr-1 text-[10px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              {activeTab === 'papers' && (
                <span className="text-[11px] text-zinc-600 font-mono">{papers.length} papers</span>
              )}
            </div>

            {/* Content */}
            <div className="min-h-[500px] animate-in" style={{ animationDelay: '250ms' }}>
              {activeTab === 'timeline' && (
                <TimelineView milestones={milestones} />
              )}

              {activeTab === 'deliverables' && (
                <AdvisorDeliverables deliverables={deliverables} />
              )}

              {activeTab === 'writing' && (
                <div className="card-glass p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">✍️</div>
                    <h2 className="font-display text-lg">Writing Progress</h2>
                  </div>
                  <WritingProgress sections={sections} />
                </div>
              )}

              {activeTab === 'papers' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📄</div>
                    <h2 className="font-display text-lg">Research Library</h2>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-zinc-500">{papers.length} papers</span>
                      <span className="text-green-500">{papers.filter(p => p.review_status === 'cited').length} cited</span>
                      <span className="text-blue-500">{papers.filter(p => p.review_status === 'reviewed').length} reviewed</span>
                      <span className="text-zinc-600">{papers.filter(p => !p.review_status || p.review_status === 'unread').length} unread</span>
                    </div>
                  </div>
                  <PapersList papers={papers} />
                </div>
              )}

              {activeTab === 'briefs' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📰</div>
                    <h2 className="font-display text-lg">Daily Briefs</h2>
                  </div>
                  <DailyBriefs />
                </div>
              )}

              {activeTab === 'content' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">✍️</div>
                    <h2 className="font-display text-lg">Content Pipeline</h2>
                  </div>
                  <ContentIdeas ideas={contentIdeas} />
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Notion Tasks */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 animate-in" style={{ animationDelay: '300ms' }}>
               <NotionTasks />
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/30 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-[11px] text-zinc-700 font-mono">mission-control v0.2</span>
          <span className="text-[11px] text-zinc-700">Next.js · Supabase · Notion · 🐙</span>
        </div>
      </footer>
    </div>
  )
}
