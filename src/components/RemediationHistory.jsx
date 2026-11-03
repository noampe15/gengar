import { useEffect, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Ban,
  CheckCircle2,
  Clock,
  Download,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  UserPlus,
  UserRound,
  Wrench,
  X,
} from "lucide-react"
import FilterMenu from "./FilterMenu"
import { exportHistoryCsv, isAiHistoryRow } from "../mspDashboard"

const PAGE = 50

const EVENT_META = {
  Fixed: { icon: CheckCircle2, className: "text-emerald-800", chip: "bg-emerald-50", label: "Fixed" },
  "Rolled back": { icon: RotateCcw, className: "text-rose-800", chip: "bg-rose-50", label: "Rolled back" },
  Escalated: { icon: ShieldAlert, className: "text-amber-900", chip: "bg-amber-50", label: "Escalated" },
  "Approved fix": { icon: CheckCircle2, className: "text-emerald-800", chip: "bg-emerald-50", label: "Approved fix" },
  "Rejected fix": { icon: X, className: "text-rose-800", chip: "bg-rose-50", label: "Rejected fix" },
  "Manual remediation": { icon: Wrench, className: "text-slate-800", chip: "bg-slate-100", label: "Manual remediation" },
  "Manual rollback": { icon: RotateCcw, className: "text-slate-800", chip: "bg-slate-100", label: "Manual rollback" },
  Reassigned: { icon: UserPlus, className: "text-slate-800", chip: "bg-slate-100", label: "Reassigned" },
  Snoozed: { icon: Clock, className: "text-amber-900", chip: "bg-amber-50", label: "Snoozed" },
  Dismissed: { icon: Ban, className: "text-slate-700", chip: "bg-slate-100", label: "Dismissed" },
  "Threshold changed": { icon: SlidersHorizontal, className: "text-slate-800", chip: "bg-slate-100", label: "Threshold changed" },
}

const ACTOR_FILTERS = [
  { id: "", label: "All" },
  { id: "AI", label: "AI" },
  { id: "Human", label: "Human" },
]

function formatTs(at) {
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EventChip({ row }) {
  const key = row.event ?? row.outcome
  const meta = EVENT_META[key] ?? EVENT_META.Fixed
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${meta.chip} ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export default function RemediationHistory({
  rows,
  isGlobal,
  outcome,
  tenant,
  approver,
  sla,
  actor = "",
  event = "",
  onFilter,
  onViewRollback,
  showPortfolioTotals,
  highlightId,
  headerAction = null,
}) {
  const [sort, setSort] = useState({ key: "at", dir: "desc" })
  const [page, setPage] = useState(1)

  const aiRows = useMemo(() => rows.filter(isAiHistoryRow), [rows])
  const humanRows = useMemo(() => rows.filter((r) => !isAiHistoryRow(r)), [rows])

  const totals = useMemo(
    () => ({
      attempted: aiRows.filter((r) => ["Fixed", "Rolled back", "Escalated"].includes(r.outcome)).length,
      succeeded: aiRows.filter((r) => r.outcome === "Fixed").length,
      rolledBack: aiRows.filter((r) => r.outcome === "Rolled back").length,
      escalated: aiRows.filter((r) => r.outcome === "Escalated").length,
      approved: humanRows.filter((r) => r.event === "Approved fix").length,
      rejected: humanRows.filter((r) => r.event === "Rejected fix").length,
      manualFixes: humanRows.filter((r) => r.event === "Manual remediation").length,
      dismissed: humanRows.filter((r) => r.event === "Dismissed").length,
    }),
    [aiRows, humanRows],
  )

  const tenants = useMemo(() => [...new Set(rows.map((r) => r.tenantName))].sort(), [rows])
  const approvers = useMemo(() => [...new Set(rows.map((r) => r.approvedBy).filter(Boolean))].sort(), [rows])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (actor === "AI" && !isAiHistoryRow(row)) return false
      if (actor === "Human" && isAiHistoryRow(row)) return false
      if (outcome && row.outcome !== outcome) return false
      if (event && row.event !== event) return false
      if (tenant && row.tenantName !== tenant) return false
      if (approver && row.approvedBy !== approver) return false
      if (sla === "SLA breached" && !row.slaBreached) return false
      return true
    })
  }, [rows, actor, outcome, event, tenant, approver, sla])

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const key = sort.key
      if (key === "at") return (a[key] - b[key]) * dir
      const av = key === "actor" ? (a.actor ?? a.approvedBy) : key === "event" ? (a.event ?? a.outcome) : a[key]
      const bv = key === "actor" ? (b.actor ?? b.approvedBy) : key === "event" ? (b.event ?? b.outcome) : b[key]
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir
    })
  }, [filtered, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE))
  const safePage = Math.min(page, pages)
  const slice = sorted.slice((safePage - 1) * PAGE, safePage * PAGE)

  useEffect(() => {
    if (!highlightId) return
    const idx = sorted.findIndex((row) => row.id === highlightId)
    if (idx >= 0) setPage(Math.floor(idx / PAGE) + 1)
  }, [highlightId, sorted])

  useEffect(() => {
    if (!highlightId) return
    const el = document.getElementById(`history-row-${highlightId}`)
    el?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [highlightId, safePage])

  function toggleSort(key) {
    setPage(1)
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "at" ? "desc" : "asc" }))
  }

  function SortTh({ id, label, className = "" }) {
    const active = sort.key === id
    return (
      <th scope="col" className={`pb-3 font-medium ${className}`}>
        <button
          type="button"
          onClick={() => toggleSort(id)}
          aria-label={`Sort by ${label}${active ? `, ${sort.dir}ending` : ""}`}
          className="inline-flex items-center gap-1 rounded outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        >
          {label}
          {active ? (
            sort.dir === "asc" ? (
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
            )
          ) : null}
        </button>
      </th>
    )
  }

  const emptyCopy = (
    <div className="px-2 py-10 text-center">
      <p className="text-[15px] font-semibold text-slate-800">No activity in this period</p>
      <p className="mt-1 text-[13px] text-slate-500">This tenant has no remediations in the activity log.</p>
    </div>
  )

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Activity log</h2>
          <p className="text-[12px] text-slate-500">All time</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {headerAction}
          {rows.length > 0 && (
            <button
              type="button"
              onClick={() => exportHistoryCsv(sorted)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[13px] font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          )}
        </div>
      </div>

      {showPortfolioTotals && rows.length > 0 && (
        <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-[12px]" aria-label="Activity totals, all time">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Attempted", totals.attempted],
              ["Succeeded", totals.succeeded],
              ["Rolled back", totals.rolledBack],
              ["Escalated", totals.escalated],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-500">{k}</p>
                <p className="font-semibold text-slate-800">{v.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-200/80 pt-2 sm:grid-cols-4">
            {[
              ["Approved", totals.approved],
              ["Rejected", totals.rejected],
              ["Manual fixes", totals.manualFixes],
              ["Dismissed", totals.dismissed],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-500">{k}</p>
                <p className="font-semibold text-slate-800">{v.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        emptyCopy
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Actor" className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
              {ACTOR_FILTERS.map((opt, index) => {
                const pressed = actor === opt.id
                return (
                  <button
                    key={opt.label}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => {
                      setPage(1)
                      onFilter("actor", opt.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                      e.preventDefault()
                      const next = e.key === "ArrowRight" ? (index + 1) % ACTOR_FILTERS.length : (index + ACTOR_FILTERS.length - 1) % ACTOR_FILTERS.length
                      setPage(1)
                      onFilter("actor", ACTOR_FILTERS[next].id)
                    }}
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                      pressed ? "bg-white text-[#5b4cf0] shadow-sm" : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <FilterMenu
              label="Outcome"
              options={["Fixed", "Rolled back", "Escalated", "Approved unchanged", "Rejected", "Manually applied", "Dismissed"]}
              value={outcome}
              onChange={(v) => {
                setPage(1)
                onFilter("outcome", v)
              }}
            />
            <FilterMenu
              label="Event"
              options={[
                "Fixed",
                "Rolled back",
                "Escalated",
                "Approved fix",
                "Rejected fix",
                "Manual remediation",
                "Manual rollback",
                "Reassigned",
                "Snoozed",
                "Dismissed",
                "Threshold changed",
              ]}
              value={event}
              onChange={(v) => {
                setPage(1)
                onFilter("event", v)
              }}
            />
            {isGlobal && (
              <FilterMenu
                label="Tenant"
                searchable
                options={tenants}
                value={tenant}
                onChange={(v) => {
                  setPage(1)
                  onFilter("tenant", v)
                }}
              />
            )}
            <FilterMenu
              label="Approver"
              options={approvers}
              value={approver}
              onChange={(v) => {
                setPage(1)
                onFilter("approver", v)
              }}
            />
            <FilterMenu
              label="SLA"
              options={["SLA breached"]}
              value={sla}
              onChange={(v) => {
                setPage(1)
                onFilter("sla", v)
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="sticky top-0 z-10 bg-white text-[11.5px] text-slate-400">
                <tr>
                  <SortTh id="at" label="Timestamp" />
                  <SortTh id="tenantName" label="Tenant" />
                  <SortTh id="issue" label="Issue" />
                  <SortTh id="event" label="Event" />
                  <SortTh id="actor" label="Actor" />
                  <SortTh id="outcome" label="Outcome" />
                  <SortTh id="reason" label="Reason" />
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-800">
                {slice.map((row) => {
                  const focused = highlightId === row.id
                  const showChange = Boolean(row.diff?.length)
                  return (
                    <tr
                      key={row.id}
                      id={`history-row-${row.id}`}
                      aria-selected={focused}
                      className={`border-t border-slate-100 ${focused ? "bg-[#f7f6ff] ring-2 ring-inset ring-[#6d5cff]/50" : ""}`}
                    >
                      <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600">{formatTs(row.at)}</td>
                      <td className="py-2.5 pr-3">{row.tenantName}</td>
                      <td className="py-2.5 pr-3">{row.issue}</td>
                      <td className="py-2.5 pr-3">
                        <EventChip row={row} />
                        {showChange && (
                          <button
                            type="button"
                            onClick={() => onViewRollback(row)}
                            className="ml-2 text-[12px] font-medium text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                          >
                            View change
                          </button>
                        )}
                        {row.outcome === "Rolled back" && !showChange && (
                          <button
                            type="button"
                            onClick={() => onViewRollback(row)}
                            className="ml-2 text-[12px] font-medium text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                          >
                            View reason
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5">
                          {isAiHistoryRow(row) ? (
                            <UserRound className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          ) : (
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f1ff] text-[9px] font-semibold text-[#6d5cff]"
                              role="img"
                              aria-label={row.actor ?? row.approvedBy}
                            >
                              {(row.actor ?? row.approvedBy)
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          )}
                          <span>{row.actor ?? row.approvedBy}</span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        {row.outcome}
                        {row.slaBreached && (
                          <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800">
                            SLA breached
                          </span>
                        )}
                      </td>
                      <td className="max-w-[240px] py-2.5 text-[12.5px] text-slate-600">{row.reason ?? "—"}</td>
                    </tr>
                  )
                })}
                {slice.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                      No actions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-[12px] text-slate-600">
              <p>
                {(safePage - 1) * PAGE + 1}–{Math.min(safePage * PAGE, sorted.length)} of {sorted.length.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-lg border border-slate-200 px-3 font-medium outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="h-8 rounded-lg border border-slate-200 px-3 font-medium outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
