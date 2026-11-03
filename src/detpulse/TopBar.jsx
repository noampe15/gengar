import { useEffect, useRef, useState } from "react"
import { GitBranch, LayoutDashboard, Menu, ShieldAlert, Workflow } from "lucide-react"
import { usePulse } from "./PulseContext"

const NAV_ICONS = {
  overview: LayoutDashboard,
  detections: ShieldAlert,
  parsers: GitBranch,
  automations: Workflow,
}

const SCHEMA = [
  ["autopr", "Auto-PR"],
  ["canary", "Canary 10%"],
  ["manual", "Manual"],
]
const LOOKUP = [
  ["oneclick", "1-Click Approve"],
  ["backtest", "Require Backtest"],
]
const SOAR = [
  ["staging", "Staging Only"],
  ["dual", "Dual Approval"],
]

function countLabel(count, singular, plural) {
  if (!count) return ""
  return `${count} ${count === 1 ? singular : plural}`
}

function useNavItems() {
  const pulse = usePulse()
  return [
    { id: "overview", label: "Overview", hint: "Command Center", badge: "" },
    { id: "detections", label: "Detections & Rule Health", badge: countLabel(pulse.degradedLeft.length, "Degraded", "Degraded") },
    { id: "parsers", label: "Parsers & Schema Lineage", badge: countLabel(pulse.parserDrift, "Drift Event", "Drift Events") },
    { id: "automations", label: "Automations & SOAR", badge: countLabel(pulse.brokenWebhooks, "Broken Webhook", "Broken Webhooks") },
  ]
}

export function SideNav() {
  const pulse = usePulse()
  const tabs = useNavItems()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <aside className={`flex h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${collapsed ? "w-[84px]" : "w-[248px]"}`}>
      <div className={`flex border-b border-slate-100 ${collapsed ? "flex-col items-center gap-1.5 px-1.5 py-3" : "h-14 items-center gap-2 px-3"}`}>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((current) => !current)}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-50"
        >
          <Menu className="size-4" />
        </button>
        <div className={`flex min-w-0 items-center ${collapsed ? "flex-col gap-1" : "gap-2"}`}>
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
              <path d="M2 12h4l2.2-6 3.6 12 2.2-6H22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </span>
          <div className={`min-w-0 leading-tight ${collapsed ? "text-center" : ""}`}>
            <p className="text-[13px] font-semibold whitespace-nowrap text-slate-900">DetPulse</p>
            {collapsed ? null : <p className="truncate text-[11px] text-slate-400">Detection Resilience</p>}
          </div>
        </div>
      </div>
      <nav aria-label="Primary views" className={`flex flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? "items-center p-2" : "p-3"}`}>
        {tabs.map((tab) => {
          const active = pulse.view === tab.id
          const Icon = NAV_ICONS[tab.id]
          const tip = tab.badge ? `${tab.label}. ${tab.badge}` : tab.hint ? `${tab.label}. ${tab.hint}` : tab.label
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              title={collapsed ? tip : undefined}
              onClick={() => pulse.dispatch({ type: "view", view: tab.id })}
              className={`relative rounded-lg border text-left ${
                collapsed ? "grid size-10 place-items-center" : "flex items-start gap-2.5 px-3 py-2.5"
              } ${
                active
                  ? "border-indigo-200 bg-indigo-50/70 text-indigo-700"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${collapsed ? "" : "mt-0.5"}`} />
              {collapsed ? (
                tab.badge ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-indigo-500" /> : null
              ) : (
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-900">{tab.label}</span>
                  {tab.hint ? <span className="mt-0.5 block text-[11px] font-normal text-slate-400">{tab.hint}</span> : null}
                  {tab.badge ? (
                    <span className={`mt-1.5 inline-flex rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-medium ${active ? "border-indigo-200 bg-white text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default function TopBar() {
  const pulse = usePulse()
  const policyRef = useRef(null)
  const pending = pulse.pending

  useEffect(() => {
    if (!pulse.policyOpen) return undefined
    function onPointer(event) {
      if (!policyRef.current?.contains(event.target)) pulse.dispatch({ type: "policy-close" })
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [pulse.policyOpen, pulse.dispatch])

  return (
    <header className="z-40 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-2">
        <p className="mr-auto min-w-0 text-[13px] font-semibold text-slate-900">
          <span className="whitespace-nowrap">DetPulse</span>
          <span className="font-normal text-slate-400"> / Detection Resilience Control Plane</span>
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Env: Core-Prod-US-East
          </span>
          <div className="relative" ref={policyRef}>
            <button
              type="button"
              aria-expanded={pulse.policyOpen}
              aria-haspopup="dialog"
              onClick={() => pulse.dispatch({ type: "policy-toggle" })}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:border-slate-300"
            >
              HITL Policy: Strict
            </button>
            {pulse.policyOpen ? <PolicyPopover /> : null}
          </div>
          <span className="inline-flex rounded-full border border-indigo-200/60 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
            Detection-as-Code Git Sync ({pending === 0 ? "In sync" : pending === 1 ? "1 PR Pending" : `${pending} PRs Pending`})
          </span>
        </div>
      </div>
    </header>
  )
}

function PolicyPopover() {
  const { policy, dispatch } = usePulse()
  return (
    <div role="dialog" aria-label="AI governance tiers" className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <p className="text-[12px] font-semibold text-slate-900">AI governance tiers</p>
      <p className="mt-0.5 text-[11px] text-slate-500">Query logic stays on mandatory replay and lead sign-off.</p>
      <div className="mt-3 space-y-3">
        <Tier label="Schema Key Remapping (ASIM/OCSF)">
          <Segment options={SCHEMA} value={policy.schema} onChange={(value) => dispatch({ type: "policy", key: "schema", value })} />
        </Tier>
        <Tier label="Lookup / Egress CIDR Appends">
          <Segment options={LOOKUP} value={policy.lookup} onChange={(value) => dispatch({ type: "policy", key: "lookup", value })} />
        </Tier>
        <Tier label="Query Logic & Exclusions">
          <span className="inline-flex rounded-full border border-amber-200/60 bg-amber-50/80 px-2 py-1 text-[11px] font-medium text-amber-700">
            Strict HITL: Mandatory 30d Replay + Lead Sign-Off
          </span>
        </Tier>
        <Tier label="SOAR Webhook Contract Fixes">
          <Segment options={SOAR} value={policy.soar} onChange={(value) => dispatch({ type: "policy", key: "soar", value })} />
        </Tier>
      </div>
    </div>
  )
}

function Tier({ label, children }) {
  return (
    <div className="border-t border-slate-100 pt-2.5">
      <p className="mb-1.5 text-[11px] font-medium text-slate-500">{label}</p>
      {children}
    </div>
  )
}

function Segment({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {options.map(([id, label]) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(id)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${selected ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-slate-500 hover:text-slate-800"}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
