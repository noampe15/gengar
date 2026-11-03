import { useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import { getAiRemediation } from "../data"

function relativeAgo(at) {
  if (!at) return "unknown time"
  const hours = Math.max(1, Math.round((Date.now() - at) / 3_600_000))
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export default function DecisionDrawer({ item, historyEntry, onClose, onDecide }) {
  const closeRef = useRef(null)
  const pack = item ? getAiRemediation({ ...item, rtoDelta: item.rtoDelta ?? 9, name: item.issue }) : null

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [item?.id, historyEntry?.id, onClose])

  if (historyEntry && !item) {
    const isChange = Boolean(historyEntry.diff?.length)
    return (
      <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/35" onClick={onClose}>
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="rollback-drawer-title"
          className="drawer-in flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d5cff]">{isChange ? "View change" : "Rollback reason"}</p>
              <h2 id="rollback-drawer-title" className="mt-1 text-[16px] font-semibold text-slate-900">
                {historyEntry.issue}
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-500">
                {historyEntry.tenantName}
                {historyEntry.confidence != null ? ` · ${historyEntry.confidence}% confidence at apply` : ""}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close rollback drawer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-5 px-5 py-4">
            {historyEntry.diff?.length ? (
              <>
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actor</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{historyEntry.actor ?? historyEntry.approvedBy}</p>
                </section>
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Change</h3>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0f172a] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-slate-200">
                    {historyEntry.diff.map((line, i) => (
                      <span
                        key={`${i}-${line}`}
                        className={`block ${
                          line.startsWith("+") && !line.startsWith("+++")
                            ? "text-emerald-300"
                            : line.startsWith("-") && !line.startsWith("---")
                              ? "text-rose-300"
                              : "text-slate-300"
                        }`}
                      >
                        {line || " "}
                      </span>
                    ))}
                  </pre>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cause</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{historyEntry.rollbackCause}</p>
                </section>
                <section>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">What was restored</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{historyEntry.restored}</p>
                </section>
              </>
            )}
          </div>
        </aside>
      </div>
    )
  }

  if (!item || !pack) return null
  const tenants = item.affectedTenants?.length
    ? item.affectedTenants
    : (item.tenantNames ?? []).map((name) => ({ name, initials: name.slice(0, 2).toUpperCase() }))

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/35" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-drawer-title"
        className="drawer-in flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d5cff]">Human-in-the-loop review</p>
            <h2 id="decision-drawer-title" className="mt-1 text-[16px] font-semibold text-slate-900">
              {item.issue}
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {item.confidence}% confidence · {item.reversible ? "Reversible" : "Irreversible"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close review drawer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Proposed change</h3>
            <p className="mt-1.5 text-[13px] text-slate-700">{item.fixSummary}</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0f172a] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-slate-200">
              {pack.diff.map((line, i) => (
                <span
                  key={`${i}-${line}`}
                  className={`block ${
                    line.startsWith("+") && !line.startsWith("+++")
                      ? "text-emerald-300"
                      : line.startsWith("-") && !line.startsWith("---")
                        ? "text-rose-300"
                        : "text-slate-300"
                  }`}
                >
                  {line || " "}
                </span>
              ))}
            </pre>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Affected tenants</h3>
            <ul className="mt-2 space-y-1.5">
              {tenants.map((t) => (
                <li key={t.id ?? t.name} className="flex items-center gap-2 text-[13px] text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f1ff] text-[9px] font-semibold text-[#6d5cff]">
                    {t.initials}
                  </span>
                  {t.name}
                </li>
              ))}
            </ul>
            {item.tenantCount > tenants.length && (
              <p className="mt-1.5 text-[12px] text-slate-500">+{item.tenantCount - tenants.length} more tenants in this cluster</p>
            )}
          </section>
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Confidence rationale</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{item.rationale}</p>
            <p className="mt-2 text-[12px] text-slate-500">Held for human review: {item.reason}</p>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Introduced by</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
              {item.introducedBy
                ? `${item.introducedBy.summary ?? `Manual change in ${item.introducedBy.source}`}, ${relativeAgo(item.introducedBy.at)}, ${item.introducedBy.handle ?? item.introducedBy.actor}`
                : "Unknown source"}
            </p>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rollback plan</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{item.rollbackPlan}</p>
          </section>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => onDecide("approve", item)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#6d5cff] text-[13px] font-semibold text-white outline-none hover:bg-[#5b4cf0] focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            <Check className="h-4 w-4" />
            Approve
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onDecide("reject", item)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => onDecide("changes", item)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              Request changes
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
