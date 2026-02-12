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
import ActivityFeed from '@/components/ActivityFeed'
import ScheduledTasks from '@/components/ScheduledTasks'
import GlobalSearch from '@/components/GlobalSearch'
import { getMilestones, getWritingSections, getPapers, getContentIdeas, getAdvisorDeliverables } from '@/lib/data'
import { Milestone, WritingSection, Paper, ContentIdea, AdvisorDeliverable } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

type Tab = 'timeline' | 'writing' | 'papers' | 'content' | 'deliverables' | 'briefs' | 'activity' | 'schedule' | 'search'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('activity')
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

  const tabs: { key: Tab; label: string; icon: string; group: 'dashboard' | 'thesis' }[] = [
    { key: 'activity', label: 'Activity', icon: '●', group: 'dashboard' },
    { key: 'schedule', label: 'Schedule', icon: '◈', group: 'dashboard' },
    { key: 'search', label: 'Search', icon: '◉', group: 'dashboard' },
    { key: 'timeline', label: 'Thesis', icon: '◆', group: 'thesis' },
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
      <header className="sticky top-0 z-50 bg-[#06060b]/90 backdrop-blur-md header-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
                🐙
              </div>
              <div>
                <h1 className="font-display text-lg tracking-tight">Mission Control</h1>
                <p className="text-[11px] text-zinc-500 font-mono tracking-wide mt-0.5">
                  OpenClaw HQ · Clyde &amp; Crew
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
          {/* Alive indicator */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Countdown + Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in">
          <div className="sm:col-span-2">
            <CountdownTimer targetDate={defenseDate} label="Defense Day" variant="hero" />
          </div>

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

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap animate-in" style={{ animationDelay: '150ms' }}>
          {tabs.filter(t => t.group === 'dashboard').map((tab) => (
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
          <div className="w-px h-6 bg-zinc-800/50 mx-2" />
          {tabs.filter(t => t.group === 'thesis').map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                activeTab === tab.key
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/5 tab-active'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
              }`}
            >
              <span className="mr-1 text-[10px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="min-h-[500px] animate-in" style={{ animationDelay: '200ms' }}>
              {activeTab === 'activity' && <ActivityFeed />}
              {activeTab === 'schedule' && <ScheduledTasks />}
              {activeTab === 'search' && <GlobalSearch />}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Phase card — only on thesis tab */}
                  <div className={`rounded-2xl bg-gradient-to-r ${phase.color} border p-5`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">🔧</div>
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
                  <TimelineView milestones={milestones} />
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
          <span className="text-[11px] text-zinc-700 font-mono">mission-control v1.0</span>
          <span className="text-[11px] text-zinc-600 italic font-body">
            {['Ship research, not chaos.', 'One milestone at a time.', 'Trust the process.', 'Build → Evaluate → Write → Defend.', 'The artifact is the argument.'][Math.floor(Date.now() / 86400000) % 5]}
          </span>
        </div>
      </footer>
    </div>
  )
}
