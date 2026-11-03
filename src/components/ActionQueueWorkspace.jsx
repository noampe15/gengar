import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, ArrowDown, ArrowUp, MoreVertical, Search, Timer, Undo2 } from "lucide-react"
import QueueCard, { QueueCardSkeleton } from "./QueueCard"
import InfoTooltip from "./InfoTooltip"
import AssignMenu from "./AssignMenu"
import FilterMenu from "./FilterMenu"
import TenantHoverList from "./TenantHoverList"
import { SeverityBadge } from "./Badges"
import {
  QUEUE_AGE_BUCKETS,
  QUEUE_AI_STATUSES,
  mspTenants,
  queueBlastCount,
  slaDeadlineStatus,
  sortWorkspaceQueue,
} from "../mspDashboard"

const GRID =
  "minmax(0, 3.2fr) 1.6fr 1.5fr 1.4fr 1.2fr 215px"
const GRID_BULK =
  "32px minmax(0, 3.2fr) 1.6fr 1.5fr 1.4fr 1.2fr 215px"

const COLUMNS = [
  { key: "issue", label: "Issue", sortable: true, defaultDir: "asc" },
  { key: "blast", label: "Blast radius", sortable: true, defaultDir: "desc" },
  { key: "sla", label: "SLA", sortable: true, defaultDir: "asc" },
  { key: "confidence", label: "AI confidence", sortable: true, defaultDir: "desc" },
  { key: "owner", label: "Owner", sortable: false },
  { key: "action", label: "Action", sortable: false },
]

function useWide(min = 1100) {
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(`(min-width: ${min}px)`).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${min}px)`)
    const onChange = () => setWide(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [min])
  return wide
}

function gridStyle(bulkMode) {
  return {
    display: "grid",
    gridTemplateColumns: bulkMode ? GRID_BULK : GRID,
    columnGap: 18,
    paddingLeft: 22,
    paddingRight: 22,
  }
}

function SortHeader({ col, sort, onSort }) {
  const active = sort.key === col.key
  const ariaSort = !col.sortable || sort.key === "rank" ? "none" : active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
  return (
    <div role="columnheader" aria-sort={ariaSort} className="flex min-w-0 items-center">
      {col.sortable ? (
        <button
          type="button"
          onClick={() => onSort(col)}
          className="inline-flex min-w-0 items-center gap-1 text-left text-[12px] font-semibold text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        >
          <span className="truncate">{col.label}</span>
          {active && sort.key !== "rank" ? (
            sort.dir === "asc" ? (
              <ArrowUp className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-3 w-3 shrink-0" aria-hidden="true" />
            )
          ) : null}
        </button>
      ) : (
        <span className="text-[12px] font-semibold text-slate-500">{col.label}</span>
      )}
    </div>
  )
}

function enrichQueueTenants(item) {
  const raw = item.affectedTenants?.length
    ? item.affectedTenants
    : (item.tenantNames ?? []).map((name, i) => ({ id: `${item.id}-${i}`, name, initials: name.slice(0, 2).toUpperCase() }))
  return raw.map((t) => {
    const full = mspTenants.find((row) => row.id === t.id || row.name === t.name)
    return full ? { ...t, ...full } : t
  })
}

function BlastCell({ item, onOpenTenant }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const ref = useRef(null)
  const hideTimer = useRef(null)
  const popupId = `blast-tenants-${item.id}`
  const tenants = enrichQueueTenants(item)
  const count = tenants.length || queueBlastCount(item)
  const extra = Math.max(0, count - 2)
  const preview = tenants.slice(0, 2).map((t) => t.name).join(", ")

  function place() {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = 352
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 12)
    setPos({ top: rect.bottom, left, width })
  }

  function show() {
    window.clearTimeout(hideTimer.current)
    place()
    setOpen(true)
  }

  function hide() {
    hideTimer.current = window.setTimeout(() => setOpen(false), 80)
  }

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  return (
    <div className="relative z-0 min-w-0 hover:z-[90] focus-within:z-[90]" ref={ref}>
      <button
        type="button"
        className="w-full min-w-0 rounded-md text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        aria-expanded={open}
        aria-controls={popupId}
        aria-label={`${count} ${count === 1 ? "tenant" : "tenants"}. Show full list.`}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={(e) => {
          if (!e.relatedTarget || !document.getElementById(popupId)?.contains(e.relatedTarget)) hide()
        }}
      >
        <p className="text-[13px] font-bold text-slate-900">
          {count} {count === 1 ? "tenant" : "tenants"}
        </p>
        <p className="text-[11.5px] leading-tight text-slate-500">
          {preview}
          {extra > 0 ? ` +${extra} more` : ""}
        </p>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            id={popupId}
            role="region"
            aria-label="Blast radius tenants"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="fixed z-[80] pt-1"
            onMouseEnter={show}
            onMouseLeave={hide}
            onClick={(e) => e.stopPropagation()}
          >
            <TenantHoverList tenants={tenants} label="Blast radius" onOpenTenant={onOpenTenant} />
          </div>,
          document.body,
        )}
    </div>
  )
}

function SlaCell({ breachAt, now }) {
  const status = slaDeadlineStatus(breachAt, now)
  const Icon = status.kind === "breached" ? AlertTriangle : Timer
  const tone =
    status.tone === "red"
      ? "text-rose-800"
      : status.tone === "amber"
        ? "text-amber-800"
        : "text-slate-700"
  return (
    <p className={`inline-flex items-start gap-1.5 text-[12.5px] font-medium leading-snug ${tone}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status.text}</span>
    </p>
  )
}

function ConfidenceCell({ item }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold text-slate-900">{item.confidence}%</span>
        <span className="relative h-1.5 w-[54px] overflow-hidden rounded-full bg-[#EEF0F6]" aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#A99BFF] to-[#6d5cff]"
            style={{ width: `${item.confidence}%` }}
          />
        </span>
      </div>
      <span
        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          item.reversible ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
        }`}
      >
        {item.reversible ? <Undo2 className="h-3 w-3" aria-hidden="true" /> : <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
        {item.reversible ? "Reversible" : "Irreversible"}
      </span>
    </div>
  )
}

function OwnerCell({ owner }) {
  if (!owner) {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-[12.5px] text-slate-600">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-[11px] font-semibold text-slate-500"
          aria-hidden="true"
        >
          ?
        </span>
        Unassigned
      </span>
    )
  }
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[12.5px] text-slate-700">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[10px] font-semibold text-[#6d5cff]">
        {owner.initials}
      </span>
      <span className="truncate">{owner.name}</span>
    </span>
  )
}

function RowMenu({ item, onAssign, onSnooze, onDismiss }) {
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!menu) return
    function onDoc(e) {
      if (ref.current?.contains(e.target)) return
      if (e.target.closest?.('[aria-label="Assign to"]')) return
      setMenu(false)
    }
    function onKey(e) {
      if (e.key === "Escape") setMenu(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [menu])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={menu}
        onClick={(e) => {
          e.stopPropagation()
          setMenu((v) => !v)
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu && (
        <div className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <AssignMenu
            label="Assign"
            ariaLabel={`Assign ${item.issue}`}
            align="right"
            onSelect={(person) => {
              onAssign(item, person)
              setMenu(false)
            }}
            className="block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
          />
          {[
            ["Snooze 1h", () => onSnooze(item)],
            ["Dismiss", () => onDismiss(item)],
          ].map(([label, fn]) => (
            <button
              key={label}
              type="button"
              className="block w-full px-3 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-50"
              onClick={(e) => {
                e.stopPropagation()
                fn()
                setMenu(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ActionQueueWorkspace({
  items,
  filterChips,
  onClearFilters,
  selectedId,
  onReview,
  onAssign,
  onSnooze,
  onDismiss,
  onBulkApprove,
  onBulkAssign,
  onRequestAccess,
  search = "",
  onSearch,
  scope = "global",
  queueAiStatus,
  queueAge,
  onQueueAiStatus,
  onQueueAge,
  headerAction = null,
  onOpenTenant,
}) {
  const wide = useWide(1100)
  const [now, setNow] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [bulkMode, setBulkMode] = useState(false)
  const [checked, setChecked] = useState(() => new Set())
  const [sort, setSort] = useState({ key: "rank", dir: "desc" })
  const [confirming, setConfirming] = useState(false)

  const ranked = useMemo(() => sortWorkspaceQueue(items, sort.key, sort.dir, now), [items, sort, now])
  const selectedItems = ranked.filter((row) => checked.has(row.id))
  const allChecked = ranked.length > 0 && ranked.every((row) => checked.has(row.id))

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 280)
    const tick = window.setInterval(() => setNow(Date.now()), 60000)
    return () => {
      window.clearTimeout(t)
      window.clearInterval(tick)
    }
  }, [])

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setChecked((prev) => {
      if (ranked.every((row) => prev.has(row.id))) return new Set()
      return new Set(ranked.map((row) => row.id))
    })
  }

  function onSort(col) {
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, dir: col.defaultDir }
      if (prev.dir === col.defaultDir) return { key: col.key, dir: col.defaultDir === "asc" ? "desc" : "asc" }
      return { key: "rank", dir: "desc" }
    })
  }

  function openRow(item) {
    if (item.cta === "request-access") onRequestAccess?.(item)
    else onReview(item)
  }

  const inScopeLabel = scope === "tenant" ? `${ranked.length} in scope` : `${ranked.length} of 78 in scope`

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <header className="shrink-0 px-[22px] pb-3 pt-[18px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[16px] font-semibold text-slate-900">Action queue</h2>
              <p className="inline-flex items-center gap-1 text-[12px] text-slate-600" data-pin="queue-rank">
                Ranked by SLA risk × tenants affected
                <InfoTooltip label="How the queue is ranked">
                  Score = (1 / hours to RTO breach) × tenants affected. A High item hitting 14 tenants can outrank a
                  Critical hitting one. Already-breached items rank first, then by how overdue they are × blast radius.
                </InfoTooltip>
              </p>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-600">Requires human-in-the-loop approval</p>
          </div>
          {headerAction}
        </div>
        <div className="mt-[14px] flex flex-wrap items-center gap-2">
          {typeof onSearch === "function" && (
            <div className="relative w-full max-w-[340px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                aria-label="Search issues or tenants"
                placeholder="Search issues or tenants"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
              />
            </div>
          )}
          <span className="text-[12px] text-slate-600">{inScopeLabel}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            Needs human approval
            <InfoTooltip label="Why these items need human approval">Auto-apply is blocked for these items</InfoTooltip>
          </span>
          {filterChips.map((chip) => (
            <span key={chip} className="rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#5b4cf0]">
              {chip}
            </span>
          ))}
          <button
            type="button"
            className="text-[12px] font-medium text-[#6d5cff] underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
          {typeof onQueueAiStatus === "function" && (
            <>
              <FilterMenu label="AI status" options={QUEUE_AI_STATUSES} value={queueAiStatus} onChange={onQueueAiStatus} />
              <FilterMenu label="Age" options={QUEUE_AGE_BUCKETS} value={queueAge} onChange={onQueueAge} />
            </>
          )}
          <button
            type="button"
            data-pin="queue-bulk"
            onClick={() => {
              setBulkMode((v) => !v)
              setChecked(new Set())
              setConfirming(false)
            }}
            className={`ml-auto inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
              bulkMode ? "border-[#6d5cff] bg-[#f3f1ff] text-[#6d5cff]" : "border-slate-200 text-slate-600"
            }`}
          >
            Select multiple
          </button>
        </div>
      </header>

      {wide ? (
        <div className="min-h-0 flex-1 overflow-auto" role="table" aria-label="Action queue">
          <div
            role="row"
            className="sticky top-0 z-10 flex h-[38px] items-center border-y border-slate-200/80 bg-[#FAF9FD]"
            style={gridStyle(bulkMode)}
          >
            {bulkMode && (
              <div role="columnheader" className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#6d5cff]"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all issues"
                />
              </div>
            )}
            {COLUMNS.map((col) => (
              <SortHeader key={col.key} col={col} sort={sort} onSort={onSort} />
            ))}
          </div>
          <div role="rowgroup">
            {loading
              ? [1, 2, 3, 4].map((k) => (
                  <div key={k} className="h-[88px] border-b border-slate-100 px-[22px] py-3">
                    <div className="hunt-shimmer h-4 w-2/3 rounded-full" />
                    <div className="hunt-shimmer mt-2 h-3 w-1/2 rounded-full" />
                  </div>
                ))
              : ranked.map((item, idx) => (
                  <div
                    key={item.id}
                    role="row"
                    tabIndex={0}
                    data-pin={idx === 0 ? "queue-card" : undefined}
                    aria-selected={selectedId === item.id}
                    onClick={() => openRow(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        openRow(item)
                      }
                    }}
                    className={`relative grid min-h-[88px] cursor-pointer items-center border-b border-slate-100 outline-none hover:bg-[#f7f6ff] focus-visible:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6d5cff] ${
                      selectedId === item.id ? "bg-[#f7f6ff]" : "bg-white"
                    }`}
                    style={gridStyle(bulkMode)}
                  >
                    {bulkMode && (
                      <div role="cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#6d5cff]"
                          checked={checked.has(item.id)}
                          onChange={() => toggle(item.id)}
                          aria-label={`Select ${item.issue}`}
                        />
                      </div>
                    )}
                    <div role="cell" className="min-w-0 py-2.5">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="min-w-0 text-[14px] font-bold leading-snug text-slate-900">{item.issue}</p>
                        <SeverityBadge severity={item.priority} label={`${item.score} ${item.priority}`} />
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-slate-500">
                        <span className="font-medium">AI would: </span>
                        {item.fixSummary}
                      </p>
                      {item.reason && (
                        <span className="mt-1 inline-flex max-w-full truncate rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#5b4cf0]">
                          {item.reason}
                        </span>
                      )}
                    </div>
                    <div role="cell" className="min-w-0">
                      <BlastCell item={item} onOpenTenant={onOpenTenant} />
                    </div>
                    <div role="cell" className="min-w-0">
                      <SlaCell breachAt={item.breachAt} now={now} />
                    </div>
                    <div role="cell" className="min-w-0">
                      <ConfidenceCell item={item} />
                    </div>
                    <div role="cell" className="min-w-0">
                      <OwnerCell owner={item.owner} />
                    </div>
                    <div role="cell" className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openRow(item)}
                        className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#6d5cff] px-2.5 text-[12px] font-semibold text-white outline-none hover:bg-[#5b4cf0] focus-visible:ring-2 focus-visible:ring-[#6d5cff] focus-visible:ring-offset-2"
                      >
                        {item.cta === "request-access" ? "Request access" : "Review Global Fix"}
                      </button>
                      <RowMenu item={item} onAssign={onAssign} onSnooze={onSnooze} onDismiss={onDismiss} />
                    </div>
                  </div>
                ))}
            {!loading && ranked.length === 0 && (
              <p className="px-[22px] py-10 text-center text-sm text-slate-600">No escalations match the current filters.</p>
            )}
          </div>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
          {loading
            ? [1, 2, 3].map((k) => <QueueCardSkeleton key={k} />)
            : ranked.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  bulkMode={bulkMode}
                  checked={checked.has(item.id)}
                  onCheck={toggle}
                  onReview={onReview}
                  onAssign={onAssign}
                  onSnooze={onSnooze}
                  onDismiss={onDismiss}
                  onRequestAccess={onRequestAccess}
                  now={now}
                  scope={scope}
                />
              ))}
          {!loading && ranked.length === 0 && (
            <li className="py-10 text-center text-sm text-slate-600">No escalations match the current filters.</li>
          )}
        </ul>
      )}

      {bulkMode && (
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white/95 px-[22px] py-2.5 backdrop-blur">
          <span className="text-[12.5px] font-medium text-slate-700">
            {selectedItems.length} selected
          </span>
          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={() => setConfirming(true)}
            className="inline-flex h-8 items-center rounded-full bg-[#6d5cff] px-3 text-[12px] font-semibold text-white outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            Approve all similar
          </button>
          <AssignMenu
            label="Assign"
            ariaLabel="Assign selected items"
            disabled={selectedItems.length === 0}
            onSelect={(person) => onBulkAssign(selectedItems, person)}
            className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-[12px] font-medium text-slate-700 outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          />
          <button
            type="button"
            onClick={() => {
              setBulkMode(false)
              setChecked(new Set())
              setConfirming(false)
            }}
            className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-[12px] font-medium text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            Cancel
          </button>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-4" role="presentation" onClick={() => setConfirming(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-similar-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="approve-similar-title" className="text-[16px] font-semibold text-slate-900">
              Approve all similar?
            </h3>
            <p className="mt-1 text-[13px] text-slate-600">
              {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} will be approved unchanged.
            </p>
            <ul className="mt-3 max-h-48 space-y-1.5 overflow-auto text-[13px] text-slate-700">
              {selectedItems.map((row) => (
                <li key={row.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium">{row.issue}</span>
                  <span className="mt-0.5 block text-[12px] text-slate-500">
                    {queueBlastCount(row)} tenants · {row.confidence}% confidence
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-[13px] font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkApprove(selectedItems)
                  setConfirming(false)
                  setChecked(new Set())
                  setBulkMode(false)
                }}
                className="inline-flex h-9 items-center rounded-lg bg-[#6d5cff] px-3 text-[13px] font-semibold text-white"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
