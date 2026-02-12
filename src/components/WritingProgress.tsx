'use client'

import { useState, useEffect } from 'react'
import { WritingSection } from '@/lib/types'

interface WritingProgressProps {
  sections: WritingSection[]
}

// Generate mock weekly word count data for sparklines
const generateSparklineData = (current: number, weeks: number = 8) => {
  const data: number[] = []
  const targetPerWeek = Math.max(current / weeks, 100)
  
  for (let i = 0; i < weeks; i++) {
    if (i < weeks - 1) {
      // Previous weeks with some variation
      const variation = 0.3
      const base = targetPerWeek * (1 + (Math.random() - 0.5) * variation)
      data.push(Math.max(50, Math.floor(base)))
    } else {
      // This week (current progress)
      const thisWeek = Math.max(0, current - data.reduce((sum, val) => sum + val, 0))
      data.push(Math.max(0, thisWeek))
    }
  }
  
  return data
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 1)
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (value / max) * 80 // Leave some margin
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-16 h-6 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="transition-all duration-500"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (value / max) * 80
          const isLast = index === data.length - 1
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isLast ? "3" : "1.5"}
              fill={color}
              className={isLast ? "animate-pulse" : ""}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function WritingProgress({ sections }: WritingProgressProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})
  
  const totalTarget = sections.reduce((sum, s) => sum + (s.target_word_count || 0), 0)
  const totalCurrent = sections.reduce((sum, s) => sum + s.current_word_count, 0)
  const overallPercent = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  
  // Mock weekly writing statistics
  const weeklyStats = {
    thisWeek: 2847,
    lastWeek: 3102,
    average: 2654,
    streak: 5,
    bestDay: 1247
  }
  
  const weeklyChange = weeklyStats.thisWeek - weeklyStats.lastWeek
  const weeklyChangePercent = ((weeklyChange / weeklyStats.lastWeek) * 100).toFixed(1)

  // Animate counters on mount
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    sections.forEach((section) => {
      const timer = setTimeout(() => {
        let current = 0
        const target = section.current_word_count
        const increment = Math.ceil(target / 30)
        
        const animate = () => {
          current += increment
          if (current >= target) {
            setAnimatedValues(prev => ({ ...prev, [section.id]: target }))
          } else {
            setAnimatedValues(prev => ({ ...prev, [section.id]: current }))
            requestAnimationFrame(animate)
          }
        }
        animate()
      }, Math.random() * 500)
      
      timers.push(timer)
    })
    
    return () => timers.forEach(clearTimeout)
  }, [sections])

  const statusColor = (status: string) => {
    switch (status) {
      case 'complete': return { 
        bar: 'bg-green-500', 
        dot: 'bg-green-400 shadow-green-500/40', 
        label: 'text-green-400',
        spark: '#22c55e'
      }
      case 'in_progress': return { 
        bar: 'bg-blue-500', 
        dot: 'bg-blue-400 shadow-blue-500/40 animate-pulse', 
        label: 'text-blue-400',
        spark: '#3b82f6'
      }
      default: return { 
        bar: 'bg-zinc-700', 
        dot: 'bg-zinc-600', 
        label: 'text-zinc-500',
        spark: '#71717a'
      }
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Done'
      case 'in_progress': return 'Writing'
      default: return 'Pending'
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced overall progress hero */}
      <div className="text-center pb-6 border-b border-zinc-800/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total words */}
          <div className="text-center">
            <div className="font-mono text-4xl font-bold text-indigo-400">
              {totalCurrent.toLocaleString()}
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              of {totalTarget.toLocaleString()} words
            </div>
          </div>
          
          {/* This week's progress */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="font-mono text-2xl font-bold text-emerald-400">
                {weeklyStats.thisWeek.toLocaleString()}
              </div>
              <div className={`text-sm ${weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {weeklyChange >= 0 ? '↗' : '↘'} {Math.abs(parseInt(weeklyChangePercent))}%
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              words this week
            </div>
          </div>
          
          {/* Writing streak */}
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-amber-400">
              {weeklyStats.streak}
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              day streak
            </div>
          </div>
        </div>
        
        {/* Overall progress bar with glow effect */}
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full progress-bar relative"
              style={{ width: `${overallPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/50 to-indigo-400/50 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-[11px] text-zinc-500 font-mono">{overallPercent.toFixed(1)}% complete</div>
            <div className="text-[11px] text-zinc-600 font-mono">
              {(totalTarget - totalCurrent).toLocaleString()} remaining
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced per-section breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-zinc-300">Chapter Progress</h4>
          <div className="text-[10px] text-zinc-600 font-mono">8-week trend</div>
        </div>
        
        {sections.map((section, idx) => {
          const colors = statusColor(section.status)
          const percent = section.target_word_count
            ? (section.current_word_count / section.target_word_count) * 100
            : 0
          const sparklineData = generateSparklineData(section.current_word_count)
          const displayWords = animatedValues[section.id] ?? 0

          return (
            <div
              key={section.id}
              className="card p-4 group animate-in hover:border-zinc-600/50 transition-all duration-300"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${colors.dot}`} />
                
                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {section.title}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${colors.label}`}>
                      {statusLabel(section.status)}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  {section.target_word_count && (
                    <div className="w-full max-w-48">
                      <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full progress-bar ${colors.bar} relative`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        >
                          {percent > 95 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sparkline trend */}
                <Sparkline data={sparklineData} color={colors.spark} />
                
                {/* Word count */}
                <div className="text-right min-w-[80px]">
                  {section.target_word_count ? (
                    <>
                      <div className="text-sm font-mono font-semibold text-zinc-300">
                        {displayWords > 0 ? (displayWords / 1000).toFixed(1) : '—'}k
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        of {(section.target_word_count / 1000).toFixed(0)}k
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-zinc-600 font-mono">—</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Weekly insights */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/30">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-zinc-400">{weeklyStats.average.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider">avg/week</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-zinc-400">{weeklyStats.bestDay.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider">best day</div>
        </div>
        <div className="text-center md:col-span-1 col-span-2">
          <div className="text-lg font-mono font-bold text-zinc-400">
            {Math.ceil((totalTarget - totalCurrent) / weeklyStats.average)}
          </div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider">weeks left</div>
        </div>
      </div>
    </div>
  )
}
