'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContentIdea } from '@/lib/types'
// Using inline icons to avoid Turbopack resolve issues
const Icon = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
)

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '𝕏',
  linkedin: 'in',
  both: '📢',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'ai-news': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  'ai-tools': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  'thesis': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'thesis-insights': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'security': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'tools': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'research': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'industry': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'personal-brand': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  'tutorial': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  idea: { label: 'Idea', icon: '✨', color: 'text-zinc-400', bgColor: 'bg-zinc-500/10 border-zinc-500/20' },
  drafted: { label: 'Drafted', icon: '✏️', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  ready: { label: 'Ready', icon: '✓', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  scheduled: { label: 'Scheduled', icon: '📤', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  posted: { label: 'Posted', icon: '↗', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' },
}

type ViewMode = 'board' | 'list'

export default function ContentHub() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newIdea, setNewIdea] = useState({ title: '', hook: '', platform: 'twitter', category: 'ai-news' })

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        setIdeas(data)
      }
    } catch (err) {
      console.error('Failed to fetch content ideas', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIdeas()
  }, [fetchIdeas])

  const updateStatus = async (id: string, status: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: status as ContentIdea['status'] } : i))
    try {
      await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { status } })
      })
    } catch { /* revert on error would go here */ }
  }

  const updateDraft = async (id: string, full_draft: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, full_draft } : i))
    setEditingId(null)
    try {
      await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { full_draft, status: 'drafted' } })
      })
    } catch { /* revert */ }
  }

  const createIdea = async () => {
    if (!newIdea.title.trim()) return
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIdea.title,
          hook: newIdea.hook || null,
          platform: newIdea.platform,
          category: newIdea.category,
          status: 'idea',
          week_of: new Date().toISOString().split('T')[0],
        })
      })
      if (res.ok) {
        setShowNewForm(false)
        setNewIdea({ title: '', hook: '', platform: 'twitter', category: 'ai-news' })
        fetchIdeas()
      }
    } catch { /* */ }
  }

  const deleteIdea = async (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id))
    try {
      await fetch('/api/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch { /* */ }
  }

  const columns = [
    { key: 'idea', label: 'Ideas', emoji: '💡' },
    { key: 'drafted', label: 'Drafted', emoji: '✍️' },
    { key: 'ready', label: 'Ready to Post', emoji: '🚀' },
    { key: 'posted', label: 'Posted', emoji: '✅' },
  ]

  const ideaCounts = {
    idea: ideas.filter(i => i.status === 'idea').length,
    drafted: ideas.filter(i => i.status === 'drafted').length,
    ready: ideas.filter(i => i.status === 'ready' || i.status === 'scheduled').length,
    posted: ideas.filter(i => i.status === 'posted').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="text-4xl">💡</div>
          <div className="text-[var(--text-dim)] text-sm font-mono">Loading content pipeline...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-display text-2xl">Content Pipeline</h2>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              {ideas.length} ideas · {ideaCounts.drafted} drafted · {ideaCounts.posted} posted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-zinc-800/50 rounded-lg border border-zinc-700/30 p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === 'board' ? 'bg-zinc-700/80 text-[var(--text)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === 'list' ? 'bg-zinc-700/80 text-[var(--text)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-[var(--accent)] rounded-xl border border-accent/20 hover:border-accent/40 transition-all text-sm font-medium"
          >
            ＋
            New Idea
          </button>

          <button
            onClick={fetchIdeas}
            className="p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/50 text-[var(--text-dim)] hover:text-[var(--text)] border border-zinc-700/30 transition-all"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {columns.map(col => (
          <div key={col.key} className="instrument p-3 text-center">
            <div className="text-lg">{col.emoji}</div>
            <div className="font-mono text-2xl font-bold text-[var(--accent)] mt-1">
              {ideaCounts[col.key as keyof typeof ideaCounts]}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mt-1">{col.label}</div>
          </div>
        ))}
      </div>

      {/* New Idea Form */}
      {showNewForm && (
        <div className="card-glass p-6 border-2 border-accent/20 animate-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">New Content Idea</h3>
            <button onClick={() => setShowNewForm(false)} className="p-1 text-[var(--text-dim)] hover:text-[var(--text)]">
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono block mb-1.5">Title</label>
              <input
                type="text"
                value={newIdea.title}
                onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="What's the content about?"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)]/50 focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono block mb-1.5">Hook</label>
              <textarea
                value={newIdea.hook}
                onChange={e => setNewIdea({ ...newIdea, hook: e.target.value })}
                placeholder="The attention-grabbing opening line..."
                rows={2}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)]/50 focus:outline-none focus:border-accent/50 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono block mb-1.5">Platform</label>
                <select
                  value={newIdea.platform}
                  onChange={e => setNewIdea({ ...newIdea, platform: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-accent/50"
                >
                  <option value="twitter">X / Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono block mb-1.5">Category</label>
                <select
                  value={newIdea.category}
                  onChange={e => setNewIdea({ ...newIdea, category: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-accent/50"
                >
                  <option value="ai-news">AI News</option>
                  <option value="tools">Tools & Builds</option>
                  <option value="thesis">Thesis</option>
                  <option value="security">Security</option>
                  <option value="research">Research</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="personal-brand">Personal Brand</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-[var(--text-dim)] hover:text-[var(--text)]">Cancel</button>
              <button
                onClick={createIdea}
                className="px-6 py-2 bg-accent/20 hover:bg-accent/30 text-[var(--accent)] rounded-lg border border-accent/30 text-sm font-medium transition-all"
              >
                Create Idea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => {
            const colIdeas = ideas.filter(i => 
              col.key === 'ready' ? (i.status === 'ready' || i.status === 'scheduled') : i.status === col.key
            )
            return (
              <div key={col.key} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-2">
                  <span>{col.emoji}</span>
                  <span className="text-sm font-medium text-[var(--text)]">{col.label}</span>
                  <span className="text-[10px] font-mono text-[var(--text-dim)] bg-zinc-800/50 rounded-full px-2 py-0.5">
                    {colIdeas.length}
                  </span>
                </div>

                {/* Column content */}
                <div className="space-y-2 min-h-[100px]">
                  {colIdeas.map(idea => (
                    <ContentCard
                      key={idea.id}
                      idea={idea}
                      expanded={expandedId === idea.id}
                      editing={editingId === idea.id}
                      editDraft={editDraft}
                      onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                      onStartEdit={() => { setEditingId(idea.id); setEditDraft(idea.full_draft || '') }}
                      onSaveDraft={() => updateDraft(idea.id, editDraft)}
                      onCancelEdit={() => setEditingId(null)}
                      onEditDraftChange={setEditDraft}
                      onStatusChange={(status) => updateStatus(idea.id, status)}
                      onDelete={() => deleteIdea(idea.id)}
                    />
                  ))}
                  {colIdeas.length === 0 && (
                    <div className="border border-dashed border-zinc-700/40 rounded-xl p-6 text-center">
                      <div className="text-[var(--text-dim)] text-xs font-mono">No items</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {ideas.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-display text-lg">No content ideas yet</h3>
              <p className="text-sm text-[var(--text-dim)] mt-2">Click &ldquo;New Idea&rdquo; to start building your pipeline</p>
            </div>
          ) : (
            ideas.map(idea => (
              <ContentCard
                key={idea.id}
                idea={idea}
                expanded={expandedId === idea.id}
                editing={editingId === idea.id}
                editDraft={editDraft}
                onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                onStartEdit={() => { setEditingId(idea.id); setEditDraft(idea.full_draft || '') }}
                onSaveDraft={() => updateDraft(idea.id, editDraft)}
                onCancelEdit={() => setEditingId(null)}
                onEditDraftChange={setEditDraft}
                onStatusChange={(status) => updateStatus(idea.id, status)}
                onDelete={() => deleteIdea(idea.id)}
                listMode
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ContentCard({
  idea, expanded, editing, editDraft, onToggle, onStartEdit, onSaveDraft, onCancelEdit, onEditDraftChange, onStatusChange, onDelete, listMode = false
}: {
  idea: ContentIdea
  expanded: boolean
  editing: boolean
  editDraft: string
  onToggle: () => void
  onStartEdit: () => void
  onSaveDraft: () => void
  onCancelEdit: () => void
  onEditDraftChange: (v: string) => void
  onStatusChange: (status: string) => void
  onDelete: () => void
  listMode?: boolean
}) {
  const cat = CATEGORY_COLORS[idea.category] || CATEGORY_COLORS['ai-news']
  const statusConf = STATUS_CONFIG[idea.status] || STATUS_CONFIG['idea']
  const nextStatus: Record<string, string> = { idea: 'drafted', drafted: 'ready', ready: 'posted', scheduled: 'posted' }

  return (
    <div className={`card-glass group transition-all duration-200 hover:border-zinc-600/50 ${listMode ? 'p-4' : 'p-3'} ${expanded ? 'ring-1 ring-accent/20' : ''}`}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={onToggle}>
        {/* Platform badge */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          idea.platform === 'twitter' ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-900/30 text-blue-400'
        }`}>
          {PLATFORM_ICONS[idea.platform] || '📝'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-[var(--text)] leading-snug">{idea.title}</h4>
            <span className="text-[var(--text-dim)] shrink-0">›</span>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}`}>
              {idea.category}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${statusConf.bgColor}`}>
              {statusConf.icon}
              {statusConf.label}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-zinc-800/50 space-y-3 animate-in">
          {/* Hook */}
          {idea.hook && (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-mono mb-1">Hook</div>
              <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">&ldquo;{idea.hook}&rdquo;</p>
            </div>
          )}

          {/* Draft */}
          {editing ? (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-mono mb-1">Draft</div>
              <textarea
                value={editDraft}
                onChange={e => onEditDraftChange(e.target.value)}
                rows={6}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-accent/50 resize-y"
                placeholder="Write your post here..."
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={onCancelEdit} className="px-3 py-1 text-xs text-[var(--text-dim)]">Cancel</button>
                <button onClick={onSaveDraft} className="px-3 py-1 text-xs bg-accent/20 text-[var(--accent)] rounded-md border border-accent/30">Save Draft</button>
              </div>
            </div>
          ) : idea.full_draft ? (
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-mono mb-1">Draft</div>
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">{idea.full_draft}</p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onStartEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800/50 hover:bg-zinc-700/50 text-[var(--text-secondary)] rounded-lg border border-zinc-700/30 transition-all"
            >
              ✏️
              {idea.full_draft ? 'Edit Draft' : 'Write Draft'}
            </button>

            {nextStatus[idea.status] && (
              <button
                onClick={() => onStatusChange(nextStatus[idea.status])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/10 hover:bg-accent/20 text-[var(--accent)] rounded-lg border border-accent/20 transition-all"
              >
                ›
                Move to {STATUS_CONFIG[nextStatus[idea.status]]?.label || nextStatus[idea.status]}
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              🗑
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
