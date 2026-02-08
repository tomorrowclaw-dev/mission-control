'use client'

import { Paper } from '@/lib/types'

interface PapersListProps {
  papers: Paper[]
}

const tagColors: Record<string, string> = {
  'TTF': 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  'DSR': 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  'RAG': 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  'trust': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'scaffolding': 'bg-pink-500/12 text-pink-400 border-pink-500/20',
  'K-12': 'bg-red-500/12 text-red-400 border-red-500/20',
  'school-safety': 'bg-red-500/12 text-red-400 border-red-500/20',
  'methodology': 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  'kernel-theory': 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  'evaluation': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'usability': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'SUS': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'human-AI': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'calibration': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'architecture': 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  'education': 'bg-pink-500/12 text-pink-400 border-pink-500/20',
  'theory': 'bg-zinc-500/12 text-zinc-400 border-zinc-500/20',
  'domain': 'bg-red-500/12 text-red-400 border-red-500/20',
  'risk-assessment': 'bg-red-500/12 text-red-400 border-red-500/20',
  'AI': 'bg-indigo-500/12 text-indigo-400 border-indigo-500/20',
}

export default function PapersList({ papers }: PapersListProps) {
  return (
    <div className="grid gap-3">
      {papers.map((paper, idx) => (
        <div
          key={paper.id}
          className="card p-5 relative overflow-hidden card-shine group animate-in"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-[15px] leading-snug text-zinc-200 group-hover:text-white transition-colors">
                  {paper.title}
                </h4>
                {paper.review_status && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border shrink-0 ${
                    paper.review_status === 'cited' ? 'bg-green-500/12 text-green-400 border-green-500/20' :
                    paper.review_status === 'reviewed' ? 'bg-blue-500/12 text-blue-400 border-blue-500/20' :
                    paper.review_status === 'reading' ? 'bg-amber-500/12 text-amber-400 border-amber-500/20' :
                    'bg-zinc-500/12 text-zinc-400 border-zinc-500/20'
                  }`}>
                    {paper.review_status}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                {paper.authors} {paper.year && `(${paper.year})`}
                {paper.source && <span className="text-zinc-600"> · {paper.source}</span>}
              </p>
            </div>
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/50 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 border border-zinc-700/50 hover:border-indigo-500/30 shrink-0 transition-all font-mono"
              >
                DOI ↗
              </a>
            )}
          </div>

          {paper.summary && (
            <p className="text-[12px] text-zinc-400 mt-3 leading-relaxed">{paper.summary}</p>
          )}

          {paper.relevance_notes && (
            <p className="text-[11px] text-indigo-400/60 mt-2 leading-relaxed pl-3 border-l-2 border-indigo-500/20">
              {paper.relevance_notes}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-3">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                  tagColors[tag] || 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
