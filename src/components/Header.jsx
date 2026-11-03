import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, Clock } from "lucide-react"
import { rangeOptions } from "../data"
import { ExtraFilters, headerFiltersActive, visibleFilterKeys } from "./NavFilters"
import AllFiltersPopover from "./AllFiltersPopover"

function NotificationsBell({ items, onOpenNotification }) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState(() => new Set())
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const unread = items.filter((item) => !readIds.has(item.id)).length

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
          open
            ? "border-[#6d5cff]/40 bg-[#f3f1ff] text-[#6d5cff]"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => setReadIds(new Set(items.map((item) => item.id)))}
                className="text-[12px] font-medium text-[#6d5cff] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-slate-400">No notifications</p>
            )}
            {items.map((item) => {
              const unreadItem = !readIds.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReadIds((prev) => new Set(prev).add(item.id))
                    onOpenNotification?.(item)
                    setOpen(false)
                  }}
                  className={`flex w-full gap-3 px-3 py-2.5 text-left hover:bg-slate-50 ${
                    unreadItem ? "bg-[#faf9ff]" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.priority === "Critical" ? "bg-rose-500" : "bg-amber-400"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-slate-800">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-slate-500">{item.body}</span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-slate-400">{item.time}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AccountMenu({ onLogOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-2 rounded-full border bg-white pl-1 pr-2.5 text-[13px] font-medium shadow-sm outline-none hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#6d5cff] sm:pr-3 ${
          open ? "border-[#6d5cff]/40 text-slate-800" : "border-slate-200 text-slate-700"
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6d5cff] text-[11px] font-semibold text-white">
          MR
        </span>
        <span className="hidden max-w-[9rem] truncate sm:inline">Molly Reid</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <p className="px-3 py-2 text-[12px] text-slate-500">Signed in as Molly Reid</p>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-[13px] text-slate-700 outline-none hover:bg-slate-50"
            onClick={() => {
              setOpen(false)
              onLogOut?.()
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Header({
  pageTitle,
  breadcrumb,
  range,
  setRange,
  notifications,
  onOpenNotification,
  page,
  filters,
  options,
  setFilter,
  isGlobal = false,
  remediationView = "queue",
  onLogOut,
}) {
  const extraActive = headerFiltersActive(page, isGlobal, filters, remediationView)
  const showAllFilters = visibleFilterKeys(page, isGlobal, remediationView).length > 0

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#f4f5f8] px-3 py-2.5 lg:px-4">
      <div className="min-w-0">
        {breadcrumb?.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[12px] text-slate-500">
            {breadcrumb.map((crumb, i) => (
              <span key={`${crumb}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <span aria-hidden="true" className="text-slate-300">
                    /
                  </span>
                )}
                <span className={i === breadcrumb.length - 1 ? "font-medium text-slate-700" : ""}>{crumb}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-[16px] font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <label className="relative">
          <span className="sr-only">Date range</span>
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Date range"
            className="h-9 appearance-none rounded-full border border-slate-200 bg-white py-0 pl-9 pr-8 text-[13px] font-medium text-slate-700 shadow-sm outline-none hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          >
            {rangeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        </label>
        {showAllFilters && (
          <AllFiltersPopover size="header" active={extraActive}>
            <ExtraFilters
              page={page}
              filters={filters}
              options={options}
              setFilter={setFilter}
              isGlobal={isGlobal}
              remediationView={remediationView}
            />
          </AllFiltersPopover>
        )}
        <NotificationsBell items={notifications} onOpenNotification={onOpenNotification} />
        <AccountMenu onLogOut={onLogOut} />
      </div>
    </header>
  )
}
