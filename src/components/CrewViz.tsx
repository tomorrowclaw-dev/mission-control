'use client'

export default function CrewViz() {
  return (
    <div 
      className="-m-6 bg-[#0e0d14]" 
      style={{ 
        width: 'calc(100% + 48px)', 
        height: 'calc(100vh - 56px)',
      }}
    >
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
