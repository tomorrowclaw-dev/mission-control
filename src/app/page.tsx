'use client'

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
import MeetingNotes from '@/components/MeetingNotes'
import CalendarView from '@/components/CalendarView'
import WeeklyMeetingCalendar from '@/components/WeeklyMeetingCalendar'
import CrewViz from '@/components/CrewViz'
import ContentHub from '@/components/ContentHub'
import ActivityFeed from '@/components/ActivityFeed'
import UpcomingMeetings from '@/components/UpcomingMeetings'
import MeetingIntel from '@/components/MeetingIntel'
import { getMilestones, getWritingSections, getPapers, getContentIdeas, getAdvisorDeliverables } from '@/lib/data'
import { Milestone, WritingSection, Paper, ContentIdea, AdvisorDeliverable } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

type Tab = 'activity' | 'content' | 'meetings' | 'schedule' | 'search' | 'crew' | 'thesis' | 'calendar'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('activity')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [sections, setSections] = useState<WritingSection[]>([])
  const [papers, setPapers] = useState<Paper[]>([])
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [deliverables, setDeliverables] = useState<AdvisorDeliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setGlobalSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🐙</div>
          <div className="text-[var(--text-dim)] font-body text-sm tracking-wide animate-pulse">
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
  const nextMilestone = milestones.find(m => m.status !== 'complete' && new Date(m.due_date) >= now)

  const totalWords = sections.reduce((sum, s) => sum + s.current_word_count, 0)
  const targetWords = sections.reduce((sum, s) => sum + (s.target_word_count || 0), 0)
  const wordPercent = targetWords > 0 ? Math.min(100, (totalWords / targetWords) * 100) : 0

  const navigationItems = [
    { key: 'activity', label: 'Activity', icon: '📡', description: 'Timeline, progress, briefs' },
    { key: 'content', label: 'Content', icon: '💡', description: 'Content pipeline & drafts' },
    { key: 'meetings', label: 'Meetings', icon: '🎙️', description: 'Meeting intelligence & agendas' },
    { key: 'schedule', label: 'Schedule', icon: '📅', description: 'Calendar and meetings' },
    { key: 'search', label: 'Search', icon: '🔍', description: 'Find papers and content' },
    { key: 'crew', label: 'Crew HQ', icon: '🐙', description: 'AI crew visualization' },
  ]

  const thesisItems = [
    { key: 'thesis', label: 'Thesis', icon: '📋', description: 'Writing and deliverables' },
  ]

  const calendarItems = [
    { key: 'calendar', label: 'Calendar', icon: '🗓️', description: 'Weekly meeting view' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'activity': {
        const hour = now.getHours()
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
        const daysLeft = Math.ceil((new Date(defenseDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const readyContent = contentIdeas.filter(c => c.status === 'ready').length
        const draftedContent = contentIdeas.filter(c => c.status === 'drafted').length
        const postedContent = contentIdeas.filter(c => c.status === 'posted').length

        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="instrument p-5">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🐙</div>
                <div>
                  <h2 className="font-display text-xl text-[var(--text)]">{greeting}, James.</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    <span className="font-mono text-[var(--accent)]">{daysLeft}</span> days until defense
                    {totalWords > 0 && <> · <span className="font-mono">{(totalWords/1000).toFixed(1)}k</span> words written</>}
                    {(readyContent + draftedContent) > 0 && <> · <span className="font-mono">{readyContent}</span> content ready, <span className="font-mono">{draftedContent}</span> drafted</>}
                    {postedContent > 0 && <> · <span className="font-mono">{postedContent}</span> posted</>}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="instrument p-4">
                <CountdownTimer targetDate={defenseDate} label="Defense" variant="default" />
              </div>

              <div className="instrument p-4">
                <div className="relative z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-[var(--accent)]">{completedMilestones}</span>
                    <span className="font-mono text-sm text-[var(--text-dim)]">/ {totalMilestones}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] mt-1">Milestones complete</div>
                  <div className="mt-3">
                    <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full progress-bar" style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }} />
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">{totalMilestones > 0 ? ((completedMilestones / totalMilestones) * 100).toFixed(1) : '0.0'}%</div>
                  </div>
                </div>
              </div>

              <div className="instrument p-4">
                <div className="relative z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-[var(--accent)]">{(totalWords/1000).toFixed(1)}</span>
                    <span className="font-mono text-sm text-[var(--text-dim)]">k words</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] mt-1">of {(targetWords/1000).toFixed(0)}k target</div>
                  <div className="mt-3">
                    <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full progress-bar" style={{ width: `${wordPercent}%` }} />
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">{wordPercent.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="instrument p-4">
                <div className="relative z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-[var(--accent)]">{papers.length}</span>
                    <span className="font-mono text-sm text-[var(--text-dim)]">items</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] mt-1">Synced from Notion</div>
                  <div className="mt-3 text-[10px] text-[var(--text-dim)] font-mono">Research library + weekly tasks</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  ◆
                </div>
                <h2 className="font-display text-xl">Project Timeline</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <TimelineView milestones={milestones} />
            </div>

            {/* Daily Briefs */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/20 flex items-center justify-center text-sm">
                  📰
                </div>
                <h2 className="font-display text-xl">Daily Briefs</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <DailyBriefs />
            </div>

            {/* Activity Feed */}
            <div className="card-glass p-6">
              <ActivityFeed />
            </div>

          </div>
        )
      }
      case 'content':
        return <ContentHub />

      case 'meetings':
        return <MeetingIntel />

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  📅
                </div>
                <h2 className="font-display text-xl">Calendar</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <CalendarView />
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  🎙️
                </div>
                <h2 className="font-display text-xl">Meeting Notes</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <MeetingNotes />
            </div>
          </div>
        )

      case 'search':
        return (
          <div className="space-y-6">
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  📄
                </div>
                <h2 className="font-display text-xl">Research Library</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <PapersList papers={papers} />
            </div>
          </div>
        )

      case 'crew':
        return <CrewViz />

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  🗓️
                </div>
                <h2 className="font-display text-xl">Weekly Calendar</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <WeeklyMeetingCalendar />
            </div>
          </div>
        )

      case 'thesis':
        return (
          <div className="space-y-6">
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  ✍️
                </div>
                <h2 className="font-display text-xl">Writing Progress</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <WritingProgress sections={sections} />
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
                  📋
                </div>
                <h2 className="font-display text-xl">Advisor Deliverables</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              </div>
              <AdvisorDeliverables deliverables={deliverables} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xl">🐙</span>
          <span className="font-display text-lg">Mission Control</span>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 flex items-center justify-center text-lg">
              🐙
            </div>
            <div>
              <h1 className="font-display text-lg tracking-tight text-[var(--text)]">Mission Control</h1>
              <p className="text-xs text-[var(--text-secondary)] font-mono tracking-wide mt-0.5">
                K-12 Risk Assessment
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as Tab)
                  setSidebarOpen(false)
                }}
                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              >
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div>{item.label}</div>
                  <div className="text-xs text-[var(--text-dim)] mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="nav-divider" />

          <div className="space-y-1">
            {calendarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as Tab)
                  setSidebarOpen(false)
                }}
                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              >
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div>{item.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="nav-divider" />

          <div className="space-y-1">
            {thesisItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as Tab)
                  setSidebarOpen(false)
                }}
                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
              >
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div>{item.label}</div>
                  <div className="text-xs text-[var(--text-dim)] mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="space-y-3">
            <div className="text-xs text-[var(--text-dim)]">
              <div>James Heldridge · UNL</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="status-indicator"></div>
                <span>Live</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-zinc-800/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-[var(--text-secondary)]">
                  {format(now, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              
              <button
                onClick={() => setGlobalSearchOpen(true)}
                className="search-trigger"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search...</span>
                <span className="kbd">⌘K</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={activeTab === 'crew' ? 'p-2' : 'p-6'}>
          <div className={activeTab === 'crew' ? '' : 'max-w-7xl mx-auto'}>
            <div className={activeTab === 'crew' ? '' : 'grid grid-cols-1 xl:grid-cols-4 gap-6'}>
              {/* Main Content */}
              <div className={activeTab === 'crew' ? '' : 'xl:col-span-3'}>
                <div key={activeTab} className="animate-in fade-slide">
                  {renderContent()}
                </div>
              </div>

              {/* Right Sidebar */}
              {(activeTab === 'activity' || activeTab === 'schedule' || activeTab === 'meetings') && (
                <div className="xl:col-span-1 order-first xl:order-last">
                  <div className="right-sidebar space-y-4">
                    <UpcomingMeetings />
                    {activeTab === 'activity' && <NotionTasks />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Global Search Modal */}
      {globalSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-surface border border-zinc-700 rounded-xl p-4 w-full max-w-2xl mx-4">
            <div className="flex items-center gap-3 p-2">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search papers, notes, tasks..."
                className="flex-1 bg-transparent border-none outline-none text-[var(--text)] placeholder-zinc-400"
                autoFocus
              />
              <button
                onClick={() => setGlobalSearchOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <span className="kbd">ESC</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}