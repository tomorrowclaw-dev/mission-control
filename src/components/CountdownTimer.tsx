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
  const isUrgent = daysLeft > 0 && daysLeft < 28

  const urgencyColor = daysLeft <= 28
    ? 'text-red-400'
    : daysLeft <= 56
    ? 'text-amber-400'
    : 'text-emerald-400'

  const urgencyBorder = daysLeft <= 28
    ? 'border-red-500/20 hover:border-red-500/40'
    : daysLeft <= 56
    ? 'border-amber-500/20 hover:border-amber-500/40'
    : 'border-emerald-500/20 hover:border-emerald-500/40'

  const urgencyGlow = daysLeft <= 28
    ? 'shadow-red-500/5'
    : daysLeft <= 56
    ? 'shadow-amber-500/5'
    : 'shadow-emerald-500/5'

  if (variant === 'hero') {
    return (
      <div className={`card-gradient p-5 ${urgencyBorder} ${urgencyGlow} ${isUrgent ? 'countdown-urgent' : ''}`}>
        <div className="relative z-10">
          <div className="flex items-end gap-2">
            <div className={`font-mono text-5xl font-bold tracking-tight ${urgencyColor}`}>
              {weeksLeft}
            </div>
            <div className="font-mono text-lg text-zinc-400 mb-1">weeks</div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1.5 font-body">
            primary countdown
          </div>
          <div className={`font-mono text-xl font-semibold mt-3 ${urgencyColor}`}>{daysLeft} days remaining</div>
          <div className="font-display text-sm mt-3 text-zinc-300">{label}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card p-4 ${urgencyBorder} ${urgencyGlow} relative overflow-hidden card-shine ${isUrgent ? 'countdown-urgent' : ''}`}>
      <div className="relative z-10">
        <div className="flex items-end gap-2">
          <div className={`font-mono text-3xl font-bold tracking-tight ${urgencyColor}`}>{weeksLeft}</div>
          <div className="font-mono text-xs text-zinc-400 mb-1 uppercase tracking-widest">weeks</div>
        </div>
        <div className={`font-mono text-sm mt-1.5 ${urgencyColor}`}>{daysLeft} days left</div>
        <div className="text-sm font-medium mt-2.5 text-zinc-300 leading-snug">{label}</div>
      </div>
    </div>
  )
}
