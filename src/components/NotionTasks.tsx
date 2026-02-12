'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCw, Check, Circle, CheckCircle2 } from 'lucide-react'
import { NotionTask } from '@/lib/types'

export default function NotionTasks() {
  const [tasks, setTasks] = useState<NotionTask[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const res = await fetch('/api/notion/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setLastSynced(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 60000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const mainTasks = tasks.filter(t => t.section === 'main')
  const backlogTasks = tasks.filter(t => t.section === 'backlog')
  const completedCount = tasks.filter(t => t.isChecked).length
  const totalCount = tasks.length
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading && tasks.length === 0) {
    return (
      <div className="card-glass p-6 h-full min-h-[300px] flex items-center justify-center notion-loading-shimmer relative overflow-hidden">
        <div className="text-center space-y-3 relative z-10">
          <div className="text-4xl text-[var(--text-dim)]/80">📝</div>
          <div className="text-[var(--text-dim)] text-sm font-mono">Syncing tasks from Notion...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glass p-6 h-full flex flex-col relative overflow-hidden backdrop-blur-xl">
      {/* Enhanced header with progress */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">
              📝
            </div>
            <div>
              <h2 className="font-display text-lg leading-none">Weekly Tasks</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                  <span className="text-[10px] text-[var(--text-dim)] font-mono uppercase tracking-wider">
                    Notion Sync
                  </span>
                </div>
                <span className="text-[var(--text-dim)]">·</span>
                <span className="text-[10px] text-[var(--text-dim)] font-mono">
                  {completedCount}/{totalCount} complete
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchTasks}
            disabled={isRefreshing}
            className={`p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/50 text-[var(--text-dim)] hover:text-[var(--text)] border border-zinc-700/30 hover:border-zinc-600/50 transition-all ${isRefreshing ? 'animate-spin' : 'hover:scale-105'}`}
            title="Refresh tasks"
          >
            <RotateCw size={14} />
          </button>
        </div>
        
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[var(--text-dim)] font-mono">Progress</span>
              <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                {completionPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced content */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 max-h-[400px] scrollbar-thin">
        {/* Main Tasks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-bold">Main Tasks</div>
            <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/50 to-transparent" />
            <span className="text-[9px] text-[var(--text-dim)] font-mono">
              {mainTasks.filter(t => !t.isChecked).length} active
            </span>
          </div>
          <div className="space-y-2">
            {mainTasks.length > 0 ? (
              mainTasks.map((task, idx) => (
                <TaskItem key={task.id} task={task} index={idx} />
              ))
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-sm text-[var(--text-dim)]">No main tasks</div>
                <div className="text-xs text-[var(--text-dim)] mt-1">You're all caught up!</div>
              </div>
            )}
          </div>
        </div>

        {/* Backlog */}
        {backlogTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 mt-6">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-dim)] font-bold">Backlog</div>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/30 to-transparent" />
              <span className="text-[9px] text-[var(--text-dim)] font-mono">
                {backlogTasks.length} items
              </span>
            </div>
            <div className="space-y-2">
              {backlogTasks.map((task, idx) => (
                <TaskItem key={task.id} task={task} index={idx} isBacklog />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced footer */}
      <div className="mt-4 pt-4 border-t border-zinc-800/30 flex items-center justify-between">
        <div className="text-[10px] text-[var(--text-dim)] font-mono">
          {lastSynced
            ? `Last sync: ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Synced from Notion'}
        </div>
        <div className="text-[10px] text-[var(--text-dim)] font-mono">
          Notion · Auto-refresh
        </div>
      </div>
    </div>
  )
}

function TaskItem({ task, index, isBacklog = false }: { task: NotionTask, index: number, isBacklog?: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const handleTaskClick = () => {
    if (!task.isChecked) {
      setJustCompleted(true)
      // In a real app, this would update the task status
      setTimeout(() => setJustCompleted(false), 1000)
    }
  }

  return (
    <div 
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer animate-in ${
        task.isChecked 
          ? 'opacity-60 bg-green-500/5' 
          : isBacklog
          ? 'hover:bg-zinc-800/20 border border-transparent hover:border-zinc-700/30'
          : 'hover:bg-zinc-800/30 hover:translate-x-1 border border-transparent hover:border-zinc-700/30'
      } ${justCompleted ? 'animate-pulse bg-green-500/20' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTaskClick}
    >
      {/* Enhanced checkbox with animations */}
      <div className={`mt-0.5 transition-all duration-300 ${
        task.isChecked ? 'text-green-400' : isHovered ? 'text-[var(--text)] scale-110' : 'text-[var(--text-dim)]'
      }`}>
        {task.isChecked ? (
          <div className="relative">
            <CheckCircle2 size={16} className="animate-in" />
            {justCompleted && (
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
            )}
          </div>
        ) : (
          <div className="relative group/checkbox">
            <Circle 
              size={16} 
              className={`transition-all ${isHovered ? 'stroke-2' : 'stroke-1'}`} 
            />
            {isHovered && (
              <Check 
                size={12} 
                className="absolute inset-0 m-auto text-[var(--text-secondary)] animate-in opacity-40" 
              />
            )}
          </div>
        )}
      </div>
      
      {/* Enhanced task text */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm leading-relaxed transition-all duration-300 ${
          task.isChecked 
            ? 'line-through text-[var(--text-dim)]' 
            : isHovered 
            ? 'text-zinc-100' 
            : 'text-[var(--text)]'
        }`}>
          {task.text}
        </span>
        
        {/* Priority indicator (if needed) */}
        {task.text.toLowerCase().includes('urgent') && !task.isChecked && (
          <span className="inline-block ml-2 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
        )}
      </div>
      
      {/* Task status indicator */}
      {!task.isChecked && isHovered && !isBacklog && (
        <div className="text-[9px] px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 animate-in opacity-60">
          Click to complete
        </div>
      )}
    </div>
  )
}
