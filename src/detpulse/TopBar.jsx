import { useEffect, useRef, useState } from "react"
import { Radar, User, Waypoints, Workflow, Wrench } from "lucide-react"
import { usePulse } from "./PulseContext"

function MilitaryBase({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M6 21V10h6v11" />
      <path d="M12 21V8h7v13" />
      <path d="M8 14h2" />
      <path d="M15 12h2" />
      <path d="M15 16h2" />
      <path d="M8 8V4" />
      <path d="M8 4h5l-1.2 1.8L13 7.5H8" />
    </svg>
  )
}

const NAV_ICONS = {
  overview: MilitaryBase,
  remediation: Wrench,
  supply: Waypoints,
  detections: Radar,
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

function useNavItems() {
  const pulse = usePulse()
  return [
    { id: "overview", label: "Command Center", hint: "", count: 0 },
    { id: "detections", label: "Detections", hint: "", count: pulse.degradedLeft.length },
    { id: "automations", label: "Automations", hint: "", count: pulse.brokenWebhooks },
    { id: "remediation", label: "Remediation", hint: "", count: pulse.pending + 4 },
    { id: "supply", label: "Topology Analysis", hint: "", count: 4 },
  ]
}

export function SideNav() {
  const pulse = usePulse()
  const tabs = useNavItems()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    function onPointer(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    function onKey(event) {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col items-center border-r border-slate-700 bg-slate-800 py-5 text-slate-300">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1.5 text-slate-200">
          <span className="grid size-8 place-items-center">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <path d="M2 12h4l2.2-6 3.6 12 2.2-6H22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-[11px] font-bold leading-none tracking-tight">DetPulse</p>
        </div>
        <nav aria-label="Primary views" className="flex flex-col items-center gap-2">
        {tabs.map((tab) => {
          const active = pulse.view === tab.id
          const Icon = NAV_ICONS[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              title={tab.count ? `${tab.label}. ${tab.count} open` : tab.label}
              onClick={() => pulse.dispatch({ type: "view", view: tab.id, tier: tab.id === "remediation" ? "all" : undefined })}
              className={`relative grid size-10 place-items-center rounded-2xl transition ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="size-4" />
              {tab.count > 0 ? (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-slate-800">
                  {tab.count}
                </span>
              ) : null}
            </button>
          )
        })}
        </nav>
      </div>
      <div className="relative mt-auto" ref={menuRef}>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          title="Account menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-full bg-white text-slate-800 shadow-sm ring-2 ring-slate-600"
        >
          <User className="size-4" />
        </button>
        {menuOpen ? (
          <div role="menu" aria-label="Account" className="absolute bottom-0 left-full z-50 ml-3 w-44 rounded-xl border border-slate-200/80 bg-white p-1.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            {["Account", "Settings", "Log Out"].map((item) => (
              <button
                key={item}
                type="button"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${item === "Log Out" ? "text-slate-500" : "text-slate-800"}`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>
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
          <div className="relative" ref={policyRef}>
            <button
              type="button"
              aria-expanded={pulse.policyOpen}
              aria-haspopup="dialog"
              onClick={() => pulse.dispatch({ type: "policy-toggle" })}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 hover:border-slate-300"
            >
              Governance Policy: Strict
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

function PolicyPopover({ className = "absolute right-0 z-50 mt-2" }) {
  const { policy, dispatch } = usePulse()
  return (
    <div role="dialog" aria-label="AI governance tiers" className={`${className} z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200/80 bg-white p-3 text-left text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)]`}>
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
            Strict: Mandatory 30d Replay + Lead Sign-Off
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
