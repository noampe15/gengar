import { useState } from "react"
import { createPortal } from "react-dom"
import { SeverityBadge } from "./Badges"

export default function IssueHoverPopup({ row, issues }) {
  const listed = (issues ?? []).filter((item) => item.issue)
  const list =
    listed.length > 0
      ? listed
      : row.healthy || !row.issue
        ? []
        : [{ issue: row.issue, priority: row.priority, score: row.score }]
  const healthy = Boolean(row.healthy)
  const [pos, setPos] = useState(null)

  if (healthy) {
    return <p className="text-[13px] font-medium text-emerald-700">No issues</p>
  }

  const extra = list.length - 1

  function show(e) {
    if (list.length < 2) return
    const rect = e.currentTarget.getBoundingClientRect()
    const width = 300
    const left = Math.min(rect.left, window.innerWidth - width - 12)
    setPos({ top: rect.bottom + 8, left: Math.max(8, left) })
  }

  return (
    <div className="relative max-w-[280px]" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      <p className="text-[13px] font-medium text-slate-800">{row.issue}</p>
      {extra > 0 && (
        <p className="mt-0.5 text-[11px] font-medium text-[#6d5cff]">
          +{extra} more {extra === 1 ? "issue" : "issues"}
        </p>
      )}
      {pos &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[80] w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <p className="text-[11px] font-semibold tracking-wide text-slate-400">
              All issues on this resource
            </p>
            <ul className="mt-2 space-y-2">
              {list.map((item) => (
                <li key={item.issue} className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-medium leading-snug text-slate-800">{item.issue}</p>
                  <SeverityBadge severity={item.priority} />
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
