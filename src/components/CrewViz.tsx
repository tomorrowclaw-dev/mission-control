'use client'

export default function CrewViz() {
  return (
    <div className="fixed top-0 right-0 bottom-0 bg-[#08080c]" style={{ left: '240px' }}>
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
