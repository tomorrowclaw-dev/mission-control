'use client'

import { useEffect, useState } from 'react'
import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import { Milestone, PHASE_LABELS } from '@/lib/types'
import { updateMilestoneStatus } from '@/lib/data'

interface TimelineViewProps {
  milestones: Milestone[]
}

const phaseAccent: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  'build': { border: 'border-l-violet-500', bg: 'bg-violet-500/8', dot: 'bg-violet-500', text: 'text-violet-400' },
  'data-collection': { border: 'border-l-blue-500', bg: 'bg-blue-500/8', dot: 'bg-blue-500', text: 'text-blue-400' },
  'analysis': { border: 'border-l-emerald-500', bg: 'bg-emerald-500/8', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  'writing': { border: 'border-l-amber-500', bg: 'bg-amber-500/8', dot: 'bg-amber-500', text: 'text-amber-400' },
  'defense': { border: 'border-l-rose-500', bg: 'bg-rose-500/8', dot: 'bg-rose-500', text: 'text-rose-400' },
}

export default function TimelineView({ milestones }: TimelineViewProps) {
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(milestones)
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const now = new Date()
  const timelineStart = new Date('2026-02-09')
  const msInWeek = 7 * 24 * 60 * 60 * 1000
  const currentWeek = Math.max(1, Math.min(18, Math.floor((now.getTime() - timelineStart.getTime()) / msInWeek) + 1))
  const markerLeft = ((currentWeek - 0.5) / 18) * 100
  const phaseByWeek = [
    'build', 'build', 'build', 'build',
    'data-collection', 'data-collection', 'data-collection', 'data-collection',
    'analysis', 'analysis', 'analysis', 'analysis',
    'writing', 'writing', 'writing', 'writing',
    'defense', 'defense',
  ] as const
  const weekSegmentColor: Record<typeof phaseByWeek[number], { past: string; future: string }> = {
    'build': { past: 'bg-violet-400', future: 'bg-violet-500/25' },
    'data-collection': { past: 'bg-blue-400', future: 'bg-blue-500/25' },
    'analysis': { past: 'bg-emerald-400', future: 'bg-emerald-500/25' },
    'writing': { past: 'bg-amber-400', future: 'bg-amber-500/25' },
    'defense': { past: 'bg-rose-400', future: 'bg-rose-500/25' },
  }

  useEffect(() => {
    setLocalMilestones(milestones)
  }, [milestones])

  const milestoneStatusCycle: Milestone['status'][] = ['not_started', 'in_progress', 'complete']

  const getNextStatus = (status: Milestone['status']) => {
    const currentIndex = milestoneStatusCycle.indexOf(status)
    if (currentIndex === -1) return 'not_started'
    return milestoneStatusCycle[(currentIndex + 1) % milestoneStatusCycle.length]
  }

  const handleStatusToggle = async (id: string) => {
    if (savingIds[id]) return

    let previousStatus: Milestone['status'] | null = null
    let nextStatus: Milestone['status'] | null = null

    setError(null)
    setLocalMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        previousStatus = m.status
        const computedNext = getNextStatus(m.status)
        nextStatus = computedNext
        return { ...m, status: computedNext }
      })
    )

    if (!previousStatus || !nextStatus) return

    setSavingIds((prev) => ({ ...prev, [id]: true }))
    setRecentlyUpdatedId(id)
    setTimeout(() => {
      setRecentlyUpdatedId((current) => (current === id ? null : current))
    }, 260)

    try {
      await updateMilestoneStatus(id, nextStatus)
    } catch (err) {
      setLocalMilestones((prev) =>
        prev.map((m) => (m.id === id && previousStatus ? { ...m, status: previousStatus } : m))
      )
      console.error('Failed to update milestone status:', err)
      setError('Could not save milestone status. Changes were reverted.')
    } finally {
      setSavingIds((prev) => ({ ...prev, [id]: false }))
    }
  }

  const grouped = localMilestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  const statusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'complete': return <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-green-400" /></div>
      case 'in_progress': return <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /></div>
      case 'blocked': return <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-red-400" /></div>
      default: return <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /></div>
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300 font-mono">
          {error}
        </div>
      )}
      <div className="card-glass p-4 sm:p-5 animate-in">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">18 Week Track</div>
            <div className="text-sm text-zinc-300 mt-1">Week {currentWeek} of 18</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-semibold uppercase tracking-wider">
            You are here
          </span>
        </div>
        <div className="relative mt-5">
          <div className="h-3 rounded-full bg-zinc-900/70 border border-zinc-800/70 p-0.5 flex gap-0.5">
            {phaseByWeek.map((phase, idx) => {
              const color = weekSegmentColor[phase]
              return (
                <div
                  key={`${phase}-${idx + 1}`}
                  className={`h-full flex-1 rounded-[2px] transition-all duration-500 ${
                    idx + 1 <= currentWeek ? color.past : color.future
                  }`}
                />
              )
            })}
          </div>
          <div className="absolute -top-2" style={{ left: `calc(${markerLeft}% - 1px)` }}>
            <div className="w-0.5 h-7 bg-white/80" />
            <div className="mt-1 -ml-6 text-[9px] text-zinc-400 font-mono whitespace-nowrap">Week {currentWeek}</div>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([phase, items], groupIdx) => {
        const colors = phaseAccent[phase]
        return (
          <div key={phase} className="space-y-2 animate-in" style={{ animationDelay: `${groupIdx * 100}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <h3 className={`text-xs font-semibold uppercase tracking-[0.2em] ${colors.text}`}>
                {PHASE_LABELS[phase as Milestone['phase']]}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            <div className="space-y-1.5 pl-1">
              {items.map((m, idx) => {
                const dueDate = new Date(m.due_date)
                const isOverdue = isPast(dueDate) && m.status !== 'complete'
                const isThisWeek = m.week_start && m.week_end && isWithinInterval(now, {
                  start: new Date(m.week_start),
                  end: addDays(new Date(m.week_end), 1),
                })

                return (
                  <div
                    key={m.id}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-l-[3px] ${colors.border} transition-all duration-200 ${
                      isThisWeek
                        ? 'bg-indigo-500/5 border border-l-[3px] border-indigo-500/15'
                        : 'card border-l-[3px]'
                    }`}
                    style={{ animationDelay: `${(groupIdx * 100) + (idx * 40)}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(m.id)}
                      disabled={savingIds[m.id]}
                      className={`shrink-0 transition-all duration-200 ${
                        savingIds[m.id] ? 'opacity-60 cursor-wait' : 'hover:scale-105'
                      } ${recentlyUpdatedId === m.id ? 'scale-110' : ''}`}
                      title="Click to cycle status"
                    >
                      {statusIcon(m.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-200'}`}>
                          {m.title}
                        </span>
                        {m.advisor_deliverable && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold uppercase tracking-wider border border-indigo-500/20">
                            Advisor
                          </span>
                        )}
                        {isThisWeek && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold uppercase tracking-wider border border-amber-500/20 pulse-glow">
                            This Week
                          </span>
                        )}
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate group-hover:text-zinc-400 transition-colors">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-mono font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                        {format(dueDate, 'MMM d')}
                      </div>
                      {m.week_start && (
                        <div className="text-[10px] text-zinc-600 font-mono">
                          {format(new Date(m.week_start), 'M/d')}–{format(new Date(m.week_end!), 'M/d')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
