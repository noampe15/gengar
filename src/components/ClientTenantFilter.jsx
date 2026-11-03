import { useEffect, useRef, useState } from "react"
import { Building2, Check, ChevronDown } from "lucide-react"

export default function ClientTenantFilter({ tenants, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = new Set(value ?? [])
  const allSelected = tenants.length > 0 && selected.size === tenants.length
  const noneSelected = selected.size === 0

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  function toggle(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  const label = allSelected
    ? "Tenant"
    : noneSelected
      ? "0 tenants"
      : selected.size === 1
        ? tenants.find((t) => selected.has(t.id))?.name ?? "Tenant"
        : `${selected.size} tenants`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium ${
          !allSelected
            ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter tenants"
      >
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[160px] truncate">{label}</span>
        {!allSelected && (
          <span className="rounded-full bg-[#6d5cff] px-1.5 text-[10px] font-semibold text-white">
            {selected.size}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="text-[11px] font-semibold tracking-wide text-slate-400">TENANT</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange(tenants.map((t) => t.id))}
                className="text-[12px] font-medium text-[#6d5cff] hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[12px] font-medium text-[#6d5cff] hover:underline"
              >
                Deselect all
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {tenants.map((tenant) => {
              const on = selected.has(tenant.id)
              return (
                <button
                  key={tenant.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(tenant.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      on ? "border-[#6d5cff] bg-[#6d5cff] text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                    {tenant.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-slate-800">{tenant.name}</span>
                    <span className="block truncate text-[11px] text-slate-400">{tenant.env}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
