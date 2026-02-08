'use client'

import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import { Milestone, PHASE_LABELS } from '@/lib/types'

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
  const now = new Date()
  const grouped = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
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
                    {statusIcon(m.status)}
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
