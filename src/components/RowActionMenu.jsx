import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Search, Wrench } from "lucide-react"

export default function RowActionMenu({ row, onInvestigate, onRemediate }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
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

  function toggle(e) {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const width = 168
    const height = 88
    const left = Math.min(rect.right - width, window.innerWidth - width - 8)
    let top = rect.bottom + 6
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6)
    setPos({ top, left: Math.max(8, left) })
    setOpen((v) => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-600 hover:border-[#6d5cff]/40 hover:bg-[#f3f1ff] hover:text-[#6d5cff] ${
          open ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]" : "border-slate-200"
        }`}
        aria-label={`Actions for ${row.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Wrench className="h-3.5 w-3.5" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[80] w-[168px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onInvestigate(row)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-[#f7f6ff] hover:text-[#6d5cff]"
            >
              <Search className="h-3.5 w-3.5" />
              Investigate
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onRemediate(row)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-[#f7f6ff] hover:text-[#6d5cff]"
            >
              <Wrench className="h-3.5 w-3.5" />
              Remediate
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
