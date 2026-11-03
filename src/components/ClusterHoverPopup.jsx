import { useState } from "react"
import { createPortal } from "react-dom"
import { ProviderBadge, SeverityBadge } from "./Badges"

function useHoverPos(width = 320) {
  const [pos, setPos] = useState(null)

  function show(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 12)
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const spaceAbove = rect.top - 12
    const placeBelow = spaceBelow >= 240 || spaceBelow >= spaceAbove
    const top = placeBelow ? rect.bottom + 8 : 8
    const maxHeight = Math.max(160, placeBelow ? spaceBelow : spaceAbove)
    setPos({ top, left, width, maxHeight })
  }

  return { pos, show, hide: () => setPos(null) }
}

export function TenantClusterCell({ tenants = [] }) {
  const { pos, show, hide } = useHoverPos(560)
  const shown = tenants.slice(0, 4)
  const extra = tenants.length - shown.length
  const twoCol = tenants.length > 6

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {shown.map((tenant) => (
            <span
              key={tenant.id}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#f3f1ff] text-[8px] font-semibold text-[#6d5cff]"
            >
              {tenant.initials}
            </span>
          ))}
        </div>
        {extra > 0 && <p className="text-[11px] font-medium text-[#6d5cff]">+{extra} more</p>}
      </div>
      {pos &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
            className="pointer-events-none fixed z-[80] overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <p className="text-[11px] font-semibold tracking-wide text-slate-400">
              {tenants.length} {tenants.length === 1 ? "tenant" : "tenants"} in this cluster
            </p>
            <ul className={`mt-2 ${twoCol ? "grid grid-cols-2 gap-x-3 gap-y-1.5" : "space-y-2"}`}>
              {tenants.map((tenant) => (
                <li key={tenant.id} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[8px] font-semibold text-[#6d5cff]">
                    {tenant.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-slate-800">{tenant.name}</span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {tenant.resource}
                      {tenant.provider ? ` · ${tenant.provider}` : ""}
                    </span>
                  </span>
                  <SeverityBadge severity={tenant.priority} />
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

export function ProviderClusterCell({ providers = [], fallback }) {
  const list = providers.length ? providers : fallback ? [{ name: fallback, tenantCount: 1 }] : []
  const { pos, show, hide } = useHoverPos(260)

  if (list.length <= 1) {
    return <ProviderBadge provider={list[0]?.name ?? fallback} />
  }

  const shown = list.slice(0, 2)
  const extra = list.length - shown.length

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-1">
        {shown.map((item) => (
          <ProviderBadge key={item.name} provider={item.name} />
        ))}
        {extra > 0 && (
          <span className="text-[11px] font-medium text-[#6d5cff]">+{extra}</span>
        )}
      </div>
      {pos &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
            className="pointer-events-none fixed z-[80] overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <p className="text-[11px] font-semibold tracking-wide text-slate-400">
              {list.length} providers in this cluster
            </p>
            <ul className="mt-2 space-y-2">
              {list.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3">
                  <ProviderBadge provider={item.name} />
                  <span className="text-[12px] text-slate-500">
                    {item.tenantCount} {item.tenantCount === 1 ? "tenant" : "tenants"}
                  </span>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
