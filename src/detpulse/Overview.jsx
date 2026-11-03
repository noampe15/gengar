import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { SignalHorizon } from "./Charts"
import { Card, Sparkline, ruleView } from "./ui"

export default function Overview() {
  const pulse = usePulse()
  const drop = pulse.drop
  const stage = STAGES.find((item) => item.id === pulse.stageId)
  const queue = RULES.filter((rule) => {
    if (!rule.degraded || pulse.patched[rule.id]) return false
    if (stage) return rule.nodes.some((id) => stage.nodes.includes(id))
    return true
  })

  return (
    <div className="@container flex h-full min-h-0 flex-col">
    <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto @min-[860px]:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] @min-[860px]:overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="grid shrink-0 gap-3 sm:grid-cols-2">
          <Kpi
            label="Detection Resilience Score (DRS)"
            value={`${pulse.drs.toFixed(1)} / 100`}
            delta={drop <= 0 ? "▲ Recovered" : `▼ ${drop.toFixed(1)} pts (24h)`}
            deltaClass={drop <= 0 ? "text-emerald-600" : "text-rose-500"}
            note={contractNote(pulse.patched, pulse.pending)}
            spark={pulse.drsSeries}
            sparkTone={drop <= 0 ? "healthy" : "critical"}
          />
          <Kpi
            label="Mean Time to Detect Drift (MTTD-D)"
            value="3m 42s"
            delta="▼ 94% faster vs baseline"
            deltaClass="text-emerald-600"
            note="Real-time AST & telemetry contract validation."
          />
          <ContractsCard patched={pulse.patched} />
          <Kpi
            label="HITL Governance Queue"
            value={`${pulse.pending} Pending Sign-Off`}
            note="100% ground-truth replay verified on 30d lake."
          />
        </div>
        <div className="grid min-h-0 flex-1 @min-[860px]:grid-cols-2">
          <SignalHorizon
            patched={pulse.patched}
            stages={STAGES}
            stageId={pulse.stageId}
            onStage={(id) => pulse.dispatch({ type: "stage", id })}
            onAuthor={() => pulse.dispatch({ type: "author", id: "t1556" })}
          />
        </div>
      </div>

      <aside className="flex min-h-0 min-w-0 flex-col @min-[860px]:h-full">
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-slate-200/80 px-3.5 py-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Urgent Resilience Action Queue</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {stage ? `Filtered to ${stage.title}.` : "Open detections waiting on lead sign-off."}
            </p>
            <p className="mt-0.5 text-[12px] text-slate-400">Showing {queue.length} open</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            {queue.length === 0 ? (
              <p className="px-3.5 py-8 text-[13px] text-slate-500">Nothing on this hop is waiting for a signature.</p>
            ) : (
              queue.map((rule) => (
                <QueueCard
                  key={rule.id}
                  rule={rule}
                  patched={pulse.patched}
                  onOpen={() => pulse.dispatch({ type: "open", id: rule.id })}
                />
              ))
            )}
          </div>
        </Card>
      </aside>
    </div>
    </div>
  )
}

const SEVERITY = {
  critical: "text-rose-600",
  degraded: "text-amber-700",
  healthy: "text-emerald-600",
}

const MODE_CHIP = {
  silent: "bg-rose-50 text-rose-700",
  noisy: "bg-amber-50 text-amber-800",
  downstream: "bg-amber-50 text-amber-800",
  lag: "bg-slate-100 text-amber-800",
}

function QueueCard({ rule, patched, onOpen }) {
  const view = ruleView(rule, patched)
  return (
    <div className="border-b border-slate-100 px-3.5 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold leading-snug text-slate-900">{rule.title}</p>
        <span className={`inline-flex shrink-0 items-center gap-1 text-[12px] font-medium ${SEVERITY[view.tone] || SEVERITY.degraded}`}>
          <span className="size-1.5 rounded-full bg-current" />
          {view.severity}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${MODE_CHIP[rule.status] || MODE_CHIP.noisy}`}>{view.pill}</span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Waiting on lead</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{rule.siem}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">{rule.technique}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{rule.volume}</span>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-slate-600">{rule.cause}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-[12px] leading-snug text-slate-400">{rule.lineage.join(" → ")}</p>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 shrink-0 items-center rounded-lg bg-indigo-600 px-3 text-[12px] font-semibold text-white hover:bg-indigo-500"
        >
          Review & Remediate (HITL) →
        </button>
      </div>
    </div>
  )
}

const CONTRACTS = [
  { id: "ProcessCommandLine", ruleId: "powershell", mode: "schema", className: "border-red-200 bg-red-50 text-red-700" },
  { id: "trusted_egress.csv", ruleId: "okta", mode: "lookup", className: "border-amber-200 bg-amber-50 text-amber-800" },
  { id: "DeviceId", ruleId: "lsass", mode: "webhook", className: "border-red-200 bg-red-50 text-red-700" },
  { id: "STS Token", ruleId: "iam", mode: "lag", className: "border-slate-300 bg-slate-50 text-amber-800" },
]

const STAGES = [
  {
    id: "telemetry",
    index: "01",
    short: "Collectors",
    title: "Telemetry Collectors (Falcon / CloudTrail)",
    nodes: ["falcon", "cloudtrail"],
    pill: "1 Schema Drift • 1 Auth Lag",
    pillClass: "bg-rose-50 text-rose-700",
    accent: "text-amber-700",
  },
  {
    id: "cribl",
    index: "02",
    short: "Cribl Stream",
    title: "Normalization Layer (Cribl Stream v2.4)",
    nodes: ["cribl"],
    pill: "ASIM Field Drop (process.cmd_line)",
    pillClass: "bg-rose-50 text-rose-700",
  },
  {
    id: "detection",
    index: "03",
    short: "SIEM Logic",
    title: "Detection Engine (Sentinel / Splunk)",
    nodes: ["sentinel", "splunk"],
    pill: "1 Blind Rule • 1 FP Storm (+340%)",
    pillClass: "bg-amber-50 text-amber-800",
  },
  {
    id: "response",
    index: "04",
    short: "Torq SOAR",
    title: "Response Webhooks (Torq SOAR)",
    nodes: ["torq"],
    pill: "1 Payload Contract Error (HTTP 422)",
    pillClass: "bg-rose-50 text-rose-700",
  },
]

function ContractsCard({ patched }) {
  const open = CONTRACTS.filter((item) => !patched[item.ruleId])
  const count = (mode) => open.filter((item) => item.mode === mode).length
  const breaks = open.length
  return (
    <Card className="overflow-hidden p-3.5">
      <p className="text-[12px] font-medium text-slate-500">Broken Telemetry Contracts</p>
      <p className="mt-1 font-mono text-[22px] font-semibold tracking-tight text-slate-900">{breaks} Active Break{breaks === 1 ? "" : "s"}</p>
      <p className="mt-1 text-[12px] leading-snug text-slate-600">
        {count("schema")} Schema Mutation • {count("lookup")} Lookup Drift • {count("webhook")} Webhook Drop • {count("lag")} Lag
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {CONTRACTS.map((item) => {
          const healed = patched[item.ruleId]
          return (
            <span key={item.id} className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${healed ? "bg-emerald-50 text-emerald-800" : item.className}`}>
              {item.id}
            </span>
          )
        })}
      </div>
    </Card>
  )
}

function contractNote(patched, pending) {
  const breaks = CONTRACTS.filter((item) => !patched[item.ruleId]).length
  if (breaks === 0 || pending === 0) return "No upstream contract breaks on production detections"
  const breakLabel = breaks === 1 ? "break" : "breaks"
  const detectionLabel = pending === 1 ? "detection" : "detections"
  return `${breaks} upstream contract ${breakLabel} impacting ${pending} production ${detectionLabel}`
}

function Kpi({ label, value, delta, deltaClass = "text-slate-500", note, spark, sparkTone }) {
  return (
    <Card className="p-3.5">
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-mono text-[22px] font-semibold tracking-tight text-slate-900">{value}</p>
        {spark ? <Sparkline values={spark} tone={sparkTone} width={40} height={28} /> : null}
      </div>
      {delta ? <p className={`mt-0.5 text-[12px] font-medium ${deltaClass}`}>{delta}</p> : null}
      {note ? <p className="mt-1 text-[12px] leading-snug text-slate-600">{note}</p> : null}
    </Card>
  )
}
