'use client'

import { useState, useEffect } from 'react'
import { differenceInDays, format } from 'date-fns'
import CountdownTimer from '@/components/CountdownTimer'
import TimelineView from '@/components/TimelineView'
import WritingProgress from '@/components/WritingProgress'
import PapersList from '@/components/PapersList'
import NotionTasks from '@/components/NotionTasks'
import { getMilestones, getWritingSections, getPapers } from '@/lib/data'
import { Milestone, WritingSection, Paper } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

type Tab = 'timeline' | 'writing' | 'papers' | 'meetings'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [sections, setSections] = useState<WritingSection[]>([])
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [m, s, p] = await Promise.all([getMilestones(), getWritingSections(), getPapers()])
        setMilestones(m)
        setSections(s)
        setPapers(p)
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
          <div className="text-5xl mb-4">🎓</div>
          <div className="text-zinc-500 font-body text-sm tracking-wide animate-pulse">
            Initializing Command Center...
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
    { key: 'writing', label: 'Writing', icon: '◇' },
    { key: 'papers', label: 'Research', icon: '◈' },
    { key: 'meetings', label: 'Meetings', icon: '◉' },
  ]

  const phaseInfo: Record<string, { label: string; color: string; description: string }> = {
    'build': { label: 'System Build & Stabilization', color: 'from-violet-500/15 to-violet-500/0 border-violet-500/20', description: 'Get the RAG-based risk assessment assistant fully functional and test-ready' },
    'data-collection': { label: 'Data Collection', color: 'from-blue-500/15 to-blue-500/0 border-blue-500/20', description: 'Complete all usability sessions and capture complete datasets' },
    'analysis': { label: 'Analysis & Results', color: 'from-emerald-500/15 to-emerald-500/0 border-emerald-500/20', description: 'Finish analysis and write the Results section' },
    'writing': { label: 'Writing', color: 'from-amber-500/15 to-amber-500/0 border-amber-500/20', description: 'Situate findings and finalize the thesis narrative' },
    'defense': { label: 'Final Draft & Defense', color: 'from-rose-500/15 to-rose-500/0 border-rose-500/20', description: 'Produce a submission-quality thesis and successfully defend' },
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
                🎓
              </div>
              <div>
                <h1 className="font-display text-lg tracking-tight">Thesis Command Center</h1>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in">
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
                  <div className="text-sm text-zinc-300 mt-0.5 font-body">End of Feb: Build complete</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 animate-in" style={{ animationDelay: '200ms' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab.key
                      ? 'bg-zinc-800/80 text-white border border-zinc-700/50 shadow-lg shadow-black/20 tab-active'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
                  }`}
                >
                  <span className="mr-1.5 text-[10px]">{tab.icon}</span>
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

              {activeTab === 'meetings' && (
                <div className="card-glass p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl mx-auto">
                    🎙️
                  </div>
                  <h3 className="font-display text-xl mt-5">Meeting Notes</h3>
                  <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Send Plaud transcripts to Clyde and they&apos;ll appear here — auto-summarized with action items extracted.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-[11px] text-zinc-600 font-mono bg-zinc-800/30 rounded-full px-4 py-2 border border-zinc-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                    Next advisor meeting: Wednesday ~1:30 PM
                  </div>
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
          <span className="text-[11px] text-zinc-700 font-mono">thesis-command-center v0.1</span>
          <span className="text-[11px] text-zinc-700">Next.js · Supabase · 🐙</span>
        </div>
      </footer>
    </div>
  )
}
