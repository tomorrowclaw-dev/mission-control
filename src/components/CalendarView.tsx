'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, isToday, isTomorrow, isPast, isFuture, startOfDay, addDays } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string | null
  tags: string[]
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/calendar')
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        }
      } catch (err) {
        console.error('Failed to load calendar:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="animate-pulse text-zinc-500 text-sm font-mono">Loading calendar...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl mx-auto">
          📅
        </div>
        <h3 className="font-display text-xl mt-5">Calendar</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          No events found. Add events to the Notion calendar and they&apos;ll show up here.
        </p>
      </div>
    )
  }

  // Group events by day
  const now = new Date()
  const today = startOfDay(now)

  const grouped: { label: string; sublabel: string; events: CalendarEvent[]; isToday: boolean }[] = []
  const dayMap = new Map<string, CalendarEvent[]>()

  for (const event of events) {
    const dayKey = event.start.split('T')[0]
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, [])
    dayMap.get(dayKey)!.push(event)
  }

  for (const [dayKey, dayEvents] of dayMap) {
    const date = parseISO(dayKey)
    let label: string
    let sublabel: string

    if (isToday(date)) {
      label = 'Today'
      sublabel = format(date, 'EEEE, MMMM d')
    } else if (isTomorrow(date)) {
      label = 'Tomorrow'
      sublabel = format(date, 'EEEE, MMMM d')
    } else {
      label = format(date, 'EEEE')
      sublabel = format(date, 'MMMM d')
    }

    grouped.push({ label, sublabel, events: dayEvents, isToday: isToday(date) })
  }

  return (
    <div className="space-y-6">
      {grouped.map((group, i) => (
        <div key={i}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`font-display text-base ${group.isToday ? 'text-indigo-400' : 'text-zinc-300'}`}>
              {group.label}
            </span>
            <span className="text-[11px] text-zinc-600 font-mono">{group.sublabel}</span>
            {group.isToday && (
              <span className="ml-auto text-[10px] font-mono text-indigo-500/60 uppercase tracking-wider">now</span>
            )}
          </div>
          <div className="space-y-2">
            {group.events.map((event) => {
              const eventDate = parseISO(event.start)
              const past = isPast(eventDate) && !isToday(startOfDay(eventDate))
              const hasTime = event.start.includes('T')

              return (
                <div
                  key={event.id}
                  className={`card-glass p-4 flex items-center gap-4 ${past ? 'opacity-40' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    group.isToday
                      ? 'bg-indigo-500/10 border border-indigo-500/20'
                      : 'bg-zinc-800/50 border border-zinc-700/50'
                  }`}>
                    {hasTime ? (
                      <Clock size={14} className={group.isToday ? 'text-indigo-400' : 'text-zinc-500'} />
                    ) : (
                      <Calendar size={14} className={group.isToday ? 'text-indigo-400' : 'text-zinc-500'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-zinc-200 truncate">{event.title}</div>
                    {hasTime && (
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {format(eventDate, 'h:mm a')}
                        {event.end && ` – ${format(parseISO(event.end), 'h:mm a')}`}
                      </div>
                    )}
                  </div>
                  {event.tags.length > 0 && (
                    <div className="flex gap-1.5 shrink-0">
                      {event.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
