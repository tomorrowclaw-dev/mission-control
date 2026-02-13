'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

interface ActionItem {
  task: string
  assignee?: string
  deadline?: string
  status?: 'pending' | 'in-progress' | 'done'
  priority?: 'high' | 'medium' | 'low'
}

interface KeyDecision {
  decision: string
  context?: string
  impact?: string
}

interface AgendaItem {
  topic: string
  context?: string
  priority?: 'high' | 'medium' | 'low'
}

interface MeetingAnalysis {
  id: string
  meeting_type: string
  meeting_date: string
  summary: string
  action_items: ActionItem[]
  key_decisions: KeyDecision[]
  next_agenda: AgendaItem[]
  themes: string[]
  attendees: string[]
  analyzed_at: string
}

const MEETING_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  thesis: { label: 'Thesis Meeting', emoji: '📝', color: 'emerald' },
  'tlab-leadership': { label: 'T*Lab Leadership', emoji: '🔬', color: 'violet' },
  tlab: { label: 'T*Lab', emoji: '🔬', color: 'purple' },
  hra: { label: 'HRA 2.0', emoji: '🔒', color: 'amber' },
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const STATUS_ICONS: Record<string, string> = {
  pending: '⬜',
  'in-progress': '🔄',
  done: '✅',
}

export default function MeetingIntel() {
  const [meetings, setMeetings] = useState<MeetingAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingAnalysis | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [activeSection, setActiveSection] = useState<'summary' | 'actions' | 'decisions' | 'agenda'>('summary')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/meetings')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (Array.isArray(data)) {
          setMeetings(data)
          if (data.length > 0) setSelectedMeeting(data[0])
        }
      } catch (err) {
        setError('Could not load meeting analysis')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filterType === 'all' 
    ? meetings 
    : meetings.filter(m => m.meeting_type === filterType)

  const meetingTypes = [...new Set(meetings.map(m => m.meeting_type))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">🎙️</div>
          <div className="text-sm text-[var(--text-dim)]">Loading meeting intelligence...</div>
        </div>
      </div>
    )
  }

  if (error || meetings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="instrument p-8 text-center">
          <div className="text-4xl mb-4">🎙️</div>
          <h3 className="font-display text-lg text-[var(--text)] mb-2">Meeting Intelligence</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {error || 'No meeting analyses yet. Record a meeting with Plaud, sync to Notion, and Clyde will analyze it automatically.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs text-[var(--text-secondary)]">
            <span>🔄</span>
            <span>Pipeline: Plaud → Notion → AI Analysis → Dashboard</span>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Record', emoji: '🎙️', desc: 'Plaud captures audio', status: 'ready' },
            { step: '2', label: 'Sync', emoji: '📝', desc: 'Auto-syncs to Notion', status: 'ready' },
            { step: '3', label: 'Analyze', emoji: '🧠', desc: 'AI extracts insights', status: 'ready' },
            { step: '4', label: 'Display', emoji: '📊', desc: 'Shows on dashboard', status: 'ready' },
          ].map((s) => (
            <div key={s.step} className="instrument p-4 text-center">
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="text-xs font-semibold text-[var(--text)]">{s.label}</div>
              <div className="text-[10px] text-[var(--text-dim)] mt-1">{s.desc}</div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] text-emerald-400">Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const config = selectedMeeting ? MEETING_TYPE_CONFIG[selectedMeeting.meeting_type] || { label: selectedMeeting.meeting_type, emoji: '📋', color: 'zinc' } : null

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center text-sm">
            🎙️
          </div>
          <h2 className="font-display text-xl">Meeting Intelligence</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              filterType === 'all' ? 'bg-accent/20 text-[var(--accent)] border border-accent/20' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
            }`}
          >
            All
          </button>
          {meetingTypes.map(type => {
            const cfg = MEETING_TYPE_CONFIG[type] || { label: type, emoji: '📋' }
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  filterType === type ? 'bg-accent/20 text-[var(--accent)] border border-accent/20' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List */}
        <div className="lg:col-span-1 space-y-2">
          {filtered.map(meeting => {
            const cfg = MEETING_TYPE_CONFIG[meeting.meeting_type] || { label: meeting.meeting_type, emoji: '📋', color: 'zinc' }
            const isSelected = selectedMeeting?.id === meeting.id
            const actionCount = meeting.action_items?.length || 0
            const doneCount = meeting.action_items?.filter(a => a.status === 'done').length || 0

            return (
              <button
                key={meeting.id}
                onClick={() => setSelectedMeeting(meeting)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-accent/10 border border-accent/20 shadow-lg shadow-accent/5' 
                    : 'instrument hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text)] truncate">{cfg.label}</div>
                    <div className="text-[10px] font-mono text-[var(--text-dim)]">
                      {format(parseISO(meeting.meeting_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {actionCount > 0 && (
                    <div className="text-[10px] font-mono text-[var(--text-dim)]">
                      {doneCount}/{actionCount}
                    </div>
                  )}
                </div>
                {meeting.themes && meeting.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meeting.themes.slice(0, 3).map((theme, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--text-dim)]">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Meeting Detail */}
        {selectedMeeting && config && (
          <div className="lg:col-span-2 space-y-4">
            {/* Meeting Header */}
            <div className="instrument p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{config.emoji}</span>
                <div>
                  <h3 className="font-display text-lg text-[var(--text)]">{config.label}</h3>
                  <div className="text-xs text-[var(--text-secondary)] font-mono">
                    {format(parseISO(selectedMeeting.meeting_date), 'EEEE, MMMM d, yyyy')}
                    {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                      <span> · {selectedMeeting.attendees.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-black/20">
                {([
                  { key: 'summary', label: 'Summary', icon: '📋' },
                  { key: 'actions', label: `Actions (${selectedMeeting.action_items?.length || 0})`, icon: '✅' },
                  { key: 'decisions', label: `Decisions (${selectedMeeting.key_decisions?.length || 0})`, icon: '⚡' },
                  { key: 'agenda', label: 'Next Agenda', icon: '📅' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      activeSection === tab.key
                        ? 'bg-accent/20 text-[var(--accent)]'
                        : 'text-[var(--text-dim)] hover:text-[var(--text)]'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Content */}
            <div className="instrument p-5">
              {activeSection === 'summary' && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {selectedMeeting.summary || 'No summary available.'}
                  </p>
                  {selectedMeeting.themes && selectedMeeting.themes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Themes</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.themes.map((theme, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-[var(--accent)]">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'actions' && (
                <div className="space-y-3">
                  {(selectedMeeting.action_items || []).length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-dim)]">No action items extracted</div>
                  ) : (
                    selectedMeeting.action_items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                        <span className="text-sm mt-0.5">{STATUS_ICONS[item.status || 'pending']}</span>
                        <div className="flex-1">
                          <div className="text-sm text-[var(--text)]">{item.task}</div>
                          <div className="flex items-center gap-3 mt-1">
                            {item.assignee && (
                              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                👤 {item.assignee}
                              </span>
                            )}
                            {item.deadline && (
                              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                📅 {item.deadline}
                              </span>
                            )}
                            {item.priority && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                                {item.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'decisions' && (
                <div className="space-y-3">
                  {(selectedMeeting.key_decisions || []).length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-dim)]">No key decisions extracted</div>
                  ) : (
                    selectedMeeting.key_decisions.map((dec, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/20 border border-white/5">
                        <div className="flex items-start gap-2">
                          <span className="text-sm">⚡</span>
                          <div>
                            <div className="text-sm font-medium text-[var(--text)]">{dec.decision}</div>
                            {dec.context && (
                              <div className="text-xs text-[var(--text-dim)] mt-1">{dec.context}</div>
                            )}
                            {dec.impact && (
                              <div className="text-xs text-amber-400/80 mt-1">Impact: {dec.impact}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'agenda' && (
                <div className="space-y-3">
                  {(selectedMeeting.next_agenda || []).length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-dim)]">No agenda generated yet</div>
                  ) : (
                    <>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-3">
                        Suggested agenda for next meeting
                      </div>
                      {selectedMeeting.next_agenda.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                          <span className="text-sm font-mono text-[var(--accent)]">{i + 1}.</span>
                          <div className="flex-1">
                            <div className="text-sm text-[var(--text)]">{item.topic}</div>
                            {item.context && (
                              <div className="text-xs text-[var(--text-dim)] mt-1">{item.context}</div>
                            )}
                          </div>
                          {item.priority && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
