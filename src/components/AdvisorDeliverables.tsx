'use client'

import { format, addDays, differenceInCalendarDays, isWithinInterval, parseISO } from 'date-fns'
import { AdvisorDeliverable } from '@/lib/types'

interface AdvisorDeliverablesProps {
  deliverables: AdvisorDeliverable[]
}

const PHASES = [
  { start: 1, end: 5, label: 'Phase 1: Writing & Building' },
  { start: 6, end: 8, label: 'Phase 2: Evaluation Study' },
  { start: 9, end: 12, label: 'Phase 3: Results & Discussion' },
  { start: 13, end: 16, label: 'Phase 4: Review & Revisions' },
  { start: 17, end: 18, label: 'Phase 5: Defense Prep' },
]

const doneStatuses: AdvisorDeliverable['status'][] = ['complete', 'submitted', 'feedback_received']

const statusClasses: Record<AdvisorDeliverable['status'], { pill: string; dot: string; label: string }> = {
  complete: { pill: 'bg-green-500/12 text-green-400 border-green-500/25', dot: 'bg-green-400', label: 'Complete' },
  feedback_received: { pill: 'bg-violet-500/12 text-violet-400 border-violet-500/25', dot: 'bg-violet-400', label: 'Feedback' },
  submitted: { pill: 'bg-amber-500/12 text-amber-400 border-amber-500/25', dot: 'bg-amber-400', label: 'Submitted' },
  in_progress: { pill: 'bg-blue-500/12 text-blue-400 border-blue-500/25', dot: 'bg-blue-400', label: 'In Progress' },
  upcoming: { pill: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30', dot: 'bg-zinc-500', label: 'Upcoming' },
}

function getUrgency(weekEnd: Date, status: AdvisorDeliverable['status']) {
  if (doneStatuses.includes(status)) {
    return {
      label: 'Delivered',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }
  }

  const daysLeft = differenceInCalendarDays(weekEnd, new Date())

  if (daysLeft < 0) {
    return {
      label: `${Math.abs(daysLeft)}d overdue`,
      className: 'bg-red-500/12 text-red-400 border-red-500/25',
    }
  }

  if (daysLeft <= 3) {
    return {
      label: `Due in ${daysLeft}d`,
      className: 'bg-amber-500/12 text-amber-400 border-amber-500/25',
    }
  }

  return {
    label: `Due in ${daysLeft}d`,
    className: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30',
  }
}

export default function AdvisorDeliverables({ deliverables }: AdvisorDeliverablesProps) {
  const now = new Date()

  const totalWeeks = 18
  const completedWeeks = deliverables.filter((deliverable) => doneStatuses.includes(deliverable.status)).length
  const inProgressCount = deliverables.filter((deliverable) => deliverable.status === 'in_progress').length
  const overdueCount = deliverables.filter((deliverable) => {
    const weekEnd = addDays(parseISO(deliverable.week_start), 6)
    return differenceInCalendarDays(weekEnd, now) < 0 && !doneStatuses.includes(deliverable.status)
  }).length
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100)

  const groupedDeliverables = PHASES.map((phase) => {
    const items = deliverables.filter((deliverable) => deliverable.week_number >= phase.start && deliverable.week_number <= phase.end)
    const completed = items.filter((deliverable) => doneStatuses.includes(deliverable.status)).length
    const phaseProgress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

    return {
      ...phase,
      items,
      phaseProgress,
      completed,
    }
  }).filter((group) => group.items.length > 0)

  return (
    <div className="space-y-8 animate-in">
      <div className="card-glass p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/12 border border-indigo-500/25 flex items-center justify-center text-sm">🗓️</div>
            <div>
              <h2 className="font-display text-lg">Advisor Deliverables</h2>
              <p className="text-[11px] text-zinc-500 font-mono">Weekly targets, submission cadence, and urgency windows</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-indigo-400">
              {completedWeeks}
              <span className="text-zinc-600 text-lg">/{totalWeeks}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">weeks complete</div>
          </div>
        </div>

        <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-400 rounded-full progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/35 p-2 text-zinc-400">{progressPercent}% track</div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/8 p-2 text-blue-300">{inProgressCount} in progress</div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/8 p-2 text-red-300">{overdueCount} overdue</div>
        </div>
      </div>

      <div className="space-y-7 pl-2">
        {groupedDeliverables.map((group) => (
          <div key={group.label} className="relative">
            <div className="sticky top-20 z-10 bg-[#06060b]/95 backdrop-blur-sm py-2 mb-3 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-zinc-500">{group.label}</h3>
                <span className="text-[10px] font-mono text-zinc-600">{group.completed}/{group.items.length}</span>
                <div className="flex-1 h-1 rounded-full bg-zinc-800/80 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${group.phaseProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3 relative border-l border-zinc-800/50 ml-2.5 pl-6 pb-4">
              {group.items.map((item) => {
                const weekStart = parseISO(item.week_start)
                const weekEnd = addDays(weekStart, 6)
                const isCurrentWeek = isWithinInterval(now, { start: weekStart, end: weekEnd })
                const urgency = getUrgency(weekEnd, item.status)

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-xl border p-4 transition-all duration-200 ${
                      isCurrentWeek
                        ? 'bg-indigo-500/6 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.12)]'
                        : 'card-glass border-zinc-800/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#06060b] border-2 border-zinc-700 z-10" />
                    <div
                      className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${statusClasses[item.status].dot} ${
                        isCurrentWeek ? 'shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse' : ''
                      } z-10`}
                    />

                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
                              isCurrentWeek ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'
                            }`}
                          >
                            Week {item.week_number}
                          </span>

                          <span className="text-[10px] text-zinc-500 font-mono">
                            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusClasses[item.status].pill}`}>
                            {statusClasses[item.status].label}
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${urgency.className}`}>
                            {urgency.label}
                          </span>

                          {item.chapter && (
                            <span className="ml-auto text-[10px] font-mono text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800">
                              {item.chapter === 'All' ? 'Complete Draft' : item.chapter}
                            </span>
                          )}
                        </div>

                        <h4 className="font-medium text-zinc-200">{item.title}</h4>

                        {item.description && <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
