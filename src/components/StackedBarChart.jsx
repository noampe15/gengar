import { useState } from "react"
import { QUEUE_AI_STATUSES } from "../mspDashboard"

const SEGMENTS = [
  { key: "AI fixing", fill: "#6d5cff", legend: "bg-[#6d5cff]" },
  { key: "Waiting on human", fill: "#F79009", legend: "bg-[#F79009]" },
  { key: "Blocked", fill: "#94A3B8", legend: "bg-slate-400" },
]

export default function StackedBarChart({ buckets, onSegmentClick }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(
    4,
    ...buckets.map((b) => QUEUE_AI_STATUSES.reduce((sum, k) => sum + (b[k] ?? 0), 0)),
  )
  const ticks = Array.from({ length: max + 1 }, (_, i) => i)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="mb-3 flex flex-wrap gap-3 text-[12px] text-slate-600">
        {SEGMENTS.map((seg) => (
          <li key={seg.key} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${seg.legend}`} aria-hidden="true" />
            {seg.key}
          </li>
        ))}
      </ul>
      <div className="relative flex min-h-[180px] flex-1">
        <div className="flex w-6 flex-col-reverse justify-between pr-1 text-[10px] tabular-nums text-slate-400" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col-reverse justify-between pb-6 pt-5" aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="border-t border-[#EEF0F6]" />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-around gap-3 px-2 pb-6 pt-5">
            {buckets.map((bucket) => {
              const total = QUEUE_AI_STATUSES.reduce((sum, k) => sum + (bucket[k] ?? 0), 0)
              return (
                <div key={bucket.label} className="flex h-full w-full max-w-[80px] flex-col items-center justify-end">
                  <span className="mb-1.5 text-[11px] font-semibold tabular-nums text-slate-700">{total}</span>
                  <div className="flex h-full w-11 flex-col-reverse gap-[3px]">
                    {SEGMENTS.map((seg) => {
                      const n = bucket[seg.key] ?? 0
                      if (!n) return null
                      const pct = max ? (n / max) * 100 : 0
                      const active = hover?.label === bucket.label && hover?.status === seg.key
                      return (
                        <button
                          key={seg.key}
                          type="button"
                          aria-label={`${n} ${seg.key} in ${bucket.label}`}
                          onMouseEnter={() => setHover({ label: bucket.label, status: seg.key, n })}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover({ label: bucket.label, status: seg.key, n })}
                          onBlur={() => setHover(null)}
                          onClick={() => onSegmentClick?.({ age: bucket.label, status: seg.key })}
                          className="w-full rounded-lg outline-none transition-[filter,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[#6d5cff] focus-visible:ring-offset-1"
                          style={{
                            height: `${pct}%`,
                            minHeight: n ? 8 : 0,
                            background: seg.fill,
                            filter: active ? "brightness(1.08)" : undefined,
                            boxShadow: active ? "0 4px 12px rgba(109,92,255,0.18)" : "none",
                          }}
                        />
                      )
                    })}
                  </div>
                  <span className="mt-1.5 text-center text-[11px] leading-tight text-slate-500">{bucket.label}</span>
                </div>
              )
            })}
          </div>
          {hover && (
            <div className="pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 rounded-xl border border-[#ece8ff] bg-white/95 px-2.5 py-1.5 text-[11px] text-slate-600 shadow-[0_8px_24px_rgba(109,92,255,0.12)] backdrop-blur-sm">
              <span className="font-semibold text-slate-900">{hover.n}</span> {hover.status}
              <span className="mt-0.5 block text-slate-500">{hover.label}</span>
            </div>
          )}
        </div>
      </div>
      <table className="sr-only">
        <caption>Open issues by wait age and AI status</caption>
        <thead>
          <tr>
            <th>Age</th>
            {SEGMENTS.map((s) => (
              <th key={s.key}>{s.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <tr key={bucket.label}>
              <td>{bucket.label}</td>
              {SEGMENTS.map((s) => (
                <td key={s.key}>{bucket[s.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
