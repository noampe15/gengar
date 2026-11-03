import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { mspAssignees } from "../mspDashboard"

export default function AssignMenu({
  trigger,
  disabled = false,
  align = "left",
  onSelect,
  label = "Assign",
  ariaLabel,
  className = "",
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  function place() {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = 220
    const left =
      align === "right"
        ? Math.min(r.right - width, window.innerWidth - width - 8)
        : Math.min(r.left, window.innerWidth - width - 8)
    let top = r.bottom + 6
    const height = 8 + mspAssignees.length * 44
    if (top + height > window.innerHeight - 8) top = Math.max(8, r.top - height - 6)
    setCoords({ top, left: Math.max(8, left), width })
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
  }, [open, align])

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

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel ?? label}
        onClick={() => setOpen((v) => !v)}
        className={className}
      >
        {trigger ?? label}
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Assign to"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            className="fixed z-[200] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl"
          >
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Assign to</p>
            {mspAssignees.map((person) => (
              <button
                key={person.initials}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(person)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left outline-none hover:bg-slate-50 focus-visible:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6d5cff]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[10px] font-semibold text-[#6d5cff]">
                  {person.initials}
                </span>
                <span className="text-[13px] font-medium text-slate-800">{person.name}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
