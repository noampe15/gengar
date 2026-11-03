import { useMemo, useState } from "react"
import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { Card, Sparkline, StatusPill, ruleView } from "./ui"

const STATUSES = [
  ["all", "All"],
  ["silent", "Silent Zero-Match"],
  ["noisy", "Alert Storm / Noisy"],
  ["downstream", "Downstream Break"],
  ["healthy", "Healthy"],
]
const SIEMS = ["Sentinel", "Splunk", "Snowflake"]

export default function DetectionsView() {
  const pulse = usePulse()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [siem, setSiem] = useState("")
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return RULES.map((rule) => ruleView(rule, pulse.patched)).filter((rule) => {
      if (status !== "all" && rule.status !== status) return false
      if (siem && rule.siem !== siem) return false
      if (!needle) return true
      const hay = `${rule.title} ${rule.technique} ${rule.cause} ${rule.fields || ""} ${rule.siemLabel}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [query, status, siem, pulse.patched])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Detections & Rule Health</h1>
        <p className="text-[13px] text-slate-600">Production rules against the contract they were written for.</p>
      </div>
      <Card className="p-3">
        <div className="flex flex-col gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by rule name, KQL field, or MITRE ID..."
            aria-label="Filter detections"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUSES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={status === id}
                onClick={() => setStatus(id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  status === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:inline-block" />
            {SIEMS.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={siem === name}
                onClick={() => setSiem((current) => (current === name ? "" : name))}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  siem === name ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                <th className="px-4 py-2 font-medium">Detection</th>
                <th className="px-4 py-2 font-medium">SIEM</th>
                <th className="px-4 py-2 font-medium">Match volume (24h)</th>
                <th className="px-4 py-2 font-medium">7d</th>
                <th className="px-4 py-2 font-medium">Drift root cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((rule) => {
                const openable = rule.degraded || rule.patched
                return (
                  <tr
                    key={rule.id}
                    onClick={() => {
                      if (openable) pulse.dispatch({ type: "open", id: rule.id })
                    }}
                    className={openable ? "cursor-pointer hover:bg-slate-50" : ""}
                  >
                    <td className="px-4 py-3">
                      <StatusPill tone={rule.tone} pulse={rule.tone === "critical" && !rule.patched}>
                        {rule.severity} · {rule.pill}
                      </StatusPill>
                      <p className="mt-1.5 text-[13px] font-semibold text-slate-900">{rule.title}</p>
                      <p className="font-mono text-[11px] text-slate-400">{rule.technique}</p>
                      {rule.audit ? <p className="mt-1 text-[11px] text-emerald-700">{rule.audit}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{rule.siemLabel}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-slate-800">{rule.patched ? "Replay verified" : rule.volume}</td>
                    <td className="px-4 py-3">
                      <Sparkline values={rule.patched ? [...rule.spark.slice(0, -1), rule.spark[0] || 8] : rule.spark} tone={rule.patched ? "healthy" : rule.tone === "critical" ? "critical" : rule.tone === "healthy" ? "healthy" : "degraded"} width={76} height={24} />
                    </td>
                    <td className="max-w-[320px] px-4 py-3 text-[12.5px] leading-snug text-slate-600">{rule.cause}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-4 py-8 text-[13px] text-slate-500">No rules match this filter.</p> : null}
        </div>
      </Card>
    </div>
  )
}
