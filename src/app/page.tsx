'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import CountdownTimer from '@/components/CountdownTimer'
import TimelineView from '@/components/TimelineView'
import NotionTasks from '@/components/NotionTasks'
import ActivityFeed from '@/components/ActivityFeed'
import CalendarView from '@/components/CalendarView'
import GlobalSearch from '@/components/GlobalSearch'
import CrewViz from '@/components/CrewViz'
import { getMilestones, getWritingSections } from '@/lib/data'
import { Milestone, WritingSection } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

type Tab = 'activity' | 'schedule' | 'search' | 'crew' | 'timeline'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('activity')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [sections, setSections] = useState<WritingSection[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [m, s] = await Promise.all([getMilestones(), getWritingSections()])
        setMilestones(m)
        setSections(s)
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
          <div className="text-5xl mb-4">🐙</div>
          <div className="text-zinc-500 font-body text-sm tracking-wide animate-pulse">
            Initializing Mission Control...
          </div>
        </div>
      </div>
    )
  }

  const defenseDate = '2026-06-28'
  const now = new Date()

  const completedMilestones = milestones.filter(m => m.status === 'complete').length
  const totalMilestones = milestones.length
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const totalWords = sections.reduce((sum, s) => sum + s.current_word_count, 0)
  const targetWords = sections.reduce((sum, s) => sum + (s.target_word_count || 0), 0)
  const wordPercent = targetWords > 0 ? (totalWords / targetWords) * 100 : 0

  const nextMilestone = milestones.find(m => m.status !== 'complete' && new Date(m.due_date) >= now)
  const currentPhase = nextMilestone?.phase || 'build'

  const navItems: { key: Tab; label: string; icon: string; section: 'main' | 'thesis' }[] = [
    { key: 'activity', label: 'Activity', icon: '●', section: 'main' },
    { key: 'schedule', label: 'Schedule', icon: '◈', section: 'main' },
    { key: 'search', label: 'Search', icon: '◉', section: 'main' },
    { key: 'crew', label: 'Crew HQ', icon: '🐙', section: 'main' },
    { key: 'timeline', label: 'Thesis', icon: '◆', section: 'thesis' },
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
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-60 z-50
        bg-[var(--surface)] border-r border-[var(--border)]
        flex flex-col
        transition-transform duration-200 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
              🐙
            </div>
            <div>
              <h1 className="font-display text-sm tracking-tight">Mission Control</h1>
              <p className="text-[9px] text-[var(--text-dim)] font-mono tracking-wide">OpenClaw HQ</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-mono px-3 py-2">Dashboard</div>
          {navItems.filter(n => n.section === 'main').map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === item.key
                  ? 'bg-[var(--accent-glow)] text-[var(--accent-bright)] border border-[var(--glass-border-hover)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] border border-transparent'
              }`}
            >
              <span className="text-[10px] w-4 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="h-px bg-[var(--border)] my-3 mx-2" />

          <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-mono px-3 py-2">Research</div>
          {navItems.filter(n => n.section === 'thesis').map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === item.key
                  ? 'bg-[var(--accent-glow)] text-[var(--accent-bright)] border border-[var(--glass-border-hover)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] border border-transparent'
              }`}
            >
              <span className="text-[10px] w-4 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-secondary)] font-body">James Heldridge</div>
            <div className="text-[9px] text-[var(--text-dim)] font-mono">UNL · {format(now, 'MMM d, yyyy')}</div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <span className="font-display text-sm">Mission Control</span>
            <ThemeToggle />
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in">
            <CountdownTimer targetDate={defenseDate} label="Defense Day" variant="hero" />

            <div className="instrument p-4">
              <div className="relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-[var(--accent)]">{completedMilestones}</span>
                  <span className="font-mono text-lg text-zinc-600">/{totalMilestones}</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1">milestones</div>
                <div className="mt-3">
                  <div className="h-1 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full progress-bar" style={{ width: `${milestonePercent}%` }} />
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono mt-1">{milestonePercent}%</div>
                </div>
              </div>
            </div>

            <div className="instrument p-4 overflow-y-auto max-h-[180px]">
              <NotionTasks />
            </div>
          </div>

          {/* Content area — full width */}
          <div key={activeTab} className="min-h-[500px] animate-in" style={{ animationDelay: '100ms' }}>
            {activeTab === 'activity' && <ActivityFeed />}
            {activeTab === 'schedule' && <CalendarView />}
            {activeTab === 'search' && <GlobalSearch />}
            {activeTab === 'crew' && <CrewViz />}

            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className={`rounded-2xl bg-gradient-to-r ${phase.color} border p-5`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">🔧</div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Current Phase</div>
                      <div className="font-display text-lg mt-0.5">{phase.label}</div>
                      <div className="text-[12px] text-zinc-400 mt-0.5">{phase.description}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Progress</div>
                      <div className="text-sm text-zinc-300 mt-0.5 font-body">Week {(() => { const weekNum = Math.ceil((now.getTime() - new Date('2026-02-09').getTime()) / (7 * 24 * 60 * 60 * 1000)); return Math.max(1, Math.min(weekNum, 18)); })()} of 18</div>
                    </div>
                  </div>
                </div>
                <TimelineView milestones={milestones} />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] mt-8">
          <div className="max-w-5xl px-6 lg:px-8 py-4 flex items-center justify-between">
            <span className="text-[9px] text-[var(--text-dim)] font-mono opacity-50">mission-control v1.1</span>
            <span className="text-[9px] text-[var(--text-dim)] italic font-body opacity-40">
              {['Ship research, not chaos.', 'One milestone at a time.', 'Trust the process.', 'Build. Evaluate. Write. Defend.', 'The artifact is the argument.'][Math.floor(Date.now() / 86400000) % 5]}
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
