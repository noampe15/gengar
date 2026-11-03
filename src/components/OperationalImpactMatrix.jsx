import { Building2, Headphones, ShoppingCart, Truck, Users } from "lucide-react"
import { ScoreRing, SeverityBadge, severityStyles } from "./Badges"

const unitIcons = {
  cart: ShoppingCart,
  truck: Truck,
  headset: Headphones,
  users: Users,
  building: Building2,
}

export default function OperationalImpactMatrix({ units, range, variant = "unit" }) {
  const isClient = variant === "client"

  return (
    <section className="flex h-[400px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-5 flex shrink-0 items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">
            {isClient ? "Client Impact Matrix" : "Operational Impact Matrix"}
          </h2>
          {isClient && (
            <p className="mt-0.5 text-[12px] text-slate-400">Ranked by systemic risk across the MSP portfolio</p>
          )}
        </div>
        <span className="text-[12px] text-slate-400">{range.replace("Last ", "")}</span>
      </div>
      <ul className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {units.map((unit) => {
          const Icon = unitIcons[unit.icon] ?? Building2
          const style = severityStyles[unit.severity] ?? severityStyles.None
          const up = unit.delta >= 0
          return (
            <li
              key={unit.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)_2.5rem_4.75rem] items-center gap-x-3"
            >
              {isClient ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f1ff] text-[10px] font-semibold text-[#6d5cff]">
                  {unit.initials || <Icon className="h-4 w-4" />}
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-slate-800">{unit.name}</p>
                <p className="mt-0.5 text-[12px] text-slate-400">
                  {isClient ? (
                    <>
                      {unit.resources} resources
                      {typeof unit.findings === "number" ? ` · ${unit.findings} findings` : ""}{" "}
                    </>
                  ) : (
                    <>
                      RTO {unit.rto} · {unit.resources} resources{" "}
                    </>
                  )}
                  <span className={up ? "text-[#e11d48]" : "text-[#16a34a]"}>
                    {up ? "↗" : "↘"} {up ? "+" : ""}
                    {unit.delta.toFixed(1)} pts (7d)
                  </span>
                </p>
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{ width: `${unit.score}%` }}
                  />
                </div>
              </div>
              <ScoreRing score={unit.score} />
              <span className="justify-self-end">
                <SeverityBadge severity={unit.severity} />
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
