'use client'

export default function CrewViz() {
  return (
    <div className="flex items-center justify-center w-full" style={{ height: 'calc(100vh - 120px)' }}>
      <div
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: '100%',
          maxWidth: '1200px',
          aspectRatio: '3 / 2',
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
    </div>
  )
}
