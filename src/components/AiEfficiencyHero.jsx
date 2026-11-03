import { efficiencyForRange } from "../mspDashboard"
import InfoTooltip from "./InfoTooltip"
import MetricDelta from "./MetricDelta"
import Sparkline from "./Sparkline"

export default function AiEfficiencyHero({ range, onOpenHistory }) {
  const e = efficiencyForRange(range)
  const humanPct = ((e.rolledBack + e.escalated) / e.attempted) * 100

  return (
    <section
      className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-slate-900">Remediation efficiency</h2>
        <p className="text-[12px] text-slate-500">Autonomous close-out across the portfolio</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)] sm:items-start">
        <div>
          <p className="text-[12px] font-medium text-slate-500">Autonomous Remediation Rate</p>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <p className="text-[32px] font-semibold leading-none tracking-tight text-slate-900">{e.rate}%</p>
            <MetricDelta pts={e.rateDeltaPts} label={e.priorLabel} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] sm:grid-cols-4">
            {[
              ["Attempted", e.attempted, ""],
              ["Succeeded", e.succeeded, "Fixed"],
              ["Rolled back", e.rolledBack, "Rolled back"],
              ["Escalated", e.escalated, "Escalated"],
            ].map(([k, v, outcome]) => (
              <div key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd>
                  <button
                    type="button"
                    onClick={() => onOpenHistory?.(outcome)}
                    className="font-semibold text-[#6d5cff] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                    aria-label={`View ${k.toLowerCase()} actions in Remediation History`}
                  >
                    {v.toLocaleString()}
                  </button>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12.5px] leading-relaxed text-slate-600">
            <span className="font-medium text-slate-800">Why it matters.</span> {humanPct.toFixed(1)}% needs a human.{" "}
            {e.rolledBack} fixes were reverted.
          </p>
        </div>
        <div className="sm:border-l sm:border-slate-200/80 sm:pl-5">
          <div className="flex items-center gap-1">
            <p className="text-[12px] font-medium text-slate-500">Hours Saved by AI</p>
            <InfoTooltip label="How hours saved is calculated" align="right">
              {e.hoursCalc}
            </InfoTooltip>
          </div>
          <p className="mt-1 text-[32px] font-semibold leading-none tracking-tight text-slate-900">
            {e.hoursSaved.toLocaleString()}
          </p>
          <p className="mt-2 text-[12px] text-slate-500">Assumes {e.minutesPerFix} min avg manual fix</p>
          <div className="mt-2 -ml-1">
            <Sparkline
              series={e.sparkline}
              valueKey="hours"
              ariaLabel={`Hours saved by AI over the ${e.chipLabel}`}
              formatHover={(p) => `${p.hours} hours saved`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
