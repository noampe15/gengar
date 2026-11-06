import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { Sparkline, StatusPill, ruleView } from "./ui"

const DOMAINS = [
  ["all", "All Domains"],
  ["endpoint", "Endpoint"],
  ["identity", "Identity"],
  ["cloud", "Cloud"],
  ["network", "Network"],
  ["saas", "Saas"],
]

const DOMAIN_LABEL = {
  endpoint: "ENDPOINT",
  identity: "IDENTITY",
  cloud: "CLOUD",
  network: "NETWORK",
  saas: "SAAS",
}

const STATUSES = [
  ["all", "All Issues", ""],
  ["silent", "Silent Zero-Match", "bg-red-500"],
  ["noisy", "Alert Storm / Noisy", "bg-amber-400"],
  ["downstream", "Downstream Break", "bg-orange-500"],
  ["healthy", "Healthy / Verified", "bg-emerald-500"],
]

const SIEMS = ["Sentinel", "Splunk", "Snowflake"]

function domainOf(rule) {
  const hay = `${(rule.lineage || []).join(" ")} ${rule.title}`.toLowerCase()
  if (/zeek|corelight|palo|dns/.test(hay)) return "network"
  if (/okta|entra|ping/.test(hay)) return "identity"
  if (/github|workspace|salesforce/.test(hay)) return "saas"
  if (/cloudtrail|aws |gcp|azure activity|kubernetes/.test(hay)) return "cloud"
  return "endpoint"
}

export default function DetectionsView() {
  const pulse = usePulse()
  const searchRef = useRef(null)
  const [query, setQuery] = useState("")
  const [domain, setDomain] = useState("all")
  const [status, setStatus] = useState("all")
  const [siem, setSiem] = useState("")

  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return RULES.map((rule) => {
      const view = ruleView(rule, pulse.patched)
      return { ...view, domain: domainOf(rule) }
    }).filter((rule) => {
      if (domain !== "all" && rule.domain !== domain) return false
      if (status !== "all" && rule.status !== status) return false
      if (siem && rule.siem !== siem) return false
      if (!needle) return true
      const hay = `${rule.title} ${rule.technique} ${rule.cause} ${rule.fields || ""} ${rule.siemLabel} ${(rule.lineage || []).join(" ")}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [query, domain, status, siem, pulse.patched])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0B132B]">Detections</h1>
        <p className="mt-1 text-sm text-slate-500">Production rules against the contract they were written for.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by rule name, field, MITRE technique ID, or data source..."
          aria-label="Filter detections"
          className="h-10 w-full rounded-2xl border border-slate-200/80 bg-white pr-16 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">⌘K</kbd>
      </div>

      <div className="flex flex-wrap gap-2">
        {DOMAINS.map(([id, label]) => {
          const active = domain === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setDomain(id)}
              className={active ? "rounded-full bg-[#0B132B] px-4 py-1.5 text-xs font-medium text-white" : "rounded-full border border-slate-200/50 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map(([id, label, dot]) => {
            const active = status === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(id)}
                className={active ? "inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-4 py-1.5 text-xs font-semibold text-blue-700" : "inline-flex items-center gap-1.5 rounded-full border border-slate-200/50 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"}
              >
                {dot ? <span className={`size-1.5 rounded-full ${dot}`} /> : null}
                {label}
              </button>
            )
          })}
        </div>
        <label className="relative inline-flex items-center">
          <span className="sr-only">SIEM engine</span>
          <select
            value={siem}
            onChange={(event) => setSiem(event.target.value)}
            className="h-8 appearance-none rounded-full border border-slate-200/70 bg-white py-1.5 pr-8 pl-3 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50"
          >
            <option value="">All Engines</option>
            {SIEMS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 text-[10px] text-slate-400">▾</span>
        </label>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-3">
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white">
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
                      <p className="font-mono text-[11px] text-slate-400">{DOMAIN_LABEL[rule.domain]} • {rule.technique}</p>
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
          {rows.length === 0 ? <p className="px-4 py-8 text-sm text-slate-500">No rules match this filter.</p> : null}
        </div>
      </div>
    </div>
  )
}
