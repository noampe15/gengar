import { useMemo, useState } from "react"

const colors = {
  Critical: "#e11d48",
  High: "#f97316",
  Medium: "#ca8a04",
  Low: "#a3a31c",
}

const patterns = {
  Critical: "none",
  High: "repeating-linear-gradient(90deg,#f97316 0 5px,#fdba74 5px 8px)",
  Medium: "repeating-linear-gradient(-45deg,#ca8a04 0 3px,#fde047 3px 6px)",
  Low: "repeating-linear-gradient(0deg,#a3a31c 0 2px,#e4e48a 2px 4px)",
}

const patternLabel = {
  Critical: "solid",
  High: "striped",
  Medium: "hatched",
  Low: "fine bars",
}

export default function InfrastructureDeficit({
  rows,
  aggregated = false,
  variant = "full",
  onSelectCategory,
  activeCategory,
}) {
  const [tip, setTip] = useState(null)
  const max = useMemo(
    () => Math.max(1, ...rows.map((r) => Object.values(r.segments).reduce((a, b) => a + b, 0))),
    [rows],
  )
  const systemic = variant === "systemic"

  return (
    <section
      className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        systemic ? "min-h-0" : "h-[400px]"
      }`}
    >
      <div className="mb-5 shrink-0">
        <h2 className="text-[16px] font-semibold text-slate-900">
          {systemic ? "Systemic Deficit Matrix" : "Infrastructure Deficit Distribution"}
        </h2>
        {aggregated && (
          <p className="mt-0.5 text-[12px] text-slate-500">
            {systemic
              ? "Aggregated cross-tenant vulnerability categories. Click a row to filter the queue."
              : "Aggregated vulnerabilities across the MSP client portfolio"}
          </p>
        )}
      </div>
      <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {rows.map((row) => {
          const active = activeCategory === row.name
          const interactive = typeof onSelectCategory === "function"
          const Row = interactive ? "button" : "div"
          return (
            <li key={row.name}>
              <Row
                type={interactive ? "button" : undefined}
                onClick={interactive ? () => onSelectCategory(active ? "" : row.name) : undefined}
                className={`grid w-full grid-cols-[110px_1fr_88px] items-center gap-3 rounded-lg px-1 py-1 text-left sm:grid-cols-[140px_1fr_96px] ${
                  interactive ? "outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]" : ""
                } ${active ? "bg-[#f7f6ff]" : interactive ? "hover:bg-slate-50" : ""}`}
                aria-pressed={interactive ? active : undefined}
              >
                <p className="truncate text-[13px] text-slate-600">{row.name}</p>
                <div className="min-w-0">
                  <div
                    className="flex h-2.5 overflow-hidden rounded-full bg-slate-100"
                    style={{ width: `${55 + (row.count / max) * 45}%` }}
                  >
                    {Object.entries(row.segments).map(([key, value]) => (
                      <div
                        key={key}
                        role="img"
                        aria-label={`${key}: ${value} (${Math.round((value / row.count) * 100)}%)`}
                        className="relative h-full"
                        style={{
                          flexGrow: value,
                          flexBasis: 0,
                          background: patterns[key] === "none" ? colors[key] : patterns[key],
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTip({
                            key,
                            value,
                            pct: Math.round((value / row.count) * 100),
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          })
                        }}
                        onMouseLeave={() => setTip(null)}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-right text-[12px] text-slate-500">{row.count} resources</p>
              </Row>
            </li>
          )
        })}
      </ul>
      <div className="mt-5 flex shrink-0 flex-wrap gap-3 text-[11px] text-slate-600">
        {Object.entries(colors).map(([key, color]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-6 rounded-sm"
              style={{ background: patterns[key] === "none" ? color : patterns[key] }}
              aria-hidden="true"
            />
            {key}
            <span className="text-slate-500">({patternLabel[key]})</span>
          </span>
        ))}
      </div>
      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-700 shadow"
          style={{ left: tip.x, top: tip.y - 8 }}
        >
          {tip.key}: {tip.value} resources ({tip.pct}%)
        </div>
      )}
    </section>
  )
}
