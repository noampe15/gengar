import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { ruleView } from "./ui"

const TIERS = [
  { id: "all", label: "All Levels", dot: "" },
  { id: "critical", label: "Critical", dot: "bg-red-500" },
  { id: "high", label: "High", dot: "bg-amber-500" },
  { id: "medium", label: "Medium", dot: "bg-yellow-400" },
  { id: "low", label: "Low", dot: "bg-slate-400" },
]

const SEVERITY = {
  critical: "text-red-600",
  high: "text-orange-600",
  medium: "text-amber-600",
  low: "text-slate-500",
  degraded: "text-amber-600",
  healthy: "text-emerald-600",
}

const TIER_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

const MODE_CHIP = {
  silent: "bg-rose-50 text-rose-700",
  noisy: "bg-amber-50 text-amber-800",
  downstream: "bg-amber-50 text-amber-800",
  lag: "bg-slate-100 text-amber-800",
}

function tierOf(rule) {
  if (rule.severity === "CRITICAL") return "critical"
  if (rule.severity === "HIGH") return "high"
  if (rule.severity === "LOW") return "low"
  return "medium"
}

export default function RemediationView() {
  const pulse = usePulse()
  const issues = [
    { kind: "author", id: "t1556", tier: "medium", title: "T1556.006 (Okta MFA Push Bombing — Ready to Author)", source: "Okta System Log", detail: "OktaLog is fully populated for MFA push bombing, and the detection has not been authored yet.", path: "Okta System Log → Sentinel Lake" },
    { kind: "author", id: "t1528", tier: "low", title: "T1528 (AWS Bedrock / IAM Session Replay — Ready to Author)", source: "AWS CloudTrail", detail: "sessionContext is populated on 99.4% of prod accounts, and the detection has not been authored yet.", path: "AWS CloudTrail → Snowflake OCSF" },
    { kind: "nav", id: "blocked", tier: "low", view: "detections", title: "18 detections blocked by missing audit policy", source: "Coverage", detail: "OS and cloud audit policy is missing, so these rules cannot be verified against live telemetry.", path: "Collectors → Detection Engine" },
    { kind: "nav", id: "unmapped", tier: "critical", view: "supply", title: "6 ASIM/OCSF keys still unmapped", source: "Cribl Stream", detail: "Normalization drops are leaving SIEM fields null on the degraded routes.", path: "Telemetry → Cribl → SIEM" },
    ...RULES.filter((rule) => rule.degraded && !pulse.patched[rule.id]).map((rule) => ({ kind: "rule", tier: tierOf(rule), rule })),
  ]
  const visible = issues.filter((issue) => pulse.remediationTier === "all" || issue.tier === pulse.remediationTier)
  const count = (tier) => issues.filter((issue) => tier === "all" || issue.tier === tier).length

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0B132B]">Remediation</h1>
      <p className="mt-1 text-sm text-slate-500">Detection, schema, and coverage issues across every severity tier.</p>
      <div className="mt-4 inline-flex w-fit items-center gap-0.5 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
        {TIERS.map((tier) => {
          const active = pulse.remediationTier === tier.id
          return (
            <button
              key={tier.id}
              type="button"
              aria-pressed={active}
              onClick={() => pulse.dispatch({ type: "remediation-tier", tier: tier.id })}
              className={active
                ? "flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition"
                : "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"}
            >
              {tier.dot ? <span className={`h-2 w-2 rounded-full ${tier.dot}`} /> : null}
              {tier.label} ({count(tier.id)})
            </button>
          )
        })}
      </div>
      <div className="mt-5 space-y-2.5 rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-4">
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500">No open issues in this tier.</p>
        ) : (
          visible.map((issue) => {
            if (issue.kind === "author") {
              return <AuthorQueueCard key={issue.id} issue={issue} onOpen={() => pulse.dispatch({ type: "author", id: issue.id })} />
            }
            if (issue.kind === "nav") {
              return <AuthorQueueCard key={issue.id} issue={issue} onOpen={() => pulse.dispatch({ type: "view", view: issue.view })} />
            }
            return (
              <QueueCard
                key={issue.rule.id}
                rule={issue.rule}
                patched={pulse.patched}
                onOpen={() => pulse.dispatch({ type: "open", id: issue.rule.id })}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function AuthorQueueCard({ issue, onOpen }) {
  const label = issue.kind === "author" ? "Synthesize & Backtest Rule →" : "Open workbench →"
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold leading-snug text-slate-900">{issue.title}</p>
        <span className={`inline-flex shrink-0 items-center gap-1 text-[12px] font-medium ${SEVERITY[issue.tier] || "text-indigo-600"}`}>
          <span className="size-1.5 rounded-full bg-current" />
          {TIER_LABEL[issue.tier] || "Medium"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">Coverage gap</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{issue.source}</span>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-slate-600">{issue.detail}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-[12px] leading-snug text-slate-400">{issue.path}</p>
        <button type="button" onClick={onOpen} className="inline-flex h-8 shrink-0 items-center rounded-xl bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-indigo-600">
          {label}
        </button>
      </div>
    </div>
  )
}

function QueueCard({ rule, patched, onOpen }) {
  const view = ruleView(rule, patched)
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold leading-snug text-slate-900">{rule.title}</p>
        <span className={`inline-flex shrink-0 items-center gap-1 text-[12px] font-medium ${SEVERITY[tierOf(rule)] || SEVERITY.degraded}`}>
          <span className="size-1.5 rounded-full bg-current" />
          {TIER_LABEL[tierOf(rule)] || "Medium"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${MODE_CHIP[rule.status] || MODE_CHIP.noisy}`}>{view.pill}</span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Waiting on lead</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{rule.siem}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">{rule.technique}</span>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-slate-600">{rule.cause}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-[12px] leading-snug text-slate-400">{rule.lineage.join(" → ")}</p>
        <button type="button" onClick={onOpen} className="inline-flex h-8 shrink-0 items-center rounded-xl bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-indigo-600">
          Review & Remediate →
        </button>
      </div>
    </div>
  )
}
