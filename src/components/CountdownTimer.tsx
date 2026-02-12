'use client'

import { differenceInDays, differenceInWeeks, differenceInHours } from 'date-fns'

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
  const hoursLeft = differenceInHours(target, now) % 24
  const isUrgent = daysLeft > 0 && daysLeft < 28

  // Total days for thesis (18 weeks = 126 days from Feb 9)
  const totalDays = 139 // Feb 9 to Jun 28
  const elapsed = totalDays - daysLeft
  const progress = Math.max(0, Math.min(100, (elapsed / totalDays) * 100))

  const urgencyColor = daysLeft <= 28
    ? 'text-red-400'
    : daysLeft <= 56
    ? 'text-amber-400'
    : 'text-emerald-400'

  const ringColor = daysLeft <= 28
    ? '#f87171'
    : daysLeft <= 56
    ? '#fbbf24'
    : '#34d399'

  const ringBg = daysLeft <= 28
    ? 'rgba(248,113,113,0.1)'
    : daysLeft <= 56
    ? 'rgba(251,191,36,0.1)'
    : 'rgba(52,211,153,0.1)'

  if (variant === 'hero') {
    const circumference = 2 * Math.PI * 52
    const offset = circumference - (progress / 100) * circumference

    return (
      <div className={`card-gradient p-5 relative overflow-hidden ${isUrgent ? 'countdown-urgent' : ''}`}>
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 opacity-30" style={{
          background: `radial-gradient(ellipse at 20% 50%, ${ringBg} 0%, transparent 70%)`
        }} />
        <div className="relative z-10 flex items-center gap-5">
          {/* Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="-rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-zinc-800/50 dark:text-zinc-800/50" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={ringColor} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono text-3xl font-bold ${urgencyColor}`}>{daysLeft}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">days</span>
            </div>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Defense Countdown</div>
            <div className="font-display text-lg mt-1 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 truncate">{label}</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-center">
                <div className={`font-mono text-xl font-bold ${urgencyColor}`}>{weeksLeft}</div>
                <div className="text-[8px] uppercase tracking-wider text-zinc-500">weeks</div>
              </div>
              <div className="w-px h-6 bg-zinc-700/50" />
              <div className="text-center">
                <div className={`font-mono text-xl font-bold ${urgencyColor}`}>{daysLeft % 7}</div>
                <div className="text-[8px] uppercase tracking-wider text-zinc-500">days</div>
              </div>
              <div className="w-px h-6 bg-zinc-700/50" />
              <div className="text-center">
                <div className={`font-mono text-xl font-bold ${urgencyColor}`}>{hoursLeft}</div>
                <div className="text-[8px] uppercase tracking-wider text-zinc-500">hours</div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono mt-2">{progress.toFixed(1)}% elapsed</div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant — compact with mini ring
  const miniCirc = 2 * Math.PI * 18
  const miniDaysTotal = daysLeft + elapsed // approximate
  const miniProgress = Math.max(0, Math.min(100, (1 - daysLeft / miniDaysTotal) * 100))
  const miniOffset = miniCirc - (miniProgress / 100) * miniCirc

  return (
    <div className={`card-gradient p-4 relative overflow-hidden card-shine ${isUrgent ? 'countdown-urgent' : ''}`}>
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <svg width="44" height="44" className="-rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3"
              className="text-zinc-800/40" />
            <circle cx="22" cy="22" r="18" fill="none" stroke={ringColor} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={miniCirc}
              strokeDashoffset={miniOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono text-xs font-bold ${urgencyColor}`}>{daysLeft}</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className={`font-mono text-lg font-bold ${urgencyColor}`}>{daysLeft} days left</div>
          <div className="text-xs text-zinc-400 mt-0.5 truncate">{label}</div>
          <div className="text-[10px] text-zinc-600 font-mono">{weeksLeft} weeks</div>
        </div>
      </div>
    </div>
  )
}
