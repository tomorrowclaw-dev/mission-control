'use client'

export default function CrewViz() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        height: 'calc(100vh - 100px)',
        background: '#0e0d14',
        borderRadius: '8px',
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
