'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCw, Check, Circle } from 'lucide-react'
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

  if (loading && tasks.length === 0) {
    return (
      <div className="card-glass p-6 h-full min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm font-mono">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="card-glass p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-sm">
            📝
          </div>
          <div>
            <h2 className="font-display text-lg leading-none">Weekly Tasks</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Synced from Notion
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchTasks}
          disabled={isRefreshing}
          className={`p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
          title="Refresh"
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 max-h-[400px]">
        {/* Main Tasks */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold mb-3">Main Tasks</div>
          <div className="space-y-2">
            {mainTasks.length > 0 ? (
              mainTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <div className="text-sm text-zinc-600 italic">No main tasks</div>
            )}
          </div>
        </div>

        {/* Backlog */}
        {backlogTasks.length > 0 && (
          <div>
             <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold mb-3 mt-6">Backlog</div>
             <div className="space-y-2">
               {backlogTasks.map(task => (
                 <TaskItem key={task.id} task={task} />
               ))}
             </div>
          </div>
        )}
      </div>
      
      {/* Footer Timestamp */}
      <div className="mt-4 pt-4 border-t border-zinc-800/30 text-[10px] text-zinc-600 font-mono text-right">
        Updated: {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: NotionTask }) {
  return (
    <div className={`group flex items-start gap-3 p-2 rounded-lg transition-colors ${task.isChecked ? 'opacity-50' : 'hover:bg-zinc-800/30'}`}>
      <div className={`mt-0.5 ${task.isChecked ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {task.isChecked ? <Check size={14} /> : <Circle size={14} />}
      </div>
      <span className={`text-sm leading-relaxed ${task.isChecked ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
        {task.text}
      </span>
    </div>
  )
}
