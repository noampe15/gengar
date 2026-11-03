import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getRemediation } from "../data"

export default function RemediationPlanBody({ risk, hideIssueWhy = false }) {
  const [openAction, setOpenAction] = useState(null)
  const plan = risk ? getRemediation(risk.issue) : null

  useEffect(() => {
    setOpenAction(null)
  }, [risk?.id])

  if (!risk || !plan) return null

  return (
    <>
      <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">REMEDIATION ACTIONS</p>
      <div className="mt-2 space-y-2">
        {plan.actions.map((action) => {
          const open = openAction === action.title
          return (
            <div key={action.title} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setOpenAction(open ? null : action.title)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-400">
                  <ChevronRight className={`h-3.5 w-3.5 transition ${open ? "rotate-90" : ""}`} />
                </span>
                <span className="text-[13.5px] font-semibold text-slate-800">{action.title}</span>
              </button>
              {open && (
                <p className="px-3 pb-3 pl-11 text-[12.5px] leading-relaxed text-slate-500">{action.body}</p>
              )}
            </div>
          )
        })}
      </div>

      {!hideIssueWhy && (
        <>
          <p className="mt-5 text-[13px] font-medium text-slate-700">Issue Detail</p>
          <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-[13px] leading-relaxed text-slate-500">
            {plan.issueDetail}
          </div>

          <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">
            WHY THIS IS OFFERED & HOW IT RESOLVES THE ISSUE
          </p>
          <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-[13px] leading-relaxed text-slate-600">
            {plan.why}
          </div>
        </>
      )}

      <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">EXPECTED IMPACT</p>
      <ul className="mt-2 space-y-1.5">
        {plan.impact.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">ESTIMATED EFFORT</p>
          <p className="mt-1.5 text-[14px] font-semibold leading-tight text-slate-800">{plan.effort}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">OWNER</p>
          <p className="mt-1.5 whitespace-pre-line text-[14px] font-semibold leading-tight text-slate-800">
            {plan.owner}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">AUTOMATABLE</p>
          <p className="mt-1.5 text-[14px] font-semibold leading-tight text-slate-800">{plan.automatable}</p>
        </div>
      </div>

      {plan.history?.length > 0 && (
        <>
          <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">CHANGE HISTORY</p>
          <ol className="relative mt-3 space-y-5 border-l border-slate-200 pl-5">
            {plan.history.map((event) => (
              <li key={`${event.date}-${event.title}`} className="relative">
                <span className="absolute -left-[24px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300 ring-1 ring-slate-200" />
                <div className="flex gap-3">
                  <span className="w-[52px] shrink-0 pt-px text-[12px] text-slate-400">{event.date}</span>
                  <div>
                    <p className="text-[13.5px] font-medium leading-snug text-slate-800">{event.title}</p>
                    <p className="mt-0.5 text-[12px] text-slate-400">{event.actor}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}
