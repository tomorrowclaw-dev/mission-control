'use client'

export default function CrewViz() {
  return (
    <div className="flex items-center justify-center rounded-xl overflow-hidden bg-[#08080c]" style={{ height: 'calc(100vh - 100px)' }}>
      <iframe
        src="/crew-viz.html"
        className="w-full h-full border-0 block"
        title="OpenClaw Crew HQ"
        allow="autoplay"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  )
}
