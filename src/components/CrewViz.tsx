'use client'

import { useState } from 'react'

export default function CrewViz() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm">🐙</div>
          <div>
            <h2 className="font-display text-lg">Crew HQ</h2>
            <p className="text-[10px] text-zinc-600 font-mono tracking-wide mt-0.5">live AI crew visualization · top-down command center</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/crew-viz.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/30 hover:border-zinc-600/50 transition-all font-mono"
          >
            ↗ Open Full
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-[10px] px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/30 hover:border-zinc-600/50 transition-all font-mono"
          >
            {isFullscreen ? '↙ Collapse' : '⛶ Expand'}
          </button>
        </div>
      </div>

      <div
        className={`relative rounded-xl overflow-hidden border border-zinc-800/50 transition-all duration-300 ${
          isFullscreen ? 'h-[85vh]' : 'h-[600px]'
        }`}
      >
        <iframe
          src="/crew-viz.html"
          className="w-full h-full border-0"
          title="OpenClaw Crew HQ"
          allow="autoplay"
        />
      </div>
    </div>
  )
}
