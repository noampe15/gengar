import { useEffect, useId, useState } from "react"
import { MATRIX, RULES, VOLUME_ACTUAL, VOLUME_DAYS, VOLUME_EXPECTED } from "./model"
import { usePulse } from "./PulseContext"
import { Card, areaPath, seriesPoints, smoothPath } from "./ui"

const W = 640
const H = 168

export function VolumeChart({ fill = false }) {
  const rawId = useId().replace(/:/g, "")
  const horizon = RULES.find((rule) => rule.id === "powershell")
  const domain = { min: 0, max: Math.max(...VOLUME_EXPECTED, ...VOLUME_ACTUAL, 1) }
  const expected = seriesPoints(VOLUME_EXPECTED, W, H, { t: 12, r: 8, b: 8, l: 8 }, domain)
  const actual = seriesPoints(VOLUME_ACTUAL, W, H, { t: 12, r: 8, b: 8, l: 8 }, domain)
  const zero = actual[actual.length - 1]

  return (
    <Card className={fill ? "flex h-full min-h-0 flex-col overflow-hidden p-3" : "p-4"}>
      <h2 className="text-[14px] font-semibold text-slate-900">Silent Failure Horizon: Expected vs. Actual Match Volume - 7d</h2>
      <p className="mt-1.5 inline-flex max-w-full rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        Rule: {horizon.title} ({horizon.technique})
      </p>
      <p className="mt-1 font-mono text-[22px] font-semibold tracking-tight text-slate-900">0 hits</p>
      <p className="text-[12px] font-medium text-rose-500">▼ Drop to zero · Nov 3 · 02:14 UTC</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={fill ? "mt-2 block min-h-24 w-full flex-1" : "mt-2 block h-40 w-full"} preserveAspectRatio="none" role="img" aria-label="Expected baseline versus actual match volume, dropping to zero on November 3">
        <defs>
          <linearGradient id={`${rawId}-base`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${rawId}-actual`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6bf5" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7c6bf5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${rawId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c6bf5" />
            <stop offset="72%" stopColor="#7c6bf5" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <path d={areaPath(expected, H - 8)} fill={`url(#${rawId}-base)`} />
        <path d={smoothPath(expected)} fill="none" stroke="#cbd5e1" strokeWidth="1.75" strokeDasharray="5 4" strokeLinecap="round" />
        <path d={areaPath(actual, H - 8)} fill={`url(#${rawId}-actual)`} />
        <path d={smoothPath(actual)} fill="none" stroke={`url(#${rawId}-stroke)`} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={zero.x} cy={zero.y} r="3.5" fill="#f43f5e" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{VOLUME_DAYS[0]}</span>
        <span>{VOLUME_DAYS[3]}</span>
        <span>{VOLUME_DAYS[VOLUME_DAYS.length - 1]}</span>
      </div>
      <p className="mt-2 text-[12px] text-slate-600">0% Match — Falcon v7.14 schema drift. The baseline held near 42 hits a day.</p>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-slate-300" /> Expected baseline</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#7c6bf5]" /> Actual production</span>
      </div>
    </Card>
  )
}

const CELL = {
  verified: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  degraded: "border-amber-200/80 bg-amber-50 text-amber-800",
  blind: "border-red-200/80 bg-red-50 text-red-800",
}

const STATE_LABEL = {
  verified: "Verified Active",
  degraded: "Degraded / Noisy",
  blind: "Silently Blind",
}

export function MitreMatrix() {
  const { patched } = usePulse()
  return (
    <Card className="@container overflow-hidden p-4">
      <h2 className="text-[14px] font-semibold text-slate-900">MITRE ATT&CK Resilience Matrix</h2>
      <p className="mt-0.5 text-[12px] text-slate-500">Live telemetry health, not whether the rule is enabled.</p>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 @min-[36rem]:grid-cols-4">
        {MATRIX.map((column) => (
          <div key={column.tactic} className="min-w-0">
            <p className="mb-1.5 text-xs leading-tight font-semibold tracking-wide break-words text-slate-400 uppercase">{column.tactic}</p>
            <div className="space-y-1">
              {column.cells.map((cell) => {
                const healed = cell.ruleId && patched[cell.ruleId]
                const state = healed ? "verified" : cell.base
                return (
                  <div key={cell.id} title={STATE_LABEL[state]} className={`rounded-md border px-1.5 py-0.5 font-mono text-xs ${CELL[state]}`}>
                    {cell.id}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <Legend swatch="bg-emerald-500" label="Verified Active" />
        <Legend swatch="bg-amber-500" label="Degraded / Noisy" />
        <Legend swatch="bg-red-500" label="Silently Blind" />
      </div>
    </Card>
  )
}

function Legend({ swatch, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-1.5 rounded-full ${swatch}`} />
      {label}
    </span>
  )
}

const PLOT_W = 960
const PLOT_H = 220
const PLOT_PAD = { t: 18, r: 18, b: 28, l: 48 }
const HORIZON_DAYS = ["Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 1", "Nov 2", "Nov 3"]

const HORIZONS = [
  {
    id: "powershell",
    technique: "T1059.001",
    name: "PowerShell",
    badge: "0 hits (Silent Drop)",
    badgeClass: "bg-rose-50 text-rose-700",
    kind: "series",
    baseline: [42, 41, 43, 40, 42, 44, 42],
    actual: [40, 44, 41, 39, 43, 36, 0],
    spread: 5,
    domain: { min: 0, max: 60 },
    ticks: [0, 42],
    eventAt: 5.4,
    eventColor: "#f43f5e",
    zoneLabel: "Blind Spot Zone",
    eventLabel: "Falcon v7.14 renamed 'ProcessCommandLine' -> 'process.cmd_line'",
    endLabel: "0 hits",
    aria: "Suspicious PowerShell match volume holds near 42 hits a day, then drops to zero after Falcon renamed ProcessCommandLine.",
  },
  {
    id: "okta",
    technique: "T1078",
    name: "Okta Session",
    badge: "+340% Spike (FP Storm)",
    badgeClass: "bg-amber-50 text-amber-800",
    kind: "series",
    baseline: [118, 124, 116, 121, 119, 122, 120],
    actual: [112, 128, 119, 125, 140, 480, 1840],
    spread: 16,
    domain: { min: 0, max: 2100 },
    ticks: [0, 120, 1840],
    eventAt: 5.15,
    eventColor: "#d97706",
    zoneLabel: "+340% False Positive Zone",
    eventLabel: "Cloudflare WARP egress CIDR cutover",
    endLabel: "1,840 hits/day",
    aria: "Okta session matches hold near 120 hits a day, then spike to 1,840 hits a day after the Cloudflare WARP egress cutover.",
  },
  {
    id: "lsass",
    technique: "T1003.001",
    name: "LSASS Dump",
    badge: "SOAR 422 Drop",
    badgeClass: "bg-amber-50 text-amber-800",
    kind: "webhook",
    matches: [1, 1, 2, 2, 3, 4, 4],
    webhooks: [0, 0, 0, 0, 0, 0, 0],
    domain: { min: 0, max: 5 },
    ticks: [0, 2, 4],
    eventAt: 6,
    eventColor: "#f43f5e",
    eventLabel: "0/4 Torq Webhook Executions (Missing 'DeviceId' in project clause)",
    aria: "LSASS dump matched 4 times in Sentinel. Torq executed 0 of 4 webhooks because DeviceId was missing from the project clause.",
  },
  {
    id: "iam",
    technique: "T1078.004",
    name: "AWS IAM",
    badge: "4.5h Ingestion Lag",
    badgeClass: "bg-slate-100 text-amber-800",
    kind: "lag",
    baseline: [0.2, 0.25, 0.2, 0.3, 0.2, 0.25, 0.2],
    actual: [0.3, 0.2, 0.35, 0.4, 1.6, 3.2, 4.5],
    spread: 0.2,
    domain: { min: 0, max: 6 },
    ticks: [0, 4.5],
    tickUnit: "hours",
    eventAt: 3.55,
    eventColor: "#d97706",
    zoneLabel: "4.5h behind real time",
    eventLabel: "Expired Cribl S3 STS session policy",
    endLabel: "4.5h",
    aria: "AWS IAM telemetry arrival trails real time by 4.5 hours after the Cribl S3 STS session policy expired.",
  },
]

export function isHorizonRule(id) {
  return HORIZONS.some((item) => item.id === id)
}

function yFor(value, domain) {
  const span = domain.max - domain.min || 1
  const inner = PLOT_H - PLOT_PAD.t - PLOT_PAD.b
  return PLOT_PAD.t + (1 - (value - domain.min) / span) * inner
}

function xAt(t, points) {
  const index = Math.max(0, Math.min(points.length - 1, t))
  const lower = Math.floor(index)
  const upper = Math.min(points.length - 1, lower + 1)
  const fraction = index - lower
  return points[lower].x + (points[upper].x - points[lower].x) * fraction
}

function bandPath(values, spread, domain) {
  const upper = seriesPoints(values.map((value) => value + spread), PLOT_W, PLOT_H, PLOT_PAD, domain)
  const lower = seriesPoints(values.map((value) => Math.max(domain.min, value - spread)), PLOT_W, PLOT_H, PLOT_PAD, domain)
  let path = `M ${upper[0].x.toFixed(2)} ${upper[0].y.toFixed(2)}`
  for (let index = 1; index < upper.length; index += 1) path += ` L ${upper[index].x.toFixed(2)} ${upper[index].y.toFixed(2)}`
  for (let index = lower.length - 1; index >= 0; index -= 1) path += ` L ${lower[index].x.toFixed(2)} ${lower[index].y.toFixed(2)}`
  return `${path} Z`
}

function stepPath(points) {
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let index = 1; index < points.length; index += 1) {
    path += ` H ${points[index].x.toFixed(2)} V ${points[index].y.toFixed(2)}`
  }
  return path
}

function tickText(value, unit) {
  if (unit === "hours") return `${value}h`
  return value >= 1000 ? value.toLocaleString("en-US") : String(value)
}

function HorizonPlot({ scenario }) {
  const domain = scenario.domain
  const signal = scenario.kind === "webhook" ? scenario.matches : scenario.actual
  const signalPoints = seriesPoints(signal, PLOT_W, PLOT_H, PLOT_PAD, domain)
  const baselineValues = scenario.kind === "webhook" ? scenario.matches : scenario.baseline
  const baselinePoints = seriesPoints(baselineValues, PLOT_W, PLOT_H, PLOT_PAD, domain)
  const eventX = xAt(scenario.eventAt, signalPoints)
  const plotBottom = PLOT_H - PLOT_PAD.b
  const plotTop = PLOT_PAD.t
  const zoneWidth = PLOT_W - PLOT_PAD.r - eventX
  const last = signalPoints[signalPoints.length - 1]
  const lastValue = signal[signal.length - 1]
  const lastYPct = (yFor(lastValue, domain) / PLOT_H) * 100

  return (
    <div className="relative mt-3 min-h-[180px] w-full flex-1">
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none" role="img" aria-label={scenario.aria}>
        {scenario.ticks.map((tick) => (
          <line key={tick} x1={PLOT_PAD.l} x2={PLOT_W - PLOT_PAD.r} y1={yFor(tick, domain)} y2={yFor(tick, domain)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {scenario.kind !== "webhook" ? <path d={bandPath(scenario.baseline, scenario.spread, domain)} fill="#94a3b8" fillOpacity="0.16" /> : null}
        {scenario.kind !== "webhook" ? <path d={smoothPath(baselinePoints)} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" /> : null}
        {scenario.kind === "series" ? (
          <rect x={eventX} y={plotTop} width={Math.max(zoneWidth, 0)} height={plotBottom - plotTop} fill={scenario.eventColor} fillOpacity="0.1" />
        ) : null}
        {scenario.kind === "lag" ? <path d={lagGap(scenario)} fill={scenario.eventColor} fillOpacity="0.14" /> : null}
        {scenario.kind === "webhook" ? <path d={stepPath(seriesPoints(scenario.webhooks, PLOT_W, PLOT_H, PLOT_PAD, domain))} fill="none" stroke="#f43f5e" strokeWidth="2.5" /> : null}
        {scenario.kind === "webhook"
          ? signal.map((value, index) => {
              const previous = index === 0 ? 0 : signal[index - 1]
              if (value === previous) return null
              const point = signalPoints[index]
              const barWidth = 36
              return <rect key={HORIZON_DAYS[index]} x={point.x - barWidth / 2} y={point.y} width={barWidth} height={Math.max(plotBottom - point.y, 0)} rx="3" fill="#6366f1" fillOpacity="0.2" />
            })
          : null}
        <path d={scenario.kind === "webhook" ? stepPath(signalPoints) : smoothPath(signalPoints)} fill="none" stroke="#6366f1" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={eventX} x2={eventX} y1={plotTop} y2={plotBottom} stroke={scenario.eventColor} strokeWidth="1.25" strokeDasharray="4 4" />
        <circle cx={last.x} cy={last.y} r="5.5" fill="#fff" />
        <circle cx={last.x} cy={last.y} r="3.5" fill={scenario.eventColor} />
      </svg>
      <div className="pointer-events-none absolute inset-0">
        {scenario.ticks.map((tick) => (
          <span key={tick} className="absolute left-0 w-max -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-slate-400" style={{ top: `${(yFor(tick, domain) / PLOT_H) * 100}%` }}>
            {tickText(tick, scenario.tickUnit)}
          </span>
        ))}
        {HORIZON_DAYS.map((day, index) => (
          <span key={day} className="absolute bottom-0 w-max -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400" style={{ left: `${(signalPoints[index].x / PLOT_W) * 100}%` }}>
            {day}
          </span>
        ))}
        <span
          className="absolute w-max max-w-[240px] text-right text-[10px] font-medium leading-snug"
          style={{ left: `${(eventX / PLOT_W) * 100}%`, top: "8%", transform: "translateX(-108%)", color: scenario.eventColor }}
        >
          {scenario.eventLabel}
        </span>
        {scenario.zoneLabel ? (
          <span
            className="absolute w-max whitespace-nowrap text-[10px] font-semibold"
            style={
              zoneWidth / PLOT_W > 0.22
                ? { left: `${((eventX + (PLOT_W - PLOT_PAD.r)) / 2 / PLOT_W) * 100}%`, top: "42%", transform: "translateX(-50%)", color: scenario.eventColor }
                : { left: `${(eventX / PLOT_W) * 100}%`, top: "58%", transform: "translateX(-108%)", color: scenario.eventColor }
            }
          >
            {scenario.zoneLabel}
          </span>
        ) : null}
        {scenario.endLabel ? (
          <span className="absolute w-max whitespace-nowrap text-[11px] font-semibold" style={{ left: `${(last.x / PLOT_W) * 100}%`, top: `${lastYPct}%`, transform: lastYPct < 20 ? "translate(-110%, 8px)" : "translate(-110%, -140%)", color: scenario.eventColor }}>
            {scenario.endLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function lagGap(scenario) {
  const actual = seriesPoints(scenario.actual, PLOT_W, PLOT_H, PLOT_PAD, scenario.domain)
  const baseline = seriesPoints(scenario.baseline, PLOT_W, PLOT_H, PLOT_PAD, scenario.domain)
  const from = 4
  const start = xAt(scenario.eventAt, actual)
  let path = `M ${start.toFixed(2)} ${baseline[from].y.toFixed(2)}`
  for (let index = from; index < actual.length; index += 1) path += ` L ${actual[index].x.toFixed(2)} ${actual[index].y.toFixed(2)}`
  for (let index = baseline.length - 1; index >= from; index -= 1) path += ` L ${baseline[index].x.toFixed(2)} ${baseline[index].y.toFixed(2)}`
  return `${path} Z`
}

function horizonImpacted(stage, patched) {
  return RULES.filter((rule) => rule.degraded && !patched[rule.id] && rule.nodes.some((id) => stage.nodes.includes(id))).length
}

export function DriftHorizon({ activeId, onSelect, stages, stageId, patched, onStage }) {
  const scenario = HORIZONS.find((item) => item.id === activeId) || HORIZONS[0]
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm @min-[860px]:col-span-2">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Detection Signal Fidelity & Drift Horizon (7d)</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Real-time telemetry match volume vs. expected baseline corridor across active contract breaks</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true">---</span> Expected Baseline Band</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true">—</span> Actual Production Signal</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true">●</span> Upstream Mutation Event</span>
        </div>
      </div>
      <div className="mt-3 flex shrink-0 flex-wrap gap-2">
        {HORIZONS.map((item) => {
          const selected = item.id === scenario.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(item.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-left transition ${selected ? "border-indigo-300 bg-indigo-50/80" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}
            >
              <span className="text-[12px] font-medium text-slate-800">
                <span className="font-mono text-[11px] text-slate-500">{item.technique}</span>
                {` • ${item.name}`}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.badgeClass}`}>{item.badge}</span>
            </button>
          )
        })}
      </div>
      <HorizonPlot key={scenario.id} scenario={scenario} />
      <div className="mt-4 grid shrink-0 grid-cols-4 gap-2 border-t border-slate-100 pt-4">
        {stages.map((stage) => {
          const selected = stageId === stage.id
          const impacted = horizonImpacted(stage, patched)
          return (
            <button
              key={stage.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onStage(stage.id)}
              className={`flex min-w-0 items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border px-2 py-2 text-[11px] tracking-tight transition hover:border-indigo-300 hover:bg-slate-50/60 ${selected ? "border-indigo-300 bg-indigo-50/70" : "border-slate-200 bg-white"}`}
            >
              <span className="font-medium text-slate-800">
                <span className="font-mono text-[11px] font-medium text-slate-400">{stage.index} // </span>
                {stage.short}
              </span>
              <span className="font-medium text-indigo-600">{impacted} {impacted === 1 ? "rule" : "rules"} →</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const COVERAGE = [
  { id: "verified", label: "Verified Active", note: "Healthy schema & baseline", count: 172, share: 0.75, color: "#10B981" },
  { id: "authorable", label: "Authorable Gaps", note: "Live telemetry fields 100% verified in lake", count: 28, share: 0.12, color: "#4F46E5" },
  { id: "blocked", label: "Telemetry Blocked", note: "Missing OS/Cloud audit policy", count: 18, share: 0.08, color: "#F59E0B" },
  { id: "broken", label: "Contract Broken", note: "Silent schema drift / SOAR fail", count: 12, share: 0.05, color: "#EF4444" },
]

const SIGNAL_DAYS = [
  ["Oct 21", 44, 7, 0],
  ["Oct 22", 46, 6, 0],
  ["Oct 23", 43, 8, 0],
  ["Oct 24", 45, 5, 0],
  ["Oct 25", 47, 7, 0],
  ["Oct 26", 44, 6, 0],
  ["Oct 27", 42, 8, 0],
  ["Oct 28", 46, 6, 0],
  ["Oct 29", 45, 7, 0],
  ["Oct 30", 43, 8, 0],
  ["Oct 31", 40, 148, 0],
  ["Nov 1", 18, 156, 1],
  ["Nov 2", 6, 164, 1],
  ["Nov 3", 0, 172, 1],
].map(([date, verified, fp, blind], index) => ({
  date,
  verified,
  fp,
  blind,
  spike: index >= 10,
  drop: index >= 11,
}))

const RING_R = 58
const RING_C = 2 * Math.PI * RING_R

function CoverageDonut({ onAuthor }) {
  const [hover, setHover] = useState("")
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  let cursor = 0
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="Live telemetry coverage audit. 74.8 percent verified, 172 of 230 rules.">
          <circle cx="80" cy="80" r={RING_R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {COVERAGE.map((segment) => {
            const length = segment.share * RING_C
            const draw = Math.max(length - 4, 0)
            const dash = drawn ? `${draw} ${RING_C - draw}` : `0 ${RING_C}`
            const offset = cursor
            cursor += length
            const hot = segment.id === "authorable"
            return (
              <circle
                key={segment.id}
                cx="80"
                cy="80"
                r={RING_R}
                fill="none"
                stroke={segment.color}
                strokeWidth={hover === segment.id ? 16 : 12}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                className={`transition-all duration-500 ${hot ? "cursor-pointer" : ""}`}
                onMouseEnter={() => setHover(segment.id)}
                onMouseLeave={() => setHover("")}
                onClick={hot ? onAuthor : undefined}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-mono text-[22px] font-semibold leading-none tracking-tight text-slate-900">74.8%</p>
          <p className="mt-1 text-[10px] font-medium text-slate-400">verified</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-slate-400">172 / 230 rules</p>
        <ul className="mt-2.5 space-y-0.5">
          {COVERAGE.map((segment) => {
            const hot = segment.id === "authorable"
            const className = `flex w-52 items-center justify-between gap-6 rounded-lg px-2 py-1 -mx-2 text-left transition ${hover === segment.id ? "bg-slate-50" : ""} ${hot ? "group cursor-pointer hover:bg-indigo-50/80" : ""}`
            const body = (
              <>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="whitespace-nowrap text-[12px] font-medium text-slate-700">{segment.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {hot ? <span className="text-[10px] font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">Synthesize →</span> : null}
                  <span className="font-mono text-[12px] font-semibold tabular-nums text-slate-900">{segment.count}</span>
                </span>
              </>
            )
            return (
              <li key={segment.id} onMouseEnter={() => setHover(segment.id)} onMouseLeave={() => setHover("")}>
                {hot ? (
                  <button type="button" onClick={onAuthor} className={className}>
                    {body}
                  </button>
                ) : (
                  <div className={className}>{body}</div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-1.5 h-4 truncate px-1.5 text-[10px] text-slate-400">
          {(COVERAGE.find((segment) => segment.id === hover) ?? COVERAGE[0]).note}
        </p>
      </div>
    </div>
  )
}

function SignalHistogram() {
  const [hover, setHover] = useState(-1)
  const active = hover >= 0 ? SIGNAL_DAYS[hover] : null
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"><span className="size-1.5 rounded-full bg-indigo-500" /> Verified</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"><span className="size-1.5 rounded-full bg-amber-400" /> FP under target</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"><span className="size-1.5 rounded-full" style={{ backgroundColor: "#fbbf24", backgroundImage: "repeating-linear-gradient(-45deg, #ea580c 0 1.5px, transparent 1.5px 3px)" }} /> Suppressed storm</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" /> AI target −74%</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"><span className="size-1.5 rounded-full bg-rose-500" /> Blind spot</span>
      </div>
      <div className="relative mt-3 h-32">
        {active ? (
          <p className="pointer-events-none absolute top-0 left-0 z-20">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 font-mono text-[10px] text-white">
              {active.date} · {active.verified} verified · {active.fp} suppressed FPs · {active.blind} blind
            </span>
          </p>
        ) : null}
        <div className="pointer-events-none absolute right-0 left-[68%] z-10 border-t border-dashed border-emerald-500" style={{ bottom: "50%" }} />
        <div className="flex h-full items-end justify-between gap-1.5 border-b border-slate-200">
          {SIGNAL_DAYS.map((day, index) => (
            <button
              key={day.date}
              type="button"
              className="flex h-full min-w-0 flex-1 items-end justify-center"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(-1)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(-1)}
              aria-label={`${day.date}. Verified hits ${day.verified}. Suppressed FPs ${day.fp}. Blind rules ${day.blind}.`}
            >
              <span className="flex h-full w-2.5 flex-col justify-end overflow-hidden rounded-t-full">
                {day.spike ? (
                  <span className="block w-full" style={{ height: "46%", backgroundColor: "#fbbf24", backgroundImage: "repeating-linear-gradient(-45deg, #ea580c 0 2px, transparent 2px 5px)" }} />
                ) : null}
                <span className="block w-full bg-amber-400" style={{ height: "8%" }} />
                <span className="block w-full bg-indigo-500" style={{ height: "42%" }} />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex h-5 items-start justify-between gap-1.5">
        {SIGNAL_DAYS.map((day) => (
          <div key={day.date} className="flex min-w-0 flex-1 justify-center">
            {day.drop ? <span className="block h-4 w-2.5 rounded-b-full bg-rose-500" /> : null}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-1.5">
        {SIGNAL_DAYS.map((day) => (
          <span key={day.date} className="min-w-0 flex-1 text-center font-mono text-[9px] leading-tight text-slate-400">{day.date.replace("Oct ", "").replace("Nov ", "")}</span>
        ))}
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[9px] text-slate-300">
        <span>Oct</span>
        <span>Nov</span>
      </div>
    </div>
  )
}

export function SignalHorizon({ onAuthor }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm @min-[860px]:col-span-2">
      <div className="grid min-h-0 flex-1 items-start gap-5 @min-[860px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Telemetry Coverage Readiness</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Live schema audit of verified rules, authorable gaps, and broken contracts.</p>
          <div className="mt-3">
            <CoverageDonut onAuthor={onAuthor} />
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pr-1 @min-[860px]:border-l @min-[860px]:border-slate-100 @min-[860px]:pl-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Signal Horizon</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">14-day fidelity against alert-storm volume, suppressed false positives, and silent drops.</p>
          <div className="mt-3 min-w-0 flex-1">
            <SignalHistogram />
          </div>
        </div>
      </div>
    </section>
  )
}
