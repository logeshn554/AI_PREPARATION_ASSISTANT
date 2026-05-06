import React, { useEffect, useRef } from 'react'

const DIMS = [
  { key: 'logic',         label: 'Logic' },
  { key: 'clarity',       label: 'Clarity' },
  { key: 'depth',         label: 'Depth' },
  { key: 'communication', label: 'Comm.' },
  { key: 'technical',     label: 'Technical' },
]

export default function RadarChart({ scores = {}, size = 220 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = size / 2, cy = size / 2
    const r  = size * 0.38
    const n  = DIMS.length
    const vals = DIMS.map(d => (scores[d.key] ?? 60) / 100)

    ctx.clearRect(0, 0, size, size)

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const x = cx + r * (ring / 4) * Math.cos(angle)
        const y = cy + r * (ring / 4) * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Spokes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Data polygon
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + r * vals[i] * Math.cos(angle)
      const y = cy + r * vals[i] * Math.sin(angle)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(96,165,250,0.18)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(96,165,250,0.7)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Dots
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + r * vals[i] * Math.cos(angle)
      const y = cy + r * vals[i] * Math.sin(angle)
      ctx.beginPath()
      ctx.arc(x, y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#60a5fa'
      ctx.fill()
    }

    // Labels
    ctx.font = `700 10px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'center'
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const lx = cx + (r + 18) * Math.cos(angle)
      const ly = cy + (r + 18) * Math.sin(angle)
      ctx.fillText(DIMS[i].label, lx, ly + 4)
    }
  }, [scores, size])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block', margin: '0 auto' }} />
}
