import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { RULES } from "./model"
import { usePulse } from "./PulseContext"
import { Sparkline, StatusPill, ruleView } from "./ui"

const DOMAINS = [
  ["all", "All Domains"],
  ["endpoint", "Endpoint"],
  ["identity", "Identity"],
  ["cloud", "Cloud"],
  ["network", "Network"],
  ["saas", "SaaS"],
]

const DOMAIN_LABEL = {
  endpoint: "ENDPOINT",
  identity: "IDENTITY",
  cloud: "CLOUD",
  network: "NETWORK",
  saas: "SAAS",
}

const STATUSES = [
  { id: "all", label: "All Statuses (176)", chip: "All (176)", dot: "" },
  { id: "silent", label: "Silent Zero-Match (4)", chip: "Silent Zero-Match (4)", dot: "bg-red-500" },
  { id: "noisy", label: "Alert Storm / Noisy (1)", chip: "Alert Storm / Noisy (1)", dot: "bg-amber-400" },
  { id: "downstream", label: "Downstream Break (1)", chip: "Downstream Break (1)", dot: "bg-orange-500" },
  { id: "healthy", label: "Healthy / Verified (170)", chip: "Healthy / Verified (170)", dot: "bg-emerald-500" },
]

const ENGINES = [
  { id: "", label: "All Engines", chip: "All" },
  { id: "Sentinel", label: "Microsoft Sentinel (142)", chip: "Sentinel" },
  { id: "Splunk", label: "Splunk Enterprise (88)", chip: "Splunk" },
  { id: "Snowflake", label: "Snowflake OCSF (24)", chip: "Snowflake" },
]

function domainOf(rule) {
  const hay = `${(rule.lineage || []).join(" ")} ${rule.title}`.toLowerCase()
  if (/zeek|corelight|palo|dns/.test(hay)) return "network"
  if (/okta|entra|ping/.test(hay)) return "identity"
  if (/github|workspace|salesforce/.test(hay)) return "saas"
  if (/cloudtrail|aws |gcp|azure activity|kubernetes/.test(hay)) return "cloud"
  return "endpoint"
}

function FilterChip({ open, onToggle, onClose, label, children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    function onPointer(event) {
      if (!ref.current?.contains(event.target)) onClose()
    }
    function onKey(event) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300"
      >
        {label}
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>
      {open ? (
        <div role="listbox" className="absolute top-[calc(100%+6px)] left-0 z-20 w-56 rounded-xl border border-slate-200/80 bg-white py-1 shadow-lg">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default function DetectionsView() {
  const pulse = usePulse()
  const searchRef = useRef(null)
  const [query, setQuery] = useState("")
  const [domain, setDomain] = useState("all")
  const [status, setStatus] = useState("all")
  const [siem, setSiem] = useState("")
  const [issuesOnly, setIssuesOnly] = useState(false)
  const [menu, setMenu] = useState(null)

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

  const statusMeta = STATUSES.find((item) => item.id === status) || STATUSES[0]
  const engineMeta = ENGINES.find((item) => item.id === siem) || ENGINES[0]

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return RULES.map((rule) => {
      const view = ruleView(rule, pulse.patched)
      return { ...view, domain: domainOf(rule) }
    }).filter((rule) => {
      if (domain !== "all" && rule.domain !== domain) return false
      if (issuesOnly && !rule.degraded) return false
      if (issuesOnly && rule.patched) return false
      if (status !== "all" && rule.status !== status) return false
      if (siem && rule.siem !== siem) return false
      if (!needle) return true
      const hay = `${rule.title} ${rule.technique} ${rule.cause} ${rule.fields || ""} ${rule.siemLabel} ${(rule.lineage || []).join(" ")}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [query, domain, status, siem, issuesOnly, pulse.patched])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0B132B]">Detections</h1>
        <p className="mt-1 text-sm text-slate-500">Production rules against the contract they were written for.</p>
      </div>

      <div className="relative mb-3 w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by rule name, field, MITRE technique ID, or data source..."
          aria-label="Filter detections"
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 pr-16 pl-10 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-indigo-300"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">⌘K</kbd>
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
          {DOMAINS.map(([id, label]) => {
            const active = domain === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setDomain(id)}
                className={active
                  ? "rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <FilterChip
            open={menu === "status"}
            onToggle={() => setMenu((current) => (current === "status" ? null : "status"))}
            onClose={() => setMenu(null)}
            label={`Status: ${statusMeta.chip}`}
          >
            {STATUSES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={status === item.id}
                onClick={() => {
                  setStatus(item.id)
                  if (item.id === "healthy") setIssuesOnly(false)
                  setMenu(null)
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs ${status === item.id ? "bg-slate-50 font-semibold text-slate-900" : "font-medium text-slate-600 hover:bg-slate-50"}`}
              >
                {item.dot ? <span className={`size-1.5 rounded-full ${item.dot}`} /> : <span className="size-1.5" />}
                {item.label}
              </button>
            ))}
          </FilterChip>

          <FilterChip
            open={menu === "engine"}
            onToggle={() => setMenu((current) => (current === "engine" ? null : "engine"))}
            onClose={() => setMenu(null)}
            label={`Engine: ${engineMeta.chip}`}
          >
            {ENGINES.map((item) => (
              <button
                key={item.id || "all"}
                type="button"
                role="option"
                aria-selected={siem === item.id}
                onClick={() => {
                  setSiem(item.id)
                  setMenu(null)
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-xs ${siem === item.id ? "bg-slate-50 font-semibold text-slate-900" : "font-medium text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </button>
            ))}
          </FilterChip>
        </div>

        <button
          type="button"
          aria-pressed={issuesOnly}
          onClick={() => {
            setIssuesOnly((on) => {
              const next = !on
              if (next) setStatus("all")
              return next
            })
          }}
          className={`ml-auto flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${issuesOnly ? "border-red-300 bg-red-100 text-red-800" : "border-red-200/60 bg-red-50 text-red-700 hover:bg-red-100"}`}
        >
          <span className="size-1.5 rounded-full bg-red-500" />
          6 Issues Active
        </button>
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
