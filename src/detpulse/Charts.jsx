import { useId } from "react"
import { MATRIX, VOLUME_ACTUAL, VOLUME_DAYS, VOLUME_EXPECTED } from "./model"
import { usePulse } from "./PulseContext"
import { Card, areaPath, seriesPoints, smoothPath } from "./ui"

const W = 640
const H = 168

export function VolumeChart() {
  const rawId = useId().replace(/:/g, "")
  const domain = { min: 0, max: Math.max(...VOLUME_EXPECTED, ...VOLUME_ACTUAL, 1) }
  const expected = seriesPoints(VOLUME_EXPECTED, W, H, { t: 12, r: 8, b: 8, l: 8 }, domain)
  const actual = seriesPoints(VOLUME_ACTUAL, W, H, { t: 12, r: 8, b: 8, l: 8 }, domain)
  const zero = actual[actual.length - 1]

  return (
    <Card className="p-4">
      <h2 className="text-[14px] font-semibold text-slate-900">Silent Failure Horizon: Expected vs. Actual Match Volume - 7d</h2>
      <p className="mt-1 font-mono text-[26px] font-semibold tracking-tight text-slate-900">0 hits</p>
      <p className="text-[12px] font-medium text-rose-500">▼ Drop to zero · Nov 3 · 02:14 UTC</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-40 w-full" preserveAspectRatio="none" role="img" aria-label="Expected baseline versus actual match volume, dropping to zero on November 3">
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

export function MitreMatrix() {
  const { patched } = usePulse()
  return (
    <Card className="p-4">
      <h2 className="text-[14px] font-semibold text-slate-900">MITRE ATT&CK Resilience Matrix</h2>
      <p className="mt-0.5 text-[12px] text-slate-500">Live telemetry health, not whether the rule is enabled.</p>
      <div className="mt-3 overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-6 gap-2">
          {MATRIX.map((column) => (
            <div key={column.tactic}>
              <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{column.tactic}</p>
              <div className="space-y-1.5">
                {column.cells.map((cell) => {
                  const healed = cell.ruleId && patched[cell.ruleId]
                  const state = healed ? "verified" : cell.base
                  return (
                    <div key={cell.id} className={`rounded-md border px-1.5 py-1 font-mono text-[10px] ${CELL[state]}`}>
                      {cell.id}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
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
