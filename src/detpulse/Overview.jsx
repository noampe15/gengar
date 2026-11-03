import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { VolumeChart, MitreMatrix } from "./Charts"
import Lineage from "./Lineage"
import { Card, Sparkline, StatusPill, ruleView } from "./ui"

export default function Overview() {
  const pulse = usePulse()
  const drop = pulse.drop
  const breaks = pulse.schemaBreaks
  const queue = RULES.filter((rule) => rule.degraded && !pulse.patched[rule.id] && (!pulse.nodeId || rule.nodes.includes(pulse.nodeId)))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Command Center</h1>
        <p className="text-[13px] text-slate-600">Core-Prod-US-East · detection contracts, parser drift, and the sign-off queue.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Detection Resilience Score (DRS)"
          value={`${pulse.drs.toFixed(1)} / 100`}
          badge={drop <= 0 ? "Recovered" : `-${drop.toFixed(1)} pts (24h)`}
          badgeTone={drop <= 0 ? "healthy" : "critical"}
          note={breaks === 0 ? "No open schema breaks on tier-1 rules" : `${breaks} silent schema break${breaks === 1 ? "" : "s"} impacting tier-1 rules`}
          spark={pulse.drsSeries}
          sparkTone={drop <= 0 ? "healthy" : "critical"}
          labels={["Oct 28", "Oct 31", "Nov 3"]}
        />
        <Kpi
          label="Mean Time to Detect Drift (MTTD-D)"
          value="3m 42s"
          badge="-94% vs baseline"
          badgeTone="healthy"
          note="Real-time AST & telemetry contract validation."
          spark={[18, 14, 11, 8, 6, 5, 3.7]}
          sparkTone="healthy"
          labels={["Oct 28", "Oct 31", "Nov 3"]}
        />
        <Kpi
          label="Silent MITRE Coverage Gaps"
          value={`${pulse.gaps.length} Technique${pulse.gaps.length === 1 ? "" : "s"} Blind`}
          note="Rules enabled in SIEM but matching 0 events."
          spark={pulse.gaps.length ? [1, 2, 2, 3, 4, 4, pulse.gaps.length] : [4, 3, 3, 2, 1, 1, 0]}
          sparkTone={pulse.gaps.length ? "critical" : "healthy"}
          labels={["Oct 28", "Oct 31", "Nov 3"]}
          extra={
            <div className="mt-2 flex flex-wrap gap-1">
              {pulse.gaps.length === 0 ? (
                <StatusPill tone="healthy">Coverage held</StatusPill>
              ) : (
                pulse.gaps.map((technique) => (
                  <span key={technique} className="rounded border border-red-200/60 bg-red-50/80 px-1.5 py-0.5 font-mono text-[10px] text-red-700">
                    {technique}
                  </span>
                ))
              )}
            </div>
          }
        />
        <Kpi
          label="HITL Governance Queue"
          value={`${pulse.pending} Pending Sign-Off`}
          note="100% ground-truth replay verified on 30d lake."
          spark={[4, 3, 3, 2, 2, 2, pulse.pending]}
          sparkTone="ai"
          labels={["Oct 28", "Oct 31", "Nov 3"]}
        />
      </div>
      <Lineage />
      <div className="grid gap-4 lg:grid-cols-2">
        <VolumeChart />
        <MitreMatrix />
      </div>
      <Card>
        <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-[14px] font-semibold text-slate-900">Urgent Resilience Action Queue</h2>
          <p className="font-mono text-[11px] text-slate-400">{queue.length} open</p>
        </div>
        {queue.length === 0 ? (
          <p className="px-4 py-8 text-[13px] text-slate-500">Nothing on this hop is waiting for a signature.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  <th className="px-4 py-2 font-medium">Detection</th>
                  <th className="px-4 py-2 font-medium">Lineage</th>
                  <th className="px-4 py-2 font-medium">Root cause</th>
                  <th className="px-4 py-2 text-right font-medium"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((rule) => {
                  const view = ruleView(rule, pulse.patched)
                  return (
                    <tr key={rule.id}>
                      <td className="px-4 py-3">
                        <StatusPill tone={view.tone} pulse={view.tone === "critical"}>
                          {view.severity} · {view.pill}
                        </StatusPill>
                        <p className="mt-1.5 text-[13px] font-semibold text-slate-900">{rule.title}</p>
                        <p className="font-mono text-[11px] text-slate-400">{rule.technique}</p>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{rule.lineage.join(" → ")}</td>
                      <td className="max-w-[280px] px-4 py-3 text-[12px] text-slate-600">{rule.cause}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => pulse.dispatch({ type: "open", id: rule.id })}
                          className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-slate-800"
                        >
                          Review & Remediate (HITL) →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function Kpi({ label, value, badge, badgeTone = "critical", note, spark, sparkTone, labels, extra }) {
  const rising = badgeTone !== "critical"
  const delta = badge ? badge.replace(/^[−-]\s*/, "") : ""
  return (
    <Card className="overflow-hidden p-3.5 pb-3">
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-[26px] font-semibold tracking-tight whitespace-nowrap text-slate-900">{value}</p>
      {badge ? (
        <p className={`mt-0.5 text-[12px] font-medium ${rising ? "text-emerald-600" : "text-rose-500"}`}>
          {rising ? "▲" : "▼"} {delta}
        </p>
      ) : (
        <p className="mt-0.5 text-[12px] text-slate-400">Last 7 days</p>
      )}
      <div className="mt-2 -mx-1">
        <Sparkline values={spark} tone={sparkTone} fluid />
      </div>
      {labels ? (
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {labels.map((labelText) => (
            <span key={labelText}>{labelText}</span>
          ))}
        </div>
      ) : null}
      <p className="mt-2 text-[12px] leading-snug text-slate-600">{note}</p>
      {extra}
    </Card>
  )
}
