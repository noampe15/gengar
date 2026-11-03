import { useState } from "react"
import { createPortal } from "react-dom"
import { Check, RotateCcw, ArrowUpRight, CheckCheck, X, Wrench, UserRound } from "lucide-react"

const OUTCOMES = {
  Fixed: { label: "Fixed", Icon: Check, className: "bg-emerald-50 text-emerald-800" },
  "Rolled back": { label: "Rolled back", Icon: RotateCcw, className: "bg-slate-100 text-slate-700" },
  Escalated: { label: "Escalated", Icon: ArrowUpRight, className: "bg-amber-50 text-amber-900" },
  "Approved unchanged": { label: "Approved unchanged", Icon: CheckCheck, className: "bg-emerald-50 text-emerald-800" },
  Rejected: { label: "Rejected", Icon: X, className: "bg-rose-50 text-rose-800" },
  "Manually applied": { label: "Manually applied", Icon: Wrench, className: "bg-slate-100 text-slate-800" },
}

function ConfidenceRing({ value }) {
  const r = 14
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100)
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center" role="img" aria-label={`Confidence ${value}%`}>
      <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#EEF0F6" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="#6d5cff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-slate-800">{value}</span>
    </span>
  )
}

function ActorAvatar({ name, shortName }) {
  const [pos, setPos] = useState(null)
  const initials = (shortName ?? name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function show(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
  }

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        onFocus={show}
        onBlur={() => setPos(null)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f1ff] text-[11px] font-semibold text-[#5b4cf0] outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        aria-label={name}
      >
        {initials || <UserRound className="h-4 w-4" aria-hidden="true" />}
      </button>
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
            className="pointer-events-none fixed z-[80] whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] font-medium text-slate-800 shadow-lg"
          >
            {name}
          </span>,
          document.body,
        )}
    </span>
  )
}

export default function ActivityEntry({ entry, onAction }) {
  const human = entry.actorKind === "human"
  const outcome = OUTCOMES[entry.outcome] ?? OUTCOMES.Fixed
  return (
    <article className="flex min-h-0 flex-1 items-start gap-2.5 border-t border-slate-100 py-2 first:border-t-0">
      {human ? <ActorAvatar name={entry.actorName ?? entry.actor} shortName={entry.actor} /> : <ConfidenceRing value={entry.confidence} />}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="min-w-0 text-[13px] font-semibold leading-snug text-slate-900">{entry.title}</h3>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${outcome.className}`}>
            <outcome.Icon className="h-3 w-3" aria-hidden="true" />
            {outcome.label}
          </span>
        </div>
        {entry.description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-slate-600">{entry.description}</p>
        ) : null}
        <div className="mt-1 flex min-w-0 flex-wrap gap-1">
          {entry.chips.map((chip) => (
            <span key={chip} className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-700">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAction?.(entry)}
        className="shrink-0 text-[12px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
      >
        {entry.actionLabel}
      </button>
    </article>
  )
}
