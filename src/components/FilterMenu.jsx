import { useEffect, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"

export default function FilterMenu({
  label,
  icon,
  options,
  value,
  onChange,
  searchable = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const filtered = (options ?? []).filter((opt) =>
    String(opt).toLowerCase().includes(query.toLowerCase()),
  )

  const active = Boolean(value)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} filter${value ? `: ${value}` : ""}`}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
          active
            ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
      >
        {icon}
        <span>{label}</span>
        {active && <span className="max-w-[110px] truncate text-slate-500">· {value}</span>}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {searchable && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onChange("")
              setOpen(false)
              setQuery("")
            }}
            className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-50"
          >
            Any {label.toLowerCase()}
          </button>
          <div className="max-h-56 overflow-auto">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                  setQuery("")
                }}
                className={`w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${
                  value === opt ? "font-medium text-[#6d5cff]" : "text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-sm text-slate-400">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
