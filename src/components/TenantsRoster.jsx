import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Search } from "lucide-react"
import { TenantStatusBadge } from "./Badges"
import { formatSlaRemain, HEALTH_RANK, slaUrgency, rangeMeta, tenantActivityInRange } from "../mspDashboard"

const STATUS_CHIPS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "SLA Warning" },
  { id: "secure", label: "Secure" },
]

const COLUMNS = [
  { id: "name", label: "Tenant" },
  { id: "industry", label: "Industry" },
  { id: "health", label: "Status" },
  { id: "openIssues", label: "Open issues" },
  { id: "sla", label: "Next SLA breach" },
  { id: "ai", label: "AI activity" },
  { id: "owner", label: "Owner" },
]

function slaClass(ms) {
  const u = slaUrgency(ms)
  if (u === "red") return "text-rose-700"
  if (u === "amber") return "text-amber-800"
  return "text-slate-600"
}

function slaLabel(ms) {
  const remain = formatSlaRemain(ms)
  if (remain === "None") return "None"
  const u = slaUrgency(ms)
  if (u === "red") return `${remain} remaining (under 1h)`
  if (u === "amber") return `${remain} remaining (under 2h)`
  return `${remain} remaining`
}

export default function TenantsRoster({
  tenants,
  statusFilter,
  onStatusFilter,
  industry,
  onOpen,
  range = "Last 7 days",
}) {
  const [q, setQ] = useState("")
  const [sort, setSort] = useState({ key: "health", dir: "asc" })
  const period = rangeMeta(range).shortLabel

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = tenants.filter((t) => {
      if (statusFilter !== "all" && t.health !== statusFilter) return false
      if (industry && t.industry !== industry) return false
      if (needle && !t.name.toLowerCase().includes(needle) && !t.industry.toLowerCase().includes(needle)) {
        return false
      }
      return true
    })
    const dir = sort.dir === "asc" ? 1 : -1
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sort.key) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "industry":
          cmp = a.industry.localeCompare(b.industry)
          break
        case "openIssues":
          cmp = a.openIssues.length - b.openIssues.length
          break
        case "sla": {
          const av = a.nextBreachAt ?? Number.POSITIVE_INFINITY
          const bv = b.nextBreachAt ?? Number.POSITIVE_INFINITY
          cmp = av - bv
          break
        }
        case "ai": {
          const aa = tenantActivityInRange(a, range)
          const ba = tenantActivityInRange(b, range)
          cmp = aa.fixed + aa.escalated - (ba.fixed + ba.escalated)
          break
        }
        case "owner":
          cmp = (a.owner?.name ?? "Unassigned").localeCompare(b.owner?.name ?? "Unassigned")
          break
        default:
          cmp = HEALTH_RANK[a.health] - HEALTH_RANK[b.health]
          if (cmp === 0) {
            const av = a.nextBreachAt ?? Number.POSITIVE_INFINITY
            const bv = b.nextBreachAt ?? Number.POSITIVE_INFINITY
            cmp = av - bv
          }
      }
      return cmp * dir
    })
    return list
  }, [tenants, statusFilter, industry, q, sort, range])

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      return { key, dir: key === "health" || key === "sla" ? "asc" : "asc" }
    })
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Tenants</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">49 tenants across 3 industries</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search tenants"
            placeholder="Search tenants"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="toolbar" aria-label="Filter by status">
        {STATUS_CHIPS.map((chip) => {
          const on = statusFilter === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={on}
              onClick={() => onStatusFilter(chip.id)}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                on ? "bg-[#f3f1ff] text-[#5b4cf0]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left">
          <thead>
            <tr className="text-[11.5px] font-medium text-slate-500">
              {COLUMNS.map((col) => {
                const active = sort.key === col.id
                return (
                  <th key={col.id} className="pb-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      aria-label={`Sort by ${col.label}`}
                      className="inline-flex items-center gap-1 outline-none hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                    >
                      {col.id === "ai" ? `AI activity (${period})` : col.label}
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
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const remain = t.nextBreachAt == null ? null : t.nextBreachAt - Date.now()
              const activity = tenantActivityInRange(t, range)
              return (
                <tr
                  key={t.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open ${t.name}, ${t.health === "critical" ? "Critical" : t.health === "warning" ? "SLA Warning" : "Secure"}`}
                  onClick={() => onOpen(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onOpen(t.id)
                    }
                  }}
                  className="cursor-pointer border-t border-slate-100 outline-none hover:bg-slate-50/80 focus-visible:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6d5cff]"
                >
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f1ff] text-[9px] font-semibold text-[#6d5cff]">
                        {t.initials}
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-800">{t.name}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-slate-600">{t.industry}</td>
                  <td className="py-3 pr-4">
                    <TenantStatusBadge health={t.health} />
                  </td>
                  <td className="py-3 pr-4 text-[13px] tabular-nums text-slate-800">{t.openIssues.length}</td>
                  <td className={`py-3 pr-4 text-[13px] font-medium ${slaClass(remain)}`}>{slaLabel(remain)}</td>
                  <td className="py-3 pr-4 text-[13px] text-slate-600">
                    Fixed {activity.fixed} · Escalated {activity.escalated}
                  </td>
                  <td className="py-3 text-[13px] text-slate-600">
                    {t.owner ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">
                          {t.owner.initials}
                        </span>
                        {t.owner.name}
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No tenants match the current filters.</p>}
      </div>
    </section>
  )
}
