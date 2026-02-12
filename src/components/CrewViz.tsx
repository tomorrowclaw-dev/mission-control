'use client'

export default function CrewViz() {
  return (
    <div 
      className="-m-6" 
      style={{ 
        width: 'calc(100% + 48px)', 
        height: 'calc(100vh - 56px)',
        background: '#0e0d14',
        overflow: 'hidden',
        position: 'relative',
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
