import { useEffect, useId, useRef, useState } from "react"
import { Info } from "lucide-react"

export default function InfoTooltip({ label, children, align = "left" }) {
  const [open, setOpen] = useState(false)
  const id = useId()
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

  return (
    <span className="relative inline-flex" ref={ref}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-2.5 text-[12px] leading-relaxed text-slate-600 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
