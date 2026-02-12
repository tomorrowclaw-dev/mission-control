'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCw, Check } from 'lucide-react'
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

  const mainTasks = tasks.filter((task) => task.section === 'main')
  const backlogTasks = tasks.filter((task) => task.section === 'backlog')
  const completedTasks = tasks.filter((task) => task.isChecked).length
  const openTasks = tasks.length - completedTasks

  if (loading && tasks.length === 0) {
    return (
      <div className="card-glass p-6 h-full min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm font-mono">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="card-glass p-6 h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03] pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-sm">
            📝
          </div>
          <div>
            <h2 className="font-display text-lg leading-none">Weekly Tasks</h2>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/60 text-zinc-400">{tasks.length} total</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">{openTasks} open</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">{completedTasks} done</span>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTasks}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-zinc-800/35 border border-zinc-700/45 hover:bg-zinc-800/55 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Refresh"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="relative z-10 flex-1 space-y-5 overflow-y-auto pr-1 max-h-[420px]">
        <TaskSection title="Main Tasks" tasks={mainTasks} emptyLabel="No main tasks" />
        {backlogTasks.length > 0 && <TaskSection title="Backlog" tasks={backlogTasks} emptyLabel="No backlog items" />}
      </div>

      <div className="relative z-10 mt-4 pt-4 border-t border-zinc-800/40 text-[10px] text-zinc-600 font-mono flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          Synced from Notion
        </span>
        <span>Updated: {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
      </div>
    </div>
  )
}

function TaskSection({ title, tasks, emptyLabel }: { title: string; tasks: NotionTask[]; emptyLabel: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold mb-2.5">{title}</div>
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="text-sm text-zinc-600 italic">{emptyLabel}</div>
        )}
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: NotionTask }) {
  return (
    <div
      className={`group flex items-start gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
        task.isChecked
          ? 'border-emerald-500/20 bg-emerald-500/[0.04] opacity-70'
          : 'border-zinc-700/30 bg-zinc-900/25 hover:bg-zinc-800/35 hover:border-zinc-600/50'
      }`}
    >
      <div
        className={`mt-0.5 w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all duration-200 ${
          task.isChecked
            ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-300 scale-100'
            : 'border-zinc-600 text-zinc-600 group-hover:border-indigo-400/60 group-hover:text-indigo-300 scale-95'
        }`}
      >
        <Check size={11} className={`transition-all duration-200 ${task.isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      </div>
      <span
        className={`text-sm leading-relaxed transition-colors ${
          task.isChecked ? 'line-through text-zinc-500' : 'text-zinc-300 group-hover:text-zinc-100'
        }`}
      >
        {task.text}
      </span>
    </div>
  )
}
