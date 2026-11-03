import { Building2, Check, ChevronDown, Globe2 } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { severityStyles } from "./Badges"
import { envRiskSeverity } from "../data"

export default function TenantSelector({ tenants, value, onChange, envRiskByTenant, collapsed = false, className = "" }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const current = tenants.find((t) => t.id === value) ?? tenants[0]
  const isGlobal = current?.id === "global"

  function place() {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = collapsed ? 320 : Math.max(r.width, 280)
    const left = collapsed ? r.right + 8 : r.left
    const maxLeft = Math.max(8, window.innerWidth - width - 8)
    setCoords({
      top: r.bottom + 8,
      left: Math.min(left, maxLeft),
      width,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    place()
    function onWin() {
      place()
    }
    window.addEventListener("resize", onWin)
    window.addEventListener("scroll", onWin, true)
    return () => {
      window.removeEventListener("resize", onWin)
      window.removeEventListener("scroll", onWin, true)
    }
  }, [open, collapsed])

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (triggerRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className={className} ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 border border-slate-200 bg-white text-[13px] font-medium text-slate-700 outline-none hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
          collapsed
            ? "h-10 w-10 justify-center rounded-lg"
            : "h-9 w-full max-w-full rounded-lg px-2.5"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select view"
      >
        {isGlobal ? (
          <Globe2 className="h-4 w-4 shrink-0 text-[#6d5cff]" />
        ) : (
          <Building2 className="h-4 w-4 shrink-0 text-[#6d5cff]" />
        )}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{current.name}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </>
        )}
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            aria-label="Select tenant or Multi-tenant"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            className="fixed z-[200] max-h-[min(24rem,calc(100vh-5rem))] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl"
          >
            {tenants.map((tenant) => {
              const selected = tenant.id === current.id
              const global = tenant.id === "global"
              return (
                <button
                  key={tenant.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(tenant.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6d5cff] ${
                    selected ? "bg-[#f7f6ff]" : ""
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                      global ? "bg-[#f3f1ff] text-[#6d5cff]" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {global ? <Globe2 className="h-4 w-4" /> : tenant.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-slate-800">{tenant.name}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          (severityStyles[envRiskSeverity[envRiskByTenant?.[tenant.id]]] ?? severityStyles.None).dot
                        }`}
                      />
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">{tenant.env}</span>
                  </span>
                  {selected && <Check className="h-4 w-4 text-[#6d5cff]" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
