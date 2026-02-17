'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Note {
  id: number
  text: string
  created_at: string
  seen_by_clyde: boolean
  action_taken: string | null
}

export default function InboxNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/inbox')
      if (!res.ok) throw new Error('Failed to fetch')
      setNotes(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setNewNote('')
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="card-glass p-6">
        <div className="text-zinc-500 text-sm animate-pulse">Loading inbox...</div>
      </div>
    )
  }

  const unread = notes.filter(n => !n.seen_by_clyde).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">📥</div>
        <h2 className="font-display text-lg">Inbox</h2>
        <div className="flex-1" />
        {unread > 0 && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {unread} unread
          </span>
        )}
      </div>

      {/* Quick note form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Drop a note for Clyde..."
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700/30 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!newNote.trim() || sending}
          className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium border border-indigo-500/30 hover:bg-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>

      {/* Notes list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notes.map(note => (
          <div
            key={note.id}
            className={`p-3 rounded-xl border transition-all ${
              note.seen_by_clyde
                ? 'bg-zinc-900/20 border-zinc-800/30 opacity-60'
                : 'bg-zinc-900/40 border-zinc-700/30'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">{note.seen_by_clyde ? '✅' : '📬'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">{note.text}</p>
                {note.action_taken && (
                  <p className="text-[11px] text-emerald-400/70 mt-1">→ {note.action_taken}</p>
                )}
                <span className="text-[9px] text-zinc-600 font-mono">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-sm">
            No notes yet. Drop one above and Clyde will pick it up.
          </div>
        )}
      </div>
    </div>
  )
}
