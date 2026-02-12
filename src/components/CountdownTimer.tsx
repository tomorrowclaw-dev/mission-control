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
  const hoursLeft = differenceInHours(target, now)

  // Enhanced urgency system with more granular levels
  const getUrgencyLevel = () => {
    if (daysLeft <= 3) return 'critical'
    if (daysLeft <= 7) return 'urgent'
    if (daysLeft <= 21) return 'warning'
    if (daysLeft <= 42) return 'attention'
    return 'normal'
  }

  const urgencyLevel = getUrgencyLevel()

  const urgencyStyles = {
    critical: {
      color: 'text-red-300',
      border: 'border-red-500/30 hover:border-red-500/50',
      glow: 'shadow-red-500/10 hover:shadow-red-500/20',
      bg: 'from-red-500/20 to-red-500/5',
      pulse: 'animate-pulse',
      icon: '🚨'
    },
    urgent: {
      color: 'text-red-400',
      border: 'border-red-500/20 hover:border-red-500/40',
      glow: 'shadow-red-500/8',
      bg: 'from-red-500/15 to-red-500/0',
      pulse: '',
      icon: '⚠️'
    },
    warning: {
      color: 'text-yellow-400',
      border: 'border-yellow-500/20 hover:border-yellow-500/40',
      glow: 'shadow-yellow-500/5',
      bg: 'from-yellow-500/10 to-yellow-500/0',
      pulse: '',
      icon: '⏰'
    },
    attention: {
      color: 'text-amber-400',
      border: 'border-amber-500/20 hover:border-amber-500/30',
      glow: 'shadow-amber-500/5',
      bg: 'from-amber-500/8 to-amber-500/0',
      pulse: '',
      icon: '📅'
    },
    normal: {
      color: 'text-indigo-400',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      glow: 'shadow-indigo-500/5',
      bg: 'from-indigo-500/8 to-indigo-500/0',
      pulse: '',
      icon: '🎯'
    }
  }

  const styles = urgencyStyles[urgencyLevel]

  if (variant === 'hero') {
    return (
      <div className={`instrument p-4 ${styles.border} ${styles.glow} relative overflow-hidden group transition-all duration-500`}>
        {/* Dramatic background gradient for urgency */}
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} transition-all duration-700 group-hover:opacity-80`} />
        
        {/* Pulsing glow effect for critical countdown */}
        {urgencyLevel === 'critical' && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-transparent animate-pulse" />
        )}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{styles.icon}</span>
            <div className="text-right">
              <div className={`font-mono text-lg font-bold ${styles.color}`}>
                {weeksLeft}
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-body">
                weeks
              </div>
            </div>
          </div>
          
          <div className={`font-mono text-5xl font-bold tracking-tight ${styles.color} ${styles.pulse}`}>
            {daysLeft}
          </div>
          
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1.5 font-body">
            days remaining
          </div>
          
          <div className="font-display text-sm mt-3 text-zinc-300">{label}</div>
          
          {/* Show hours for very urgent countdowns */}
          {urgencyLevel === 'critical' && hoursLeft > 0 && (
            <div className="text-[10px] text-zinc-500 font-mono mt-1">
              {hoursLeft}h remaining
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="mt-3">
            <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${
                  urgencyLevel === 'critical' ? 'from-red-500 to-red-400' :
                  urgencyLevel === 'urgent' ? 'from-red-600 to-red-400' :
                  urgencyLevel === 'warning' ? 'from-yellow-500 to-yellow-400' :
                  urgencyLevel === 'attention' ? 'from-amber-500 to-amber-400' :
                  'from-indigo-600 to-indigo-400'
                } rounded-full transition-all duration-1000 ${styles.pulse}`}
                style={{ width: `${Math.max(5, Math.min(100, (138 - daysLeft) / 138 * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card p-4 ${styles.border} ${styles.glow} relative overflow-hidden card-shine transition-all duration-300 group`}>
      {/* Subtle background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} transition-all duration-500 group-hover:opacity-60`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`font-mono text-3xl font-bold tracking-tight ${styles.color} ${styles.pulse}`}>
            {daysLeft}
          </div>
          <span className="text-sm opacity-60">{styles.icon}</span>
        </div>
        
        <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1 font-body">days left</div>
        <div className="text-sm font-medium mt-2.5 text-zinc-300 leading-snug">{label}</div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-[10px] text-zinc-600 font-mono">{weeksLeft} weeks</div>
          {urgencyLevel !== 'normal' && (
            <div className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              urgencyLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
              urgencyLevel === 'urgent' ? 'bg-red-500/15 text-red-400' :
              urgencyLevel === 'warning' ? 'bg-yellow-500/15 text-yellow-400' :
              'bg-amber-500/15 text-amber-400'
            } uppercase tracking-wider font-semibold`}>
              {urgencyLevel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
