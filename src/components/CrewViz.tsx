'use client'

export default function CrewViz() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)]" style={{ height: 'calc(100vh - 60px)' }}>
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
