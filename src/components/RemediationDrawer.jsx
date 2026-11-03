import { useEffect, useMemo, useState } from "react"
import { ChevronRight, Users, Wrench, X, Zap } from "lucide-react"
import { getRemediation } from "../data"
import { SeverityBadge } from "./Badges"

export default function RemediationDrawer({ risk, onClose }) {
  const [openAction, setOpenAction] = useState(null)
  const [queued, setQueued] = useState(false)
  const plan = useMemo(() => (risk ? getRemediation(risk.issue) : null), [risk])

  useEffect(() => {
    setOpenAction(null)
    setQueued(false)
  }, [risk?.id])

  if (!risk || !plan) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[448px] flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <Wrench className="h-4 w-4" />
            </span>
            Remediation Plan
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 pb-6 pt-4">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">{risk.issue}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
            <span className="font-medium text-slate-500">{risk.name}</span>
            <span>·</span>
            <span>
              {risk.provider} {risk.type}
            </span>
            <SeverityBadge severity={risk.priority} />
          </div>

          {risk.relatedResources?.length > 0 && (
            <div className="mt-4 flex gap-3 rounded-xl bg-[#eef2ff] px-3.5 py-3 text-[#4f46e5]">
              <Users className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold">Shared issue scope</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#6366f1]">
                  Remediating this issue will also affect{" "}
                  <span className="font-semibold">
                    {risk.relatedResources.length === 1
                      ? "1 other resource"
                      : `${risk.relatedResources.length} other resources`}
                  </span>{" "}
                  impacted by the same control gap.
                </p>
                <ul className="mt-2 space-y-1">
                  {risk.relatedResources.map((name) => (
                    <li key={name} className="text-[12px] font-medium text-[#4338ca]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="mt-5 text-[11px] font-semibold tracking-wide text-slate-400">
            REMEDIATION ACTIONS
          </p>
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
        </div>

        <div className="border-t border-slate-100 p-4">
          {queued ? (
            <p className="rounded-xl bg-emerald-50 py-2.5 text-center text-[13px] font-semibold text-emerald-700">
              Remediation queued for {risk.name}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setQueued(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-[14px] font-semibold text-white hover:bg-slate-800"
            >
              <Zap className="h-4 w-4 fill-current" />
              Remediate Now
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
