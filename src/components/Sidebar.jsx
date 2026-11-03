import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Box,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  SlidersHorizontal,
  Users,
  Wrench,
} from "lucide-react"
import TenantSelector from "./TenantSelector"
import { EnvRiskBadge } from "./Badges"
import { envRiskSeverity } from "../data"

const STORAGE_KEY = "beacon-sidebar-collapsed"

function defaultCollapsed() {
  if (typeof window === "undefined") return true
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === "1") return true
    if (stored === "0") return false
  } catch {
    /* ignore */
  }
  return true
}

function Tip({ label, collapsed, children }) {
  const wrapRef = useRef(null)
  const [pos, setPos] = useState(null)

  function show() {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    })
  }

  function hide() {
    setPos(null)
  }

  return (
    <span
      ref={wrapRef}
      className={`relative flex w-full ${collapsed ? "justify-center" : ""}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}

function BeaconMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6d5cff]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 4.5L19 8.5V15.5L12 19.5L5 15.5V8.5L12 4.5Z" stroke="white" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.2" fill="white" />
      </svg>
    </div>
  )
}

export default function Sidebar({
  page,
  setPage,
  isGlobal,
  tenants,
  tenantId,
  onTenantChange,
  envRisk,
  envRiskByTenant,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const itemRefs = useRef([])

  const tenantsTab = isGlobal
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "remediation", label: "Remediation", icon: Wrench },
    {
      id: "tenants",
      label: tenantsTab ? "Tenants" : "Resources",
      icon: tenantsTab ? Users : Box,
    },
    { id: "settings", label: "Settings", icon: SlidersHorizontal },
  ]

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function onNavKey(e, index) {
    const last = navItems.length - 1
    let next = index
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    else return
    e.preventDefault()
    itemRefs.current[next]?.focus()
  }

  return (
    <aside
      className={`sticky top-0 z-[60] flex h-svh shrink-0 flex-col overflow-visible border-r border-slate-200 bg-white ${
        collapsed ? "w-16" : "w-[220px]"
      }`}
    >
      <div className={`shrink-0 border-b border-slate-100 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <BeaconMark />
          {!collapsed && (
            <span className="text-[16px] font-semibold tracking-tight text-slate-900">Beacon</span>
          )}
        </div>
        <div className={`mt-3 ${collapsed ? "flex justify-center" : ""}`}>
          <Tip label="Select view" collapsed={collapsed}>
            <TenantSelector
              tenants={tenants}
              value={tenantId}
              onChange={onTenantChange}
              envRiskByTenant={envRiskByTenant}
              collapsed={collapsed}
            />
          </Tip>
        </div>
        {!isGlobal && !collapsed && (
          <div className="mt-2">
            <EnvRiskBadge severity={envRiskSeverity[envRisk] ?? "None"} label={envRisk} />
          </div>
        )}
      </div>

      <nav aria-label="Primary" className="flex min-h-0 flex-1 flex-col px-2 py-3">
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {navItems.slice(0, 3).map((item, index) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <li key={item.id}>
                <Tip label={item.label} collapsed={collapsed}>
                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el
                    }}
                    type="button"
                    onClick={() => setPage(item.id)}
                    onKeyDown={(e) => onNavKey(e, index)}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex w-full items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                      collapsed ? "h-10 justify-center px-0" : "h-10 px-2.5"
                    } ${
                      active
                        ? "bg-[#f3f1ff] font-semibold text-slate-900"
                        : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-slate-900"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                  </button>
                </Tip>
              </li>
            )
          })}
        </ul>
        {(() => {
          const item = navItems[3]
          const Icon = item.icon
          const active = page === item.id
          const index = 3
          return (
            <div className="mt-2 border-t border-slate-100 pt-2">
              <Tip label={item.label} collapsed={collapsed}>
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  type="button"
                  onClick={() => setPage(item.id)}
                  onKeyDown={(e) => onNavKey(e, index)}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex w-full items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                    collapsed ? "h-10 justify-center" : "h-10 px-2.5"
                  } ${
                    active
                      ? "bg-[#f3f1ff] font-semibold text-slate-900"
                      : "font-medium text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-slate-900" aria-hidden="true" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </Tip>
            </div>
          )
        })()}
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-2 py-3">
        <Tip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} collapsed={collapsed}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-2 rounded-lg text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
              collapsed ? "h-10 justify-center" : "h-10 px-2.5"
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                <span className="text-[13px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </Tip>
      </div>
    </aside>
  )
}
