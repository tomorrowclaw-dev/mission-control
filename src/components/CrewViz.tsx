'use client'

export default function CrewViz() {
  return (
    <div className="bg-[#08080c] -m-6 overflow-hidden" style={{ width: 'calc(100% + 48px)', height: 'calc(100vh - 64px)' }}>
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
