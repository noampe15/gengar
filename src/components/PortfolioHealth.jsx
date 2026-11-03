import { useMemo, useState } from "react"
import { healthForRange, mspTenants } from "../mspDashboard"
import MetricDelta from "./MetricDelta"
import TenantHoverList from "./TenantHoverList"

const buckets = [
  { key: "secure", label: "Secure", color: "#12B76A", tone: "text-emerald-800", bg: "bg-emerald-50" },
  { key: "warning", label: "SLA Warnings", color: "#F79009", tone: "text-amber-800", bg: "bg-orange-50" },
  { key: "critical", label: "Critical Risk", color: "#F04438", tone: "text-rose-800", bg: "bg-rose-50" },
]

function pctOf(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function arcPath(cx, cy, r, start, end) {
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const large = end - start > Math.PI ? 1 : 0
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

function slicesFromCounts(counts) {
  const total = Math.max(1, counts.secure + counts.warning + counts.critical)
  const gap = 0.055
  let cursor = -Math.PI / 2
  return buckets.map((bucket) => {
    const value = counts[bucket.key] ?? 0
    const sweep = (value / total) * Math.PI * 2
    const pad = sweep > gap * 3 ? gap : 0
    const start = cursor + pad / 2
    const end = cursor + sweep - pad / 2
    cursor += sweep
    return { ...bucket, value, pct: pctOf(value, total), start, end, sweep }
  })
}

function Donut({ counts, hoverKey, onHover, onOpenStatus }) {
  const total = counts.secure + counts.warning + counts.critical
  const size = 148
  const stroke = 18
  const cx = size / 2
  const cy = size / 2
  const r = (size - stroke) / 2 - 4
  const slices = slicesFromCounts(counts)
  const label = slices.map((s) => `${s.value} ${s.label} (${s.pct}%)`).join(", ")

  return (
    <div className="relative mx-auto h-[148px] w-[148px] shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${total} tenants: ${label}`}
        className="overflow-visible"
      >
        <defs>
          <filter id="donut-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF0F4" strokeWidth={stroke} />
        <g filter="url(#donut-soft)">
          {slices.map((slice) => {
            if (slice.sweep <= 0.001) return null
            const active = !hoverKey || hoverKey === slice.key
            return (
              <path
                key={slice.key}
                d={arcPath(cx, cy, r, slice.start, slice.end)}
                fill="none"
                stroke={slice.color}
                strokeWidth={hoverKey === slice.key ? stroke + 3 : stroke}
                strokeLinecap="butt"
                className="cursor-pointer transition-[stroke-width] duration-150"
                opacity={active ? 1 : 0.28}
                onMouseEnter={() => onHover?.(slice.key)}
                onMouseLeave={() => onHover?.(null)}
                onClick={() => onOpenStatus?.(slice.key)}
              >
                <title>{`${slice.label}: ${slice.value} tenants, ${slice.pct}%`}</title>
              </path>
            )
          })}
        </g>
        <circle cx={cx} cy={cy} r={r - stroke / 2 - 6} fill="#ffffff" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[26px] font-semibold leading-none tracking-tight text-slate-900">{total}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tenants</p>
      </div>
    </div>
  )
}

export default function PortfolioHealth({ range, onOpenStatus, onOpenTenant }) {
  const health = healthForRange(range)
  const deltas = health.deltas
  const [hoverKey, setHoverKey] = useState(null)
  const byHealth = useMemo(() => {
    const groups = { secure: [], warning: [], critical: [] }
    for (const tenant of mspTenants) {
      if (groups[tenant.health]) groups[tenant.health].push(tenant)
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.name.localeCompare(b.name))
    }
    return groups
  }, [])
  const counts = useMemo(
    () => ({
      secure: byHealth.secure.length,
      warning: byHealth.warning.length,
      critical: byHealth.critical.length,
    }),
    [byHealth],
  )
  const total = Math.max(1, counts.secure + counts.warning + counts.critical)

  return (
    <section
      className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-slate-900">Portfolio health distribution</h2>
        <p className="mt-0.5 text-[12px] text-slate-500">Tenants aggregated by systemic exposure</p>
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <Donut counts={counts} hoverKey={hoverKey} onHover={setHoverKey} onOpenStatus={onOpenStatus} />
        <ul className="grid w-full flex-1 grid-cols-[minmax(0,1fr)_2.25rem_2.5rem_max-content] gap-x-3 gap-y-2">
          {buckets.map((bucket) => {
            const tenants = byHealth[bucket.key] ?? []
            const popupId = `health-tenants-${bucket.key}`
            const value = counts[bucket.key]
            const pct = pctOf(value, total)
            const dimmed = hoverKey && hoverKey !== bucket.key
            return (
              <li
                key={bucket.key}
                className="col-span-4 grid grid-cols-subgrid group relative z-0 hover:z-[90] focus-within:z-[90]"
                onMouseEnter={() => setHoverKey(bucket.key)}
                onMouseLeave={() => setHoverKey(null)}
              >
                <button
                  type="button"
                  onClick={() => onOpenStatus?.(bucket.key)}
                  aria-label={`Open Tenants filtered to ${bucket.label}, ${value} tenants, ${pct}%`}
                  aria-controls={popupId}
                  className={`col-span-4 grid grid-cols-subgrid items-center rounded-xl py-2.5 pl-3 pr-3 text-left outline-none transition-opacity hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${bucket.bg} ${dimmed ? "opacity-45" : "opacity-100"}`}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-700">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucket.color }} aria-hidden="true" />
                    <span className="truncate">{bucket.label}</span>
                  </span>
                  <span className={`w-full whitespace-nowrap text-right text-[18px] font-semibold leading-none tabular-nums ${bucket.tone}`}>
                    {value}
                  </span>
                  <span className="w-full whitespace-nowrap text-right text-[12px] font-semibold tabular-nums text-slate-500">{pct}%</span>
                  <span className="justify-self-end whitespace-nowrap">
                    {deltas[bucket.key] !== 0 ? (
                      <MetricDelta pts={deltas[bucket.key]} label={health.priorLabel} />
                    ) : (
                      <span className="text-[12px] font-medium text-slate-500">unchanged {health.priorLabel}</span>
                    )}
                  </span>
                </button>
                <div
                  id={popupId}
                  role="region"
                  aria-label={`${bucket.label} tenants`}
                  className="pointer-events-none invisible absolute left-0 right-0 top-full z-[80] pt-1 opacity-0 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                >
                  <TenantHoverList tenants={tenants} label={bucket.label} onOpenTenant={onOpenTenant} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
