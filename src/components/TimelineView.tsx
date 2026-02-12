'use client'

import { format, isPast, isWithinInterval, addDays, differenceInWeeks } from 'date-fns'
import { Milestone, PHASE_LABELS } from '@/lib/types'

interface TimelineViewProps {
  milestones: Milestone[]
}

const phaseAccent: Record<string, { 
  border: string; bg: string; dot: string; text: string; track: string; gradient: string
}> = {
  'build': { 
    border: 'border-l-violet-500', 
    bg: 'bg-violet-500/8', 
    dot: 'bg-violet-500', 
    text: 'text-violet-400',
    track: 'bg-violet-500/30',
    gradient: 'from-violet-500 to-violet-400'
  },
  'data-collection': { 
    border: 'border-l-blue-500', 
    bg: 'bg-blue-500/8', 
    dot: 'bg-blue-500', 
    text: 'text-blue-400',
    track: 'bg-blue-500/30',
    gradient: 'from-blue-500 to-blue-400'
  },
  'analysis': { 
    border: 'border-l-emerald-500', 
    bg: 'bg-emerald-500/8', 
    dot: 'bg-emerald-500', 
    text: 'text-emerald-400',
    track: 'bg-emerald-500/30',
    gradient: 'from-emerald-500 to-emerald-400'
  },
  'writing': { 
    border: 'border-l-amber-500', 
    bg: 'bg-amber-500/8', 
    dot: 'bg-amber-500', 
    text: 'text-amber-400',
    track: 'bg-amber-500/30',
    gradient: 'from-amber-500 to-amber-400'
  },
  'defense': { 
    border: 'border-l-rose-500', 
    bg: 'bg-rose-500/8', 
    dot: 'bg-rose-500', 
    text: 'text-rose-400',
    track: 'bg-rose-500/30',
    gradient: 'from-rose-500 to-rose-400'
  },
}

export default function TimelineView({ milestones }: TimelineViewProps) {
  const now = new Date()
  const startDate = new Date('2026-02-09') // Project start date
  const endDate = new Date('2026-06-28') // Defense date
  const currentWeek = Math.max(1, Math.min(18, Math.ceil(differenceInWeeks(now, startDate)) + 1))
  
  // Sort milestones by due date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  const grouped = sortedMilestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})

  // Calculate progress percentage for the timeline
  const totalWeeks = 18
  const progressPercent = (currentWeek / totalWeeks) * 100

  const statusIcon = (status: Milestone['status'], isActive: boolean) => {
    const pulseClass = isActive ? 'animate-pulse' : ''
    
    switch (status) {
      case 'complete': 
        return (
          <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        )
      case 'in_progress': 
        return (
          <div className={`w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center ${pulseClass}`}>
            <div className={`w-2.5 h-2.5 rounded-full bg-blue-400 ${pulseClass}`} />
          </div>
        )
      case 'blocked': 
        return (
          <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          </div>
        )
      default: 
        return (
          <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Visual Timeline Header */}
      <div className="mb-8 animate-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">18-Week Timeline</h3>
          <div className="text-xs text-[var(--text-dim)] font-mono">Week {currentWeek} of {totalWeeks}</div>
        </div>
        
        {/* Timeline Track */}
        <div className="relative">
          <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Current position dot */}
          <div 
            className="absolute top-0 transform -translate-x-1/2 -translate-y-0.5"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-3 h-3 bg-indigo-400 rounded-full border-2 border-white/20 shadow-lg" />
          </div>
          
          {/* Phase markers */}
          <div className="absolute top-3 left-0 right-0 flex justify-between text-[8px] text-[var(--text-dim)] font-mono">
            <span>Week 1</span>
            <span>Week 6</span>
            <span>Week 12</span>
            <span>Week 18</span>
          </div>
        </div>
      </div>

      {/* Phase-based Timeline */}
      <div className="relative">
        {/* Timeline spine */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-700 via-zinc-600 to-zinc-700" />
        
        {Object.entries(grouped).map(([phase, items], groupIdx) => {
          const colors = phaseAccent[phase]
          const hasActiveItem = items.some(m => {
            const isThisWeek = m.week_start && m.week_end && isWithinInterval(now, {
              start: new Date(m.week_start),
              end: addDays(new Date(m.week_end), 1),
            })
            return isThisWeek || m.status === 'in_progress'
          })
          
          return (
            <div key={phase} className="relative animate-in" style={{ animationDelay: `${groupIdx * 100}ms` }}>
              {/* Phase Header */}
              <div className="flex items-center gap-4 mb-4 ml-10">
                <div className={`w-3 h-3 rounded-full ${colors.dot} ${hasActiveItem ? 'animate-pulse shadow-lg' : ''}`} />
                <h3 className={`text-sm font-semibold uppercase tracking-[0.15em] ${colors.text}`}>
                  {PHASE_LABELS[phase as Milestone['phase']]}
                </h3>
                <div className={`flex-1 h-0.5 bg-gradient-to-r ${colors.track} to-transparent rounded-full`} />
              </div>
              
              {/* Milestones */}
              <div className="space-y-3 ml-1">
                {items.map((m, idx) => {
                  const dueDate = new Date(m.due_date)
                  const isOverdue = isPast(dueDate) && m.status !== 'complete'
                  const isThisWeek = m.week_start && m.week_end && isWithinInterval(now, {
                    start: new Date(m.week_start),
                    end: addDays(new Date(m.week_end), 1),
                  })
                  const isActive = isThisWeek || m.status === 'in_progress'

                  return (
                    <div
                      key={m.id}
                      className={`group flex items-start gap-4 transition-all duration-300 hover:translate-x-1 ${
                        isActive ? 'animate-in' : ''
                      }`}
                      style={{ animationDelay: `${(groupIdx * 100) + (idx * 60)}ms` }}
                    >
                      {/* Timeline node */}
                      <div className="relative z-10 mt-0.5">
                        {statusIcon(m.status, isActive)}
                        
                        {/* Connection line to spine */}
                        <div className="absolute top-3 -left-2 w-2 h-px bg-zinc-700 group-hover:bg-zinc-600 transition-colors" />
                      </div>
                      
                      {/* Milestone content */}
                      <div className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? `${colors.bg} border-2 ${colors.border.replace('border-l-', 'border-')} shadow-lg`
                          : 'card hover:border-zinc-600/50'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-[var(--text)]'}`}>
                                {m.title}
                              </span>
                              
                              {m.advisor_deliverable && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold uppercase tracking-wider border border-indigo-500/20">
                                  Advisor
                                </span>
                              )}
                              
                              {isThisWeek && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider border border-amber-500/30 animate-pulse">
                                  This Week
                                </span>
                              )}
                            </div>
                            
                            {m.description && (
                              <p className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors leading-relaxed">
                                {m.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0">
                            <div className={`text-sm font-mono font-medium ${isOverdue ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                              {format(dueDate, 'MMM d')}
                            </div>
                            {m.week_start && (
                              <div className="text-[10px] text-[var(--text-dim)] font-mono mt-0.5">
                                Week {Math.ceil(differenceInWeeks(new Date(m.week_start), startDate)) + 1}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Add some spacing between phases */}
              {groupIdx < Object.keys(grouped).length - 1 && (
                <div className="h-8" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
