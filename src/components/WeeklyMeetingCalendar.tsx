'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, addDays, parseISO, isToday, isSameDay, addWeeks, subWeeks } from 'date-fns'

type MeetingCategory = 'thesis' | 'work' | 'meeting' | 'personal'

interface MeetingEvent {
  id: string
  title: string
  start: string
  end: string
  category: MeetingCategory
  description?: string
}

const CATEGORY_COLORS: Record<MeetingCategory, { bg: string; border: string; text: string; dot: string }> = {
  thesis:   { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400' },
  work:     { bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-300',   dot: 'bg-blue-400' },
  meeting:  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  personal: { bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-300',  dot: 'bg-amber-400' },
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

export default function WeeklyMeetingCalendar() {
  const [events, setEvents] = useState<MeetingEvent[]>([])
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const days = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(parseISO(e.start), day))

  const getEventStyle = (event: MeetingEvent) => {
    const start = parseISO(event.start)
    const end = parseISO(event.end)
    const startHour = start.getHours() + start.getMinutes() / 60
    const endHour = end.getHours() + end.getMinutes() / 60
    const top = ((startHour - 8) / 12) * 100
    const height = ((endHour - startHour) / 12) * 100
    return { top: `${top}%`, height: `${Math.max(height, 4)}%` }
  }

  const currentTimePosition = useMemo(() => {
    const now = new Date()
    const hour = now.getHours() + now.getMinutes() / 60
    if (hour < 8 || hour > 20) return null
    return ((hour - 8) / 12) * 100
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500">
        <span className="animate-pulse">Loading calendar...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(prev => subWeeks(prev, 1))}
            className="px-2 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-sm"
          >
            ‹
          </button>
          <h3 className="font-body text-sm text-zinc-300">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 4), 'MMM d, yyyy')}
          </h3>
          <button
            onClick={() => setWeekStart(prev => addWeeks(prev, 1))}
            className="px-2 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-sm"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="px-3 py-1 rounded-md text-xs font-mono bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          Today
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
            <span className="text-zinc-400 capitalize">{cat}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-zinc-800">
          <div className="p-2" />
          {days.map(day => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-l border-zinc-800 ${
                isToday(day) ? 'bg-accent/10' : ''
              }`}
            >
              <div className={`text-xs font-mono ${isToday(day) ? 'text-accent' : 'text-zinc-500'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-sm font-body ${isToday(day) ? 'text-accent font-semibold' : 'text-zinc-300'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] relative" style={{ height: '480px' }}>
          {/* Hour Labels */}
          <div className="relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-xs font-mono text-zinc-600"
                style={{ top: `${((hour - 8) / 12) * 100}%`, transform: 'translateY(-50%)' }}
              >
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map(day => {
            const dayEvents = getEventsForDay(day)
            return (
              <div
                key={day.toISOString()}
                className={`relative border-l border-zinc-800 ${isToday(day) ? 'bg-accent/5' : ''}`}
              >
                {/* Hour lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-zinc-800/50"
                    style={{ top: `${((hour - 8) / 12) * 100}%` }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map(event => {
                  const colors = CATEGORY_COLORS[event.category]
                  const style = getEventStyle(event)
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 border ${colors.bg} ${colors.border} ${colors.text} text-left overflow-hidden cursor-pointer hover:brightness-125 transition-all z-10`}
                      style={style}
                    >
                      <div className="text-[10px] font-mono leading-tight truncate">
                        {format(parseISO(event.start), 'h:mm a')}
                      </div>
                      <div className="text-xs font-body leading-tight truncate font-medium">
                        {event.title}
                      </div>
                    </button>
                  )
                })}

                {/* Current time line */}
                {isToday(day) && currentTimePosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: `${currentTimePosition}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                    <div className="flex-1 h-px bg-red-500/70" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="card-glass p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[selectedEvent.category].dot}`} />
                <span className="text-xs font-mono text-zinc-500 uppercase">{selectedEvent.category}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <h3 className="font-display text-lg text-zinc-100 mb-2">{selectedEvent.title}</h3>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
              <span className="font-mono">
                {format(parseISO(selectedEvent.start), 'EEE, MMM d')} · {format(parseISO(selectedEvent.start), 'h:mm a')} – {format(parseISO(selectedEvent.end), 'h:mm a')}
              </span>
            </div>
            {selectedEvent.description && (
              <p className="text-zinc-400 text-sm">{selectedEvent.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
