import { useId, useState } from "react"

function smoothLine(coords) {
  if (!coords.length) return ""
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`
  let d = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1]
    const p1 = coords[i]
    const p2 = coords[i + 1]
    const p3 = coords[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

export default function Sparkline({ series, valueKey, ariaLabel, formatHover, compact = false, unitLabel = "" }) {
  const [hover, setHover] = useState(null)
  const uid = useId().replace(/:/g, "")
  const w = 240
  const h = compact ? 32 : 88
  const pad = compact ? { l: 4, r: 8, t: 8, b: 4 } : { l: 8, r: 8, t: 12, b: 22 }
  const fillId = `spark-fill-${uid}`
  const glowId = `spark-glow-${uid}`

  if (!series?.length) {
    return <div className={compact ? "h-8" : "h-[88px]"} aria-hidden="true" />
  }

  const values = series.map((p) => p[valueKey])
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1e-6, max - min)
  const yPad = span * 0.35
  const yMin = min - yPad
  const yMax = max + yPad * 0.2
  const ySpan = Math.max(1e-6, yMax - yMin)
  const denom = Math.max(1, series.length - 1)
  const baseY = h - pad.b
  const coords = series.map((p, i) => {
    const x = pad.l + (i / denom) * (w - pad.l - pad.r)
    const y = pad.t + (1 - (p[valueKey] - yMin) / ySpan) * (h - pad.t - pad.b)
    return { ...p, x, y, i }
  })
  const line = smoothLine(coords)
  const area = `${line} L ${coords[coords.length - 1].x.toFixed(2)} ${baseY} L ${coords[0].x.toFixed(2)} ${baseY} Z`
  const mid = Math.floor((series.length - 1) / 2)
  const labeled = new Set([0, mid, series.length - 1])
  const gridYs = compact ? [] : [0.25, 0.5, 0.75].map((t) => pad.t + t * (h - pad.t - pad.b))

  function anchorFor(i) {
    if (i === 0) return "start"
    if (i === series.length - 1) return "end"
    return "middle"
  }

  function tooltipLeft() {
    if (!hover) return "50%"
    const pct = (hover.x / w) * 100
    return `${Math.min(86, Math.max(14, pct))}%`
  }

  return (
    <div className="relative">
      {unitLabel && !compact && (
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">{unitLabel}</p>
      )}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={compact ? "h-8 w-full cursor-crosshair overflow-visible" : "h-[88px] w-full cursor-crosshair overflow-visible"}
        role="img"
        aria-label={ariaLabel}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * w
          let nearest = coords[0]
          let best = Infinity
          for (const p of coords) {
            const d = Math.abs(p.x - x)
            if (d < best) {
              best = d
              nearest = p
            }
          }
          setHover(nearest)
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6CFF" stopOpacity="0.5" />
            <stop offset="62%" stopColor="#A99BFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#EEF0FF" stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {gridYs.map((y) => (
          <line key={y} x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#EEF0F6" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#${fillId})`} />
        <path
          d={line}
          fill="none"
          stroke="#6d5cff"
          strokeWidth={compact ? 1.75 : 2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {hover && (
          <>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={pad.t}
              y2={baseY}
              stroke="#C4B8FF"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={hover.x} cy={hover.y} r="7" fill="#6d5cff" fillOpacity="0.16" />
            <circle cx={hover.x} cy={hover.y} r="3.5" fill="#ffffff" stroke="#6d5cff" strokeWidth="2" />
          </>
        )}
        {coords.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r="8"
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={`${p.date}: ${formatHover(p)}`}
            className="outline-none focus-visible:fill-[#6d5cff]/20"
            onFocus={() => setHover(p)}
            onBlur={() => setHover((cur) => (cur?.date === p.date ? null : cur))}
          />
        ))}
        {!compact &&
          coords
            .filter((p) => labeled.has(p.i))
            .map((p) => (
              <text key={`t-${p.date}`} x={p.x} y={h - 4} textAnchor={anchorFor(p.i)} fill="#94a3b8" fontSize="9">
                {p.date}
              </text>
            ))}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-[9.5rem] -translate-x-1/2 rounded-xl border border-[#ece8ff] bg-white/95 px-2.5 py-1.5 text-center shadow-[0_8px_24px_rgba(109,92,255,0.12)] backdrop-blur-sm"
          style={{ left: tooltipLeft() }}
        >
          <span className="block text-[11px] font-semibold text-slate-800">{hover.date}</span>
          <span className="mt-0.5 block text-[11px] text-slate-500">{formatHover(hover)}</span>
        </div>
      )}
    </div>
  )
}
