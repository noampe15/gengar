import { useMemo, useState } from "react"
import { Check, RotateCcw, ArrowUpRight, Users } from "lucide-react"
import ActivityEntry from "./ActivityEntry"

const ACTOR_FILTERS = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "human", label: "Human" },
]

export default function LatestAiActivity({ totals, entries, onHistory, onAction }) {
  const [actor, setActor] = useState("all")

  const visible = useMemo(() => {
    const filtered =
      actor === "ai"
        ? entries.filter((row) => row.actorKind !== "human")
        : actor === "human"
          ? entries.filter((row) => row.actorKind === "human")
          : entries
    return [...filtered].slice(0, 5)
  }, [actor, entries])

  function onActorKey(e, index) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const next = e.key === "ArrowRight" ? (index + 1) % ACTOR_FILTERS.length : (index + ACTOR_FILTERS.length - 1) % ACTOR_FILTERS.length
    setActor(ACTOR_FILTERS[next].id)
  }

  return (
    <section className="flex h-full min-h-[28rem] w-full min-w-0 flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Latest activity</h2>
          <p className="mt-0.5 text-[12px] text-slate-600">What the AI and your team have done recently</p>
        </div>
        <button
          type="button"
          onClick={() => onHistory?.({ actor: "", event: "", outcome: "" })}
          className="shrink-0 text-[13px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        >
          Activity log →
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Activity actor" className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
          {ACTOR_FILTERS.map((opt, index) => {
            const pressed = actor === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setActor(opt.id)}
                onKeyDown={(e) => onActorKey(e, index)}
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                  pressed ? "bg-white text-[#5b4cf0] shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          <Check className="h-3 w-3" aria-hidden="true" /> {totals.fixed} fixed
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          <RotateCcw className="h-3 w-3" aria-hidden="true" /> {totals.rolledBack} rolled back
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> {totals.escalated} escalated
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#5b4cf0]">
          <Users className="h-3 w-3" aria-hidden="true" /> {totals.humanDecisions ?? 0} human decisions
        </span>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-visible">
        {visible.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-[13px] text-slate-600">No activity in this period</p>
        ) : (
          visible.map((entry) => <ActivityEntry key={entry.id} entry={entry} onAction={onAction} />)
        )}
      </div>
    </section>
  )
}
