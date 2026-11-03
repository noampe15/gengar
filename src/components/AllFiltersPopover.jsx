import { useEffect, useRef, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import FilterMenu from "./FilterMenu"

export default function AllFiltersPopover({
  issue,
  provider,
  issueOptions,
  providerOptions,
  onChange,
  children,
  size = "compact",
  active = false,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
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
  }, [])

  const isActive = active || Boolean(issue || provider)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="All filters"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
          size === "header" ? "h-9 px-3 text-[13px]" : "h-7 px-2.5 text-[11px]"
        } ${isActive ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]" : "border-slate-200 bg-white text-slate-600"}`}
      >
        <SlidersHorizontal className={size === "header" ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden="true" />
        All filters
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="All filters"
          className="absolute right-0 z-40 mt-2 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          {children ?? (
            <>
              <FilterMenu label="Issue" searchable options={issueOptions} value={issue} onChange={(v) => onChange("issue", v)} />
              <FilterMenu
                label="Provider"
                options={providerOptions}
                value={provider}
                onChange={(v) => onChange("provider", v)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
