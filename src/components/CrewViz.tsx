'use client'

export default function CrewViz() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm">🐙</div>
        <div>
          <h2 className="font-display text-lg">Crew HQ</h2>
          <p className="text-[10px] text-[var(--text-dim)] font-mono tracking-wide mt-0.5">live crew visualization</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        <iframe
          src="/crew-viz.html"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 230px)' }}
          title="OpenClaw Crew HQ"
          allow="autoplay"
        />
      </div>
    </div>
  )
}
