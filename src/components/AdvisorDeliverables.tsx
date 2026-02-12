'use client'

import { format, addDays, isWithinInterval, parseISO } from 'date-fns'
import { AdvisorDeliverable } from '@/lib/types'

interface AdvisorDeliverablesProps {
  deliverables: AdvisorDeliverable[]
}

const PHASES = [
  { start: 1, end: 5, label: "Phase 1: Writing & Building" },
  { start: 6, end: 8, label: "Phase 2: Evaluation Study" },
  { start: 9, end: 12, label: "Phase 3: Results & Discussion" },
  { start: 13, end: 16, label: "Phase 4: Review & Revisions" },
  { start: 17, end: 18, label: "Phase 5: Defense Prep" },
]

export default function AdvisorDeliverables({ deliverables }: AdvisorDeliverablesProps) {
  const now = new Date()
  
  // Progress stats
  const totalWeeks = 18
  const completedWeeks = deliverables.filter(d => d.status === 'complete' || d.status === 'submitted' || d.status === 'feedback_received').length
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100)

  // Status Indicators
  const getStatusIndicator = (status: AdvisorDeliverable['status']) => {
    switch (status) {
      case 'complete': 
        return (
          <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'feedback_received':
        return (
          <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
          </div>
        )
      case 'submitted':
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        )
      case 'in_progress':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
        )
      default: // upcoming
        return (
          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          </div>
        )
    }
  }

  // Group by phases
  const groupedDeliverables = PHASES.map(phase => ({
    ...phase,
    items: deliverables.filter(d => d.week_number >= phase.start && d.week_number <= phase.end)
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-8 animate-in">
      {/* Header / Progress */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">🗓️</div>
             <div>
               <h2 className="font-display text-lg">Advisor Deliverables</h2>
               <p className="text-[11px] text-[var(--text-dim)] font-mono">Weekly targets & submission schedule</p>
             </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-mono font-bold text-indigo-400">{completedWeeks}<span className="text-[var(--text-dim)] text-lg">/{totalWeeks}</span></div>
             <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">weeks complete</div>
          </div>
        </div>
        <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8 pl-2">
        {groupedDeliverables.map((group, groupIdx) => (
          <div key={group.label} className="relative">
            {/* Phase Header */}
            <div className="sticky top-20 z-10 bg-[#06060b]/95 backdrop-blur-sm py-2 mb-4 border-b border-zinc-800/50">
               <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--text-dim)]">
                 {group.label}
               </h3>
            </div>

            <div className="space-y-3 relative border-l border-zinc-800/50 ml-2.5 pl-6 pb-6">
               {group.items.map((item, itemIdx) => {
                 const weekStart = parseISO(item.week_start)
                 const weekEnd = addDays(weekStart, 6)
                 const isCurrentWeek = isWithinInterval(now, { start: weekStart, end: weekEnd })
                 const isPast = weekEnd < now && item.status === 'complete'
                 
                 return (
                   <div 
                     key={item.id}
                     className={`relative rounded-xl border p-4 transition-all duration-200 
                       ${isCurrentWeek 
                         ? 'bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                         : isPast
                           ? 'bg-zinc-900/20 border-zinc-800/50 opacity-60 hover:opacity-100'
                           : 'card-glass border-zinc-800/60 hover:border-zinc-700'
                       }
                     `}
                   >
                     {/* Connector line dot */}
                     <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#06060b] border-2 border-zinc-700 z-10" />
                     {isCurrentWeek && (
                       <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse z-10" />
                     )}

                     <div className="flex items-start gap-3">
                       <div className="mt-1 shrink-0">
                         {getStatusIndicator(item.status)}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border 
                             ${isCurrentWeek ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-zinc-800/50 border-zinc-700 text-[var(--text-dim)]'}
                           `}>
                             Week {item.week_number}
                           </span>
                           <span className="text-[10px] text-[var(--text-dim)] font-mono">
                             {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                           </span>
                           {item.chapter && (
                             <span className="ml-auto text-[10px] font-mono text-[var(--text-secondary)] bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800">
                               {item.chapter === 'All' ? 'Complete Draft' : item.chapter}
                             </span>
                           )}
                         </div>
                         
                         <h4 className={`font-medium ${isPast ? 'text-[var(--text-secondary)]' : 'text-[var(--text)]'}`}>
                           {item.title}
                         </h4>
                         
                         {item.description && (
                           <p className="text-sm text-[var(--text-dim)] mt-1 leading-relaxed">
                             {item.description}
                           </p>
                         )}

                         {item.status !== 'upcoming' && item.status !== 'complete' && (
                           <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                             Status: <span className="text-[var(--text)]">{item.status.replace('_', ' ')}</span>
                           </div>
                         )}
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
