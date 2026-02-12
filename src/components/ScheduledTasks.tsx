'use client'

import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface CronJob {
  id: string
  name: string
  schedule: { kind: string; expr?: string; tz?: string }
  enabled: boolean
  nextRun: string | null
  lastStatus: string | null
  color: string
}

// Our actual cron jobs — hardcoded since we can't call OpenClaw API from the browser
const CRON_JOBS: CronJob[] = [
  {
    id: 'daily-brief',
    name: 'Daily Brief',
    schedule: { kind: 'cron', expr: '0 9 * * *', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/25',
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    schedule: { kind: 'cron', expr: '0 8-23 * * *', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-red-500/20 text-red-400 border-red-500/25',
  },
  {
    id: 'task-reminder',
    name: 'Task Reminder',
    schedule: { kind: 'cron', expr: '0 12,17 * * *', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-green-500/20 text-green-400 border-green-500/25',
  },
  {
    id: 'x-content',
    name: 'X Content Research',
    schedule: { kind: 'cron', expr: '0 7 * * *', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/25',
  },
  {
    id: 'proactive',
    name: 'Proactive Session',
    schedule: { kind: 'cron', expr: '0 10,14,18 * * *', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/25',
  },
  {
    id: 'weekly-research',
    name: 'Weekly Research',
    schedule: { kind: 'cron', expr: '0 8 * * 0', tz: 'America/Chicago' },
    enabled: true,
    nextRun: null,
    lastStatus: 'ok',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/25',
  },
]

function parseCronToTimes(expr: string): { hour: number; minute: number; days: number[] }[] {
  // Simple cron parser for our use cases
  const [min, hour, , , dow] = expr.split(' ')
  const hours = hour.includes(',') ? hour.split(',').map(Number) :
    hour.includes('-') ? Array.from({ length: Number(hour.split('-')[1]) - Number(hour.split('-')[0]) + 1 }, (_, i) => Number(hour.split('-')[0]) + i) :
    [Number(hour)]
  const minutes = [Number(min)]
  const days = dow === '*' ? [0, 1, 2, 3, 4, 5, 6] : dow.split(',').map(Number)

  const result: { hour: number; minute: number; days: number[] }[] = []
  for (const h of hours) {
    for (const m of minutes) {
      result.push({ hour: h, minute: m, days })
    }
  }
  return result
}

export default function ScheduledTasks() {
  const [weekOffset] = useState(0)
  const now = new Date()
  const weekStart = startOfWeek(addDays(now, weekOffset * 7))
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Build calendar entries
  const calendarEntries = useMemo(() => {
    const entries: { job: CronJob; day: Date; hour: number; minute: number }[] = []
    for (const job of CRON_JOBS) {
      if (!job.enabled || !job.schedule.expr) continue
      const times = parseCronToTimes(job.schedule.expr)
      for (const day of weekDays) {
        const dow = day.getDay()
        for (const t of times) {
          if (t.days.includes(dow)) {
            entries.push({ job, day, hour: t.hour, minute: t.minute })
          }
        }
      }
    }
    return entries.sort((a, b) => a.hour - b.hour || a.minute - b.minute)
  }, [weekOffset])

  // Next upcoming tasks
  const upcoming = useMemo(() => {
    const nowMs = now.getTime()
    return calendarEntries
      .map(e => {
        const d = new Date(e.day)
        d.setHours(e.hour, e.minute, 0, 0)
        return { ...e, date: d, ms: d.getTime() }
      })
      .filter(e => e.ms > nowMs)
      .sort((a, b) => a.ms - b.ms)
      .slice(0, 6)
  }, [calendarEntries])

  // "Always Running" jobs (hourly or more frequent)
  const alwaysRunning = CRON_JOBS.filter(j => {
    if (!j.schedule.expr) return false
    const hour = j.schedule.expr.split(' ')[1]
    return hour.includes('-') || hour === '*'
  })

  // Non-always-running for calendar
  const scheduledJobs = CRON_JOBS.filter(j => !alwaysRunning.includes(j))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📅</div>
        <h2 className="font-display text-lg">Scheduled Tasks</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono">Week</span>
          <span className="text-[11px] text-zinc-600 font-mono">Today</span>
        </div>
      </div>

      {/* Always Running */}
      {alwaysRunning.length > 0 && (
        <div className="card-glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">⚡</span>
            <span className="text-sm font-medium text-zinc-200">Always Running</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alwaysRunning.map(j => (
              <span key={j.id} className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${j.color}`}>
                {j.name} • Every hour
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div className="card-glass p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[600px]">
          {weekDays.map((day, di) => {
            const isToday = isSameDay(day, now)
            const dayEntries = calendarEntries.filter(
              e => isSameDay(e.day, day) && !alwaysRunning.find(ar => ar.id === e.job.id)
            )
            return (
              <div key={di} className={`rounded-xl p-2 ${isToday ? 'bg-indigo-500/5 border border-indigo-500/15' : 'border border-zinc-800/30'}`}>
                <div className={`text-[11px] font-semibold mb-2 ${isToday ? 'text-indigo-400' : 'text-zinc-400'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className="space-y-1">
                  {dayEntries.map((e, ei) => (
                    <div
                      key={`${e.job.id}-${ei}`}
                      className={`text-[9px] px-1.5 py-1 rounded-md border truncate ${e.job.color}`}
                    >
                      <div className="truncate font-medium">{e.job.name}</div>
                      <div className="opacity-60">{e.hour}:{String(e.minute).padStart(2, '0')} AM</div>
                    </div>
                  ))}
                  {dayEntries.length === 0 && (
                    <div className="text-[9px] text-zinc-700 italic">No tasks</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Up */}
      <div className="card-glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <span>📆</span>
          <span className="text-sm font-medium text-zinc-200">Next Up</span>
        </div>
        <div className="space-y-2">
          {upcoming.map((e, i) => {
            const diffMs = e.ms - now.getTime()
            const diffHrs = Math.floor(diffMs / 3600000)
            const diffMins = Math.floor((diffMs % 3600000) / 60000)
            const timeStr = diffHrs > 24 ? `In ${Math.floor(diffHrs / 24)} days` :
              diffHrs > 0 ? `In ${diffHrs}h ${diffMins}m` : `In ${diffMins}m`

            return (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className={`text-sm ${e.job.color.split(' ')[1]}`}>{e.job.name}</span>
                <span className="text-[11px] text-zinc-500 font-mono">{timeStr}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
