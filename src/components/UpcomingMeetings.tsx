'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, isToday, isTomorrow, isPast, addWeeks, isBefore, isAfter } from 'date-fns'

interface Meeting {
  name: string
  day: number // 0=Sun, 1=Mon, ... 6=Sat
  hour: number
  minute: number
  color: string
  emoji: string
  biweekly?: boolean
  biweeklyAnchor?: string // ISO date of a known occurrence
}

const RECURRING_MEETINGS: Meeting[] = [
  { name: 'Technology & Innovation Studio', day: 1, hour: 18, minute: 0, color: 'from-blue-500/20 to-blue-600/10', emoji: '💡' },
  { name: 'Technology & Innovation Studio', day: 3, hour: 18, minute: 0, color: 'from-blue-500/20 to-blue-600/10', emoji: '💡' },
  { name: 'HRA 2.0', day: 2, hour: 16, minute: 0, color: 'from-amber-500/20 to-amber-600/10', emoji: '🔒' },
  { name: 'NCITE Huddle', day: 2, hour: 18, minute: 30, color: 'from-red-500/20 to-red-600/10', emoji: '🛡️' },
  { name: 'T*Lab', day: 5, hour: 9, minute: 0, color: 'from-purple-500/20 to-purple-600/10', emoji: '🔬' },
  { name: 'Thesis Meeting', day: 3, hour: 14, minute: 0, color: 'from-emerald-500/20 to-emerald-600/10', emoji: '📝', biweekly: true, biweeklyAnchor: '2026-02-18' },
]

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h}:${minute.toString().padStart(2, '0')} ${period}`
}

function getRelativeLabel(date: Date): string | null {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return null
}

export default function UpcomingMeetings() {
  const meetings = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const results: { name: string; date: Date; color: string; emoji: string; past: boolean }[] = []

    // Generate meetings for this week and next week
    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      const ws = addWeeks(weekStart, weekOffset)
      for (const m of RECURRING_MEETINGS) {
        const meetingDate = addDays(ws, m.day)
        meetingDate.setHours(m.hour, m.minute, 0, 0)

        // Skip biweekly meetings on off-weeks
        if (m.biweekly && m.biweeklyAnchor) {
          const anchor = new Date(m.biweeklyAnchor)
          anchor.setHours(0, 0, 0, 0)
          const meetingDay = new Date(meetingDate)
          meetingDay.setHours(0, 0, 0, 0)
          const diffDays = Math.round((meetingDay.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24))
          const diffWeeks = Math.round(diffDays / 7)
          if (diffWeeks % 2 !== 0) continue
        }

        results.push({
          name: m.name,
          date: meetingDate,
          color: m.color,
          emoji: m.emoji,
          past: isPast(meetingDate),
        })
      }
    }

    // Sort by date, filter out meetings from before today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    return results
      .filter(m => isAfter(m.date, todayStart) || isToday(m.date))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 8)
  }, [])

  // Group by day
  const grouped = useMemo(() => {
    const groups: { label: string; dateStr: string; meetings: typeof meetings }[] = []
    const seen = new Map<string, typeof meetings>()

    for (const m of meetings) {
      const key = format(m.date, 'yyyy-MM-dd')
      if (!seen.has(key)) {
        seen.set(key, [])
      }
      seen.get(key)!.push(m)
    }

    for (const [key, items] of seen) {
      const date = items[0].date
      const relative = getRelativeLabel(date)
      const label = relative || format(date, 'EEEE')
      const dateStr = format(date, 'MMM d')
      groups.push({ label, dateStr, meetings: items })
    }

    return groups
  }, [meetings])

  return (
    <div className="instrument p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">📅</span>
          <h3 className="font-display text-sm font-semibold text-[var(--text)]">Upcoming</h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">Schedule</span>
      </div>

      <div className="space-y-4">
        {grouped.map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${
                group.label === 'Today' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
              }`}>
                {group.label}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">{group.dateStr}</span>
            </div>

            <div className="space-y-1.5">
              {group.meetings.map((m, mi) => {
                const isPastMeeting = m.past && isToday(m.date)
                return (
                  <div
                    key={mi}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r ${m.color} border border-white/5 transition-all ${
                      isPastMeeting ? 'opacity-40' : 'hover:border-white/10'
                    }`}
                  >
                    <span className="text-sm">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${isPastMeeting ? 'line-through' : ''} text-[var(--text)]`}>
                        {m.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-dim)]">
                        {formatTime(m.date.getHours(), m.date.getMinutes())}
                      </div>
                    </div>
                    {isPastMeeting && (
                      <span className="text-[10px] text-[var(--text-dim)]">Done</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="text-center py-4 text-xs text-[var(--text-dim)]">
            No upcoming meetings
          </div>
        )}
      </div>
    </div>
  )
}
