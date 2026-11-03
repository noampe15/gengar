import MetricDelta from "./MetricDelta"
import OutcomeBar from "./OutcomeBar"
import InfoTooltip from "./InfoTooltip"

const STATS = [
  ["Attempted", "attempted", ""],
  ["Succeeded", "succeeded", "Fixed"],
  ["Rolled back", "rolledBack", "Rolled back"],
  ["Escalated", "escalated", "Escalated"],
]

const HUMAN_LINKS = [
  ["approved", "approved", "Approved fix"],
  ["rejected", "rejected", "Rejected fix"],
  ["manualFix", "manual fix", "Manual remediation"],
]

export default function TenantAutonomy({ autonomy, onOpenHistory }) {
  const a = autonomy
  const h = a.human ?? { approved: 0, rejected: 0, manualFix: 0, dismissed: 0, reviewed: 0, overrideNumerator: 0, overrideRate: 0 }
  return (
    <section className="flex h-full min-h-[22rem] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-900">Autonomy for this tenant</h2>
        <p className="mt-0.5 text-[12px] text-slate-600">{a.periodLabel ?? "Last 7 days"} · vs. {a.portfolioAvg}% portfolio average</p>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <p className="text-[32px] font-semibold leading-none tracking-tight text-slate-900">{a.rate}%</p>
        <MetricDelta pts={a.deltaPts} label={a.priorLabel} />
      </div>
      <p className="mt-2 text-[13px] text-slate-600">
        {a.succeeded} of {a.attempted} actions auto-reconciled
      </p>
      <div className="mt-4">
        <OutcomeBar succeeded={a.succeeded} rolledBack={a.rolledBack} escalated={a.escalated} />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
        Human decisions this week:{" "}
        {HUMAN_LINKS.map(([key, label, event], i) => (
          <span key={key}>
            {i > 0 ? (i === HUMAN_LINKS.length - 1 ? ", " : ", ") : null}
            <button
              type="button"
              onClick={() => onOpenHistory?.({ actor: "Human", event, outcome: "" })}
              className="font-semibold text-[#6d5cff] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              {h[key]} {label}
            </button>
            {i === HUMAN_LINKS.length - 1 ? "." : null}
          </span>
        ))}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        {STATS.map(([label, key, outcome]) => (
          <div key={key}>
            <dt className="text-[12px] text-slate-600">{label}</dt>
            <dd>
              <button
                type="button"
                onClick={() => onOpenHistory?.({ actor: "AI", outcome, event: "" })}
                className="text-[14px] font-semibold text-[#6d5cff] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                aria-label={`View ${label.toLowerCase()} AI actions in the activity log`}
              >
                {a[key].toLocaleString()}
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center gap-1 text-[12.5px] text-slate-700">
        <span>
          Human override rate{" "}
          <span className="font-semibold text-slate-900">{h.overrideRate}%</span>
        </span>
        <InfoTooltip label="How human override rate is calculated">
          Rejected + manually changed fixes divided by fixes reviewed. {h.overrideNumerator} of {h.reviewed} = {h.overrideRate}%.
          Human totals are never added to AI autonomy.
        </InfoTooltip>
      </div>
      <div className="mt-auto pt-4">
        {a.insight ? (
          <p className="rounded-xl border border-[#ece8ff] bg-[#faf9ff] px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-700">
            {a.insight}
          </p>
        ) : (
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-600">
            No rollbacks in this period.
          </p>
        )}
      </div>
    </section>
  )
}
