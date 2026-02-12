'use client'

export default function CrewViz() {
  return (
    <div className="-m-6 lg:-m-8">
      <iframe
        src="/crew-viz.html"
        className="w-full border-0"
        style={{ height: 'calc(100vh - 2rem)' }}
        title="OpenClaw Crew HQ"
        allow="autoplay"
      />
    </div>
  )
}
