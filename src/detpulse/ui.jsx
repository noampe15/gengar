import { useId } from "react"

export function Card({ className = "", children }) {
  return (
    <section className={`rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] ${className}`}>
      {children}
    </section>
  )
}

const TONE = {
  critical: "bg-red-50/80 text-red-700 border-red-200/60",
  degraded: "bg-amber-50/80 text-amber-700 border-amber-200/60",
  healthy: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
  ai: "bg-indigo-50/80 text-indigo-700 border-indigo-200/60",
}

export function StatusPill({ tone = "degraded", pulse = false, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE[tone] || TONE.degraded}`}>
      {pulse ? <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> : null}
      {children}
    </span>
  )
}

const STROKE = {
  critical: "#f43f5e",
  healthy: "#10b981",
  ai: "#7c6bf5",
  degraded: "#f59e0b",
  slate: "#64748b",
}

export function seriesPoints(values, width, height, pad = { t: 10, r: 2, b: 2, l: 2 }, domain) {
  const min = domain?.min ?? Math.min(...values)
  const max = domain?.max ?? Math.max(...values)
  const span = max - min || 1
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  return values.map((value, index) => ({
    x: pad.l + (values.length === 1 ? innerW / 2 : (index / (values.length - 1)) * innerW),
    y: pad.t + (1 - (value - min) / span) * innerH,
  }))
}

export function smoothPath(points) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  const n = points.length
  const slopes = []
  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x || 1
    slopes[i] = (points[i + 1].y - points[i].y) / dx
  }
  const tangents = [slopes[0]]
  for (let i = 1; i < n - 1; i += 1) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2
  }
  tangents[n - 1] = slopes[n - 2]
  for (let i = 0; i < n - 1; i += 1) {
    if (Math.abs(slopes[i]) < 1e-6) {
      tangents[i] = 0
      tangents[i + 1] = 0
    } else {
      const a = tangents[i] / slopes[i]
      const b = tangents[i + 1] / slopes[i]
      const size = a * a + b * b
      if (size > 9) {
        const scale = 3 / Math.sqrt(size)
        tangents[i] = scale * a * slopes[i]
        tangents[i + 1] = scale * b * slopes[i]
      }
    }
  }
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x
    const c1x = points[i].x + dx / 3
    const c1y = points[i].y + (tangents[i] * dx) / 3
    const c2x = points[i + 1].x - dx / 3
    const c2y = points[i + 1].y - (tangents[i + 1] * dx) / 3
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`
  }
  return path
}

export function areaPath(points, baseline) {
  if (points.length === 0) return ""
  const last = points[points.length - 1]
  const first = points[0]
  return `${smoothPath(points)} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`
}

export function Sparkline({ values, tone = "slate", width = 120, height = 44, fluid = false }) {
  const rawId = useId()
  const id = `spark-${rawId.replace(/:/g, "")}`
  const stroke = STROKE[tone] || STROKE.slate
  const points = seriesPoints(values, width, height, { t: height * 0.18, r: 1, b: height * 0.42, l: 1 })
  const line = smoothPath(points)
  const fill = areaPath(points, height)
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={fluid ? "100%" : width}
      height={fluid ? undefined : height}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={fluid ? "block h-16 w-full" : "block shrink-0"}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.38" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function CodeBlock({ children, className = "" }) {
  return (
    <pre className={`overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100 ${className}`}>
      {children}
    </pre>
  )
}

export function ruleView(rule, patched) {
  const done = patched[rule.id]
  if (!done) return { ...rule, patched: false, audit: "", prLabel: "" }
  return {
    ...rule,
    patched: true,
    tone: "healthy",
    pill: "HEALTHY / PATCHED",
    severity: "HEALTHY",
    status: "healthy",
    audit: `Approved by Lead Detection Engineer • Backtest #${rule.backtest} Verified`,
    prLabel: `PR #${rule.pr} Merged to ${rule.branch}`,
  }
}
