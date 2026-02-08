'use client'

import { differenceInDays, differenceInWeeks } from 'date-fns'

interface CountdownTimerProps {
  targetDate: string
  label: string
  variant?: 'default' | 'hero'
}

export default function CountdownTimer({ targetDate, label, variant = 'default' }: CountdownTimerProps) {
  const now = new Date()
  const target = new Date(targetDate)
  const daysLeft = differenceInDays(target, now)
  const weeksLeft = differenceInWeeks(target, now)

  const urgencyColor = daysLeft <= 7
    ? 'text-red-400'
    : daysLeft <= 21
    ? 'text-yellow-400'
    : 'text-indigo-400'

  const urgencyBorder = daysLeft <= 7
    ? 'border-red-500/20 hover:border-red-500/40'
    : daysLeft <= 21
    ? 'border-yellow-500/20 hover:border-yellow-500/40'
    : 'border-indigo-500/20 hover:border-indigo-500/40'

  const urgencyGlow = daysLeft <= 7
    ? 'shadow-red-500/5'
    : daysLeft <= 21
    ? 'shadow-yellow-500/5'
    : 'shadow-indigo-500/5'

  if (variant === 'hero') {
    return (
      <div className={`card-gradient p-5 ${urgencyBorder} ${urgencyGlow}`}>
        <div className="relative z-10">
          <div className={`font-mono text-5xl font-bold tracking-tight ${urgencyColor}`}>
            {daysLeft}
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1.5 font-body">
            days remaining
          </div>
          <div className="font-display text-sm mt-3 text-zinc-300">{label}</div>
          <div className="text-[11px] text-zinc-600 font-mono mt-0.5">{weeksLeft}w</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card p-4 ${urgencyBorder} ${urgencyGlow} relative overflow-hidden card-shine`}>
      <div className="relative z-10">
        <div className={`font-mono text-3xl font-bold tracking-tight ${urgencyColor}`}>
          {daysLeft}
        </div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1 font-body">days left</div>
        <div className="text-sm font-medium mt-2.5 text-zinc-300 leading-snug">{label}</div>
        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{weeksLeft} weeks</div>
      </div>
    </div>
  )
}
