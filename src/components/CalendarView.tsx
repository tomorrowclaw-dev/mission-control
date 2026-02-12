'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
} from 'date-fns'
import { getMilestones } from '@/lib/data'
import { Milestone } from '@/lib/types'

// ─── Types ───
type EventType = 'milestone' | 'cron' | 'deadline'

interface CalendarEvent {
  id: string
  title: string
  time?: string
  type: EventType
  phase?: Milestone['phase']
  status?: Milestone['status']
  priority?: Milestone['priority']
}

// ─── Cron Schedule Definitions ───
const CRON_SCHEDULES: {
  label: string
  time: string
  days: number[] | 'daily' // 0=Sun
}[] = [
  { label: 'Daily Brief', time: '9:00 AM', days: 'daily' },
  { label: 'Research Sync', time: '8:00 AM', days: [0] },
  { label: 'Content Gen', time: '7:00 AM', days: 'daily' },
  { label: 'Proactive 10', time: '10:00 AM', days: 'daily' },
  { label: 'Proactive 14', time: '2:00 PM', days: 'daily' },
  { label: 'Proactive 18', time: '6:00 PM', days: 'daily' },
  { label: 'Task Reminder', time: '12:00 PM', days: 'daily' },
  { label: 'Task Reminder', time: '5:00 PM', days: 'daily' },
]

// ─── Phase colors mapping ───
const PHASE_COLORS: Record<string, string> = {
  build: 'var(--phase-build)',
  'data-collection': 'var(--phase-data)',
  analysis: 'var(--phase-analysis)',
  writing: 'var(--phase-writing)',
  defense: 'var(--phase-defense)',
}

// ─── Defense Date ───
const DEFENSE_DATE = '2026-06-28'

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCrons, setShowCrons] = useState(false)

  useEffect(() => {
    getMilestones().then(setMilestones).catch(console.error)
  }, [])

  // Build event map: dateKey -> CalendarEvent[]
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    const addEvent = (dateKey: string, event: CalendarEvent) => {
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(event)
    }

    // Milestones
    for (const m of milestones) {
      const key = m.due_date.split('T')[0]
      const isDefense = m.phase === 'defense' && m.priority === 'critical'
      addEvent(key, {
        id: m.id,
        title: m.title,
        type: isDefense ? 'deadline' : 'milestone',
        phase: m.phase,
        status: m.status,
        priority: m.priority,
      })
    }

    // Defense date
    const defenseKey = DEFENSE_DATE
    const hasDefense = map.get(defenseKey)?.some((e) => e.type === 'deadline')
    if (!hasDefense) {
      addEvent(defenseKey, {
        id: 'defense',
        title: '🎓 Thesis Defense',
        type: 'deadline',
      })
    }

    // Cron events (only if toggled on, generate for visible month range)
    if (showCrons) {
      const monthStart = startOfWeek(startOfMonth(currentMonth))
      const monthEnd = endOfWeek(endOfMonth(currentMonth))
      let day = monthStart
      while (day <= monthEnd) {
        const dayOfWeek = getDay(day)
        const dateKey = format(day, 'yyyy-MM-dd')
        for (const cron of CRON_SCHEDULES) {
          if (cron.days === 'daily' || cron.days.includes(dayOfWeek)) {
            addEvent(dateKey, {
              id: `cron-${cron.label}-${cron.time}-${dateKey}`,
              title: cron.label,
              time: cron.time,
              type: 'cron',
            })
          }
        }
        day = addDays(day, 1)
      }
    }

    return map
  }, [milestones, showCrons, currentMonth])

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const weeks: Date[][] = []
  let day = gridStart
  while (day <= gridEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const selectedEvents = selectedDate
    ? eventMap.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="btn-ghost p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h3 className="font-display text-lg tracking-tight min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="btn-ghost p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="btn btn-secondary text-xs px-3 py-1.5"
          >
            Today
          </button>
          <button
            onClick={() => setShowCrons(!showCrons)}
            className={`btn text-xs px-3 py-1.5 transition-all ${
              showCrons
                ? 'bg-[var(--phase-data)]/15 text-[var(--phase-data)] border-[var(--phase-data)]/30'
                : 'btn-secondary'
            }`}
          >
            <span className="font-mono text-[10px]">⏰</span> Crons
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[11px] font-mono" style={{ color: 'var(--text-dim)' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          Milestone
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
          Deadline
        </div>
        {showCrons && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--phase-data)' }} />
            Cron Job
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="px-2 py-2.5 text-center text-[11px] font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-dim)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7"
            style={{ borderBottom: wi < weeks.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            {week.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const events = eventMap.get(dateKey) || []
              const inMonth = isSameMonth(date, currentMonth)
              const today = isToday(date)
              const selected = selectedDate && isSameDay(date, selectedDate)
              const hasDeadline = events.some((e) => e.type === 'deadline')
              const hasMilestone = events.some((e) => e.type === 'milestone')
              const hasCron = events.some((e) => e.type === 'cron')

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(selected ? null : date)}
                  className="relative min-h-[72px] md:min-h-[88px] p-1.5 text-left transition-all duration-150 hover:z-10 group"
                  style={{
                    background: selected
                      ? 'var(--accent-muted)'
                      : today
                        ? 'var(--card-hover)'
                        : 'transparent',
                    borderRight: '1px solid var(--border)',
                    opacity: inMonth ? 1 : 0.3,
                  }}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono leading-none ${
                        today ? 'font-bold' : 'font-normal'
                      }`}
                      style={{
                        color: today
                          ? 'var(--accent)'
                          : selected
                            ? 'var(--text)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {format(date, 'd')}
                    </span>
                    {today && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)' }}
                      />
                    )}
                  </div>

                  {/* Event dots / pills */}
                  <div className="space-y-0.5">
                    {/* Show milestone/deadline pills (max 2 visible) */}
                    {events
                      .filter((e) => e.type !== 'cron')
                      .slice(0, 2)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="text-[9px] leading-tight px-1 py-0.5 rounded truncate font-mono"
                          style={{
                            background:
                              event.type === 'deadline'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : event.phase
                                  ? `color-mix(in srgb, ${PHASE_COLORS[event.phase] || 'var(--accent)'} 15%, transparent)`
                                  : 'var(--accent-muted)',
                            color:
                              event.type === 'deadline'
                                ? 'var(--danger)'
                                : event.phase
                                  ? PHASE_COLORS[event.phase]
                                  : 'var(--accent)',
                          }}
                        >
                          {event.title.length > 16 ? event.title.slice(0, 15) + '…' : event.title}
                        </div>
                      ))}

                    {/* Overflow indicator */}
                    {events.filter((e) => e.type !== 'cron').length > 2 && (
                      <div className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>
                        +{events.filter((e) => e.type !== 'cron').length - 2} more
                      </div>
                    )}

                    {/* Cron dot indicator */}
                    {hasCron && !hasDeadline && !hasMilestone && (
                      <div className="flex gap-0.5 mt-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: 'var(--phase-data)', opacity: 0.6 }}
                        />
                      </div>
                    )}
                    {hasCron && (hasDeadline || hasMilestone) && (
                      <div className="flex gap-0.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: 'var(--phase-data)', opacity: 0.5 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Selection ring */}
                  {selected && (
                    <div
                      className="absolute inset-0 rounded-sm pointer-events-none"
                      style={{ boxShadow: 'inset 0 0 0 2px var(--accent)', opacity: 0.4 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <div
          className="card-glass p-5 animate-in fade-slide"
          style={{ animationDuration: '0.25s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: 'var(--accent-muted)',
                border: '1px solid var(--accent)',
                borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
              }}
            >
              📋
            </div>
            <div>
              <h4 className="font-display text-base">{format(selectedDate, 'EEEE, MMMM d')}</h4>
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-dim)' }}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              No events scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {/* Group: milestones & deadlines first */}
              {selectedEvents
                .filter((e) => e.type !== 'cron')
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                    style={{
                      background:
                        event.type === 'deadline'
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'var(--accent-muted)',
                      border: '1px solid',
                      borderColor:
                        event.type === 'deadline'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'color-mix(in srgb, var(--accent) 12%, transparent)',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{
                        background: event.type === 'deadline' ? 'var(--danger)' : event.phase ? PHASE_COLORS[event.phase] : 'var(--accent)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-body" style={{ color: 'var(--text)' }}>
                        {event.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {event.phase && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              background: `color-mix(in srgb, ${PHASE_COLORS[event.phase]} 12%, transparent)`,
                              color: PHASE_COLORS[event.phase],
                            }}
                          >
                            {event.phase}
                          </span>
                        )}
                        {event.status && (
                          <span
                            className="text-[10px] font-mono"
                            style={{
                              color:
                                event.status === 'complete'
                                  ? 'var(--success)'
                                  : event.status === 'in_progress'
                                    ? 'var(--phase-data)'
                                    : event.status === 'blocked'
                                      ? 'var(--danger)'
                                      : 'var(--text-dim)',
                            }}
                          >
                            {event.status === 'complete' ? '✓ Done' : event.status === 'in_progress' ? '◉ Active' : event.status === 'blocked' ? '✕ Blocked' : '○ Pending'}
                          </span>
                        )}
                        {event.priority === 'critical' && (
                          <span className="text-[10px] font-mono" style={{ color: 'var(--danger)' }}>
                            ● Critical
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Cron events grouped */}
              {selectedEvents.filter((e) => e.type === 'cron').length > 0 && (
                <div className="mt-3">
                  <div
                    className="text-[10px] font-mono uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Scheduled Jobs
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedEvents
                      .filter((e) => e.type === 'cron')
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
                          style={{
                            background: 'rgba(59, 130, 246, 0.06)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: 'var(--phase-data)', opacity: 0.7 }}
                          />
                          <div className="min-w-0">
                            <div className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                              {event.title}
                            </div>
                            <div className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                              {event.time}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
