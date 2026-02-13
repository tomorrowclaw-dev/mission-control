'use client'

export default function CrewViz() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-2xl"
      style={{
        height: 'calc(100vh - 80px)',
        background: '#0e0d14',
      }}
    >
      <iframe
        src="/crew-viz.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
