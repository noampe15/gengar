import { CheckCircle2, ShieldAlert, Sparkles, UserRound } from "lucide-react"
import { formatSlaPct, slaForRange } from "../mspDashboard"
import MetricDelta from "./MetricDelta"
import Sparkline from "./Sparkline"

function GoalBadge({ belowGoal }) {
  if (belowGoal) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800">
        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
        Below goal
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      Meeting goal
    </span>
  )
}

function PathChip({ icon: Icon, label, value, tone }) {
  const tones = {
    ai: {
      wrap: "border-[#c4b8ff] bg-[#f3f1ff]",
      icon: "bg-[#6d5cff] text-white",
      label: "text-[#4c3fd4]",
    },
    human: {
      wrap: "border-slate-200 bg-slate-50",
      icon: "bg-slate-200 text-slate-700",
      label: "text-slate-600",
    },
  }
  const t = tones[tone]
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2 py-1.5 ${t.wrap}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${t.icon}`} aria-hidden="true">
        <Icon className="h-3 w-3" />
      </span>
      <p className="flex min-w-0 items-baseline gap-1.5 text-[12px] leading-tight">
        <span className={`shrink-0 font-semibold ${t.label}`}>{label}</span>
        <span className="shrink-0 tabular-nums text-slate-900">median {value}</span>
      </p>
    </div>
  )
}

export default function SlaPerformance({ range, tenantId, onOpenBreaches }) {
  const sla = slaForRange(range, tenantId)
  const first = sla.sparkline?.[0]?.pct
  const last = sla.sparkline?.[sla.sparkline.length - 1]?.pct
  const trend =
    first == null || last == null
      ? "SLA met percent over the period"
      : last >= first
        ? `SLA met rose from ${formatSlaPct(first)}% to ${formatSlaPct(last)}%`
        : `SLA met fell from ${formatSlaPct(first)}% to ${formatSlaPct(last)}%`

  return (
    <section
      className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">SLA performance</h2>
          <p className="text-[12px] text-slate-500">Are we meeting remediation targets?</p>
        </div>
        {sla.breaches > 0 && (
          <button
            type="button"
            onClick={onOpenBreaches}
            className="shrink-0 pt-0.5 text-[12.5px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            {sla.breaches} SLA {sla.breaches === 1 ? "breach" : "breaches"} this period
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)] sm:items-start">
        <div className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-medium text-slate-500">
                  <th scope="col" className="pb-1.5 font-medium">
                    Priority
                  </th>
                  <th scope="col" className="pb-1.5 font-medium">
                    Target
                  </th>
                  <th scope="col" className="pb-1.5 font-medium">
                    Median time to remediate
                  </th>
                  <th scope="col" className="pb-1.5 font-medium">
                    % met
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {sla.byPriority.map((row) => (
                  <tr key={row.priority} className="border-t border-slate-100">
                    <th scope="row" className="py-1 pr-3 font-semibold text-slate-800">
                      {row.priority}
                    </th>
                    <td className="py-1 pr-3 tabular-nums text-slate-600">{row.target}</td>
                    <td className="py-1 pr-3 tabular-nums text-slate-800">{row.median}</td>
                    <td className="py-1">
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        <span className="tabular-nums font-semibold text-slate-800">{formatSlaPct(row.metPct)}%</span>
                        <GoalBadge belowGoal={row.belowGoal} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex gap-2">
            <PathChip icon={Sparkles} label="AI" value={sla.aiMedian} tone="ai" />
            <PathChip icon={UserRound} label="Human" value={sla.humanMedian} tone="human" />
          </div>
        </div>

        <div className="sm:border-l sm:border-slate-200/80 sm:pl-5">
          <p className="text-[12px] font-medium text-slate-500">SLA met</p>
          <p className="mt-1 text-[32px] font-semibold leading-none tracking-tight text-slate-900">{formatSlaPct(sla.metPct)}%</p>
          <p className="mt-2 text-[12px] text-slate-500">
            <MetricDelta pts={sla.deltaPts} label={sla.priorLabel} />
          </p>
          <div className="mt-2 -ml-1">
            <Sparkline
              series={sla.sparkline}
              valueKey="pct"
              ariaLabel={`${trend} over the ${sla.periodLabel?.toLowerCase() ?? "selected period"}`}
              formatHover={(p) => `${formatSlaPct(p.pct)}% met`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
