'use client'

export default function CrewViz() {
  return (
    <div className="w-full bg-[#08080c] rounded-xl overflow-hidden" style={{ aspectRatio: '480 / 320' }}>
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
