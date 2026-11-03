import { useMemo, useState } from "react"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import CopilotBar from "./components/CopilotBar"
import AiEfficiencyHero from "./components/AiEfficiencyHero"
import PortfolioHealth from "./components/PortfolioHealth"
import SlaPerformance from "./components/SlaPerformance"
import ActionQueueRail from "./components/ActionQueueRail"
import TenantOverview from "./components/TenantOverview"
import DecisionDrawer from "./components/DecisionDrawer"
import InvestigationDrawer from "./components/InvestigationDrawer"
import RemediationModal from "./components/RemediationModal"
import TenantsRoster from "./components/TenantsRoster"
import TenantDetail from "./components/TenantDetail"
import ResourcesPage from "./components/ResourcesPage"
import RemediationPage from "./components/RemediationPage"
import SettingsPage from "./components/SettingsPage"
import { applyHunt, copilotBanner, parseCopilotQuery } from "./copilot"
import {
  applyPortfolio,
  applyTenant,
  businessUnits,
  buildRemediationQueue,
  clusterRisksByIssue,
  deficitRows,
  environmentRiskLevel,
  expandSharedIssues,
  GLOBAL_MSP,
  healthyResources,
  risks,
  tenants,
} from "./data"
import { MSP_INDUSTRIES, exportHistoryCsv, historyRowForActivity, mspHistory, mspQueueItems, mspTenants, tenantOverviewFor } from "./mspDashboard"

const ALL_CLIENT_IDS = tenants.map((item) => item.id)
const SCOPE_TENANTS = [GLOBAL_MSP, ...tenants]
const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"]

function uniqueInOrder(values) {
  const seen = new Set()
  const out = []
  for (const value of values) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function uniqueByResourceName(rows) {
  const best = new Map()
  for (const row of rows) {
    const prev = best.get(row.name)
    if (!prev || row.score > prev.score) best.set(row.name, row)
  }
  const added = new Set()
  const out = []
  for (const row of rows) {
    if (added.has(row.name)) continue
    added.add(row.name)
    out.push(best.get(row.name))
  }
  return out
}

function applyFilters(list, filters) {
  let next = list.filter((row) => {
    if (
      filters.resource &&
      row.name !== filters.resource &&
      !(row.relatedResources ?? []).includes(filters.resource)
    ) {
      return false
    }
    if (filters.type && row.type !== filters.type) return false
    if (filters.issue && (row.issue || "") !== filters.issue) return false
    if (filters.provider) {
      const providers = (row.affectedProviders ?? []).map((item) => item.name)
      if (providers.length ? !providers.includes(filters.provider) : row.provider !== filters.provider) {
        return false
      }
    }
    if (filters.businessUnit && row.businessUnit !== filters.businessUnit) return false
    if (filters.priority && row.priority !== filters.priority) return false
    return true
  })

  switch (filters.sort) {
    case "score-asc":
      next = [...next].sort((a, b) => a.score - b.score)
      break
    case "rto-desc":
      next = [...next].sort((a, b) => b.rtoDelta - a.rtoDelta)
      break
    case "name-asc":
      next = [...next].sort((a, b) =>
        (a.cluster ? a.issue || a.name : a.name).localeCompare(b.cluster ? b.issue || b.name : b.name),
      )
      break
    default:
      next = [...next].sort((a, b) => b.score - a.score)
  }
  return next
}

export default function App() {
  const [page, setPage] = useState("overview")
  const [tenantId, setTenantId] = useState(GLOBAL_MSP.id)
  const [clientIds, setClientIds] = useState(ALL_CLIENT_IDS)
  const [range, setRange] = useState("Last 7 days")
  const jitter = 0
  const [investigating, setInvestigating] = useState(null)
  const [remediating, setRemediating] = useState(null)
  const [reviewing, setReviewing] = useState(null)
  const [mspItems, setMspItems] = useState(mspQueueItems)
  const [ownerOverrides, setOwnerOverrides] = useState({})
  const [rosterTenantId, setRosterTenantId] = useState(null)
  const [tenantsStatusFilter, setTenantsStatusFilter] = useState("all")
  const [toast, setToast] = useState("")
  const [signedIn, setSignedIn] = useState(true)
  const [copilotQuery, setCopilotQuery] = useState("")
  const [hunting, setHunting] = useState(false)
  const [remediationView, setRemediationView] = useState("queue")
  const [queueSearch, setQueueSearch] = useState("")
  const [historyOutcome, setHistoryOutcome] = useState("")
  const [historyTenant, setHistoryTenant] = useState("")
  const [historyApprover, setHistoryApprover] = useState("")
  const [historySla, setHistorySla] = useState("")
  const [historyActor, setHistoryActor] = useState("")
  const [historyEvent, setHistoryEvent] = useState("")
  const [historyFocusId, setHistoryFocusId] = useState("")
  const [queueAiStatus, setQueueAiStatus] = useState("")
  const [queueAge, setQueueAge] = useState("")
  const [tenantPatches, setTenantPatches] = useState({})
  const [rollbackEntry, setRollbackEntry] = useState(null)
  const [filters, setFilters] = useState({
    resource: "",
    type: "",
    issue: "",
    provider: "",
    businessUnit: "",
    priority: "",
    sort: "score-desc",
  })

  const isGlobal = tenantId === GLOBAL_MSP.id
  const roster = useMemo(
    () => mspTenants.map((row) => (ownerOverrides[row.id] ? { ...row, owner: ownerOverrides[row.id] } : row)),
    [ownerOverrides],
  )

  const activeTenants = useMemo(() => {
    if (!isGlobal) {
      return tenants.filter((item) => item.id === tenantId)
    }
    const selected = new Set(clientIds)
    return tenants.filter((item) => selected.has(item.id))
  }, [isGlobal, tenantId, clientIds])

  const { units: liveUnits, deficits: liveDeficits, risks: liveRisks, healthy: liveHealthy } = useMemo(() => {
    const opts = { businessUnits, deficitRows, risks, healthyResources, jitter, range }
    if (!isGlobal) {
      const tenant = tenants.find((item) => item.id === tenantId) ?? tenants[0]
      return applyTenant(tenant, opts)
    }
    return applyPortfolio(activeTenants, opts)
  }, [isGlobal, tenantId, activeTenants, jitter, range])

  const filtered = useMemo(() => {
    const hunt = parseCopilotQuery(copilotQuery)
    return applyHunt(applyFilters(liveRisks, filters), hunt)
  }, [liveRisks, filters, copilotQuery])

  const resourceRows = useMemo(() => {
    const hunt = parseCopilotQuery(copilotQuery)
    const findings = expandSharedIssues(filtered)
    const healthy = applyHunt(applyFilters(liveHealthy ?? [], filters), hunt)
    const combined = uniqueByResourceName([...findings, ...healthy])
    switch (filters.sort) {
      case "score-asc":
        return [...combined].sort((a, b) => a.score - b.score)
      case "rto-desc":
        return [...combined].sort((a, b) => b.rtoDelta - a.rtoDelta)
      case "name-asc":
        return [...combined].sort((a, b) => a.name.localeCompare(b.name))
      default:
        return [...combined].sort((a, b) => b.score - a.score)
    }
  }, [filtered, liveHealthy, filters, copilotQuery])

  const issuesByResource = useMemo(() => {
    const map = {}
    for (const row of liveRisks) {
      if (!row.issue) continue
      if (!map[row.name]) map[row.name] = []
      if (map[row.name].some((item) => item.issue === row.issue)) continue
      map[row.name].push({
        issue: row.issue,
        priority: row.priority,
        score: row.score,
      })
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => b.score - a.score)
    }
    return map
  }, [liveRisks])

  const clustered = useMemo(() => {
    if (isGlobal) {
      const hunt = parseCopilotQuery(copilotQuery)
      return applyHunt(applyFilters(buildRemediationQueue(activeTenants), filters), hunt)
    }
    const groups = clusterRisksByIssue(filtered)
    switch (filters.sort) {
      case "score-asc":
        return [...groups].sort((a, b) => a.score - b.score)
      case "rto-desc":
        return [...groups].sort((a, b) => b.rtoDelta - a.rtoDelta)
      case "name-asc":
        return [...groups].sort((a, b) => (a.issue || a.name).localeCompare(b.issue || b.name))
      default:
        return groups
    }
  }, [isGlobal, activeTenants, filtered, filters, copilotQuery])

  const banner = useMemo(
    () =>
      copilotQuery && !hunting
        ? copilotBanner(copilotQuery, filtered, { clustered, units: liveUnits, global: isGlobal })
        : "",
    [copilotQuery, hunting, filtered, clustered, liveUnits, isGlobal],
  )

  const envRisk = useMemo(() => environmentRiskLevel(liveRisks), [liveRisks])

  const envRiskByTenant = useMemo(() => {
    const map = {}
    const opts = { businessUnits, deficitRows, risks, healthyResources, jitter, range }
    for (const item of tenants) {
      const { risks: tenantRisks } = applyPortfolio([item], opts)
      map[item.id] = environmentRiskLevel(tenantRisks)
    }
    const all = applyPortfolio(tenants, opts)
    map[GLOBAL_MSP.id] = environmentRiskLevel(all.risks)
    return map
  }, [jitter, range])

  const notifications = useMemo(() => {
    const items = []
    if (isGlobal) {
      for (const cluster of clustered) {
        if (cluster.priority !== "Critical" && cluster.priority !== "High") continue
        items.push({
          id: cluster.id,
          title: cluster.issue,
          body: `Affects ${cluster.tenantCount} tenants`,
          time: (cluster.checkedAgo ?? "").replace(/^checked\s+/i, ""),
          priority: cluster.priority,
          risk: cluster,
        })
      }
    } else {
      for (const row of liveRisks) {
        if (row.priority !== "Critical" && row.priority !== "High") continue
        items.push({
          id: row.id,
          title: row.issue,
          body: row.name,
          time: (row.checkedAgo ?? "").replace(/^checked\s+/i, ""),
          priority: row.priority,
          risk: row,
        })
      }
    }
    return items.slice(0, 8)
  }, [isGlobal, clustered, liveRisks])

  const filterOptions = useMemo(() => {
    return {
      resource: uniqueInOrder([
        ...liveRisks.map((row) => row.name),
        ...liveRisks.flatMap((row) => row.relatedResources ?? []),
      ]),
      type: uniqueInOrder(liveRisks.map((row) => row.type)),
      issue: uniqueInOrder([
        ...liveRisks.map((row) => row.issue),
        ...mspItems.map((row) => row.issue),
      ]),
      provider: uniqueInOrder(liveRisks.map((row) => row.provider)),
      businessUnit: uniqueInOrder(liveRisks.map((row) => row.businessUnit)),
      industry: MSP_INDUSTRIES,
      priority: PRIORITY_ORDER,
    }
  }, [liveRisks, mspItems])

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const overview = useMemo(() => (isGlobal ? null : tenantOverviewFor(tenantId, range)), [isGlobal, tenantId, range])

  const mspScoped = useMemo(() => {
    if (!isGlobal) {
      return (overview?.queue ?? [])
        .map((item) => {
          const patch = tenantPatches[`${tenantId}:${item.id}`]
          return patch ? { ...item, ...patch } : item
        })
        .filter((item) => {
          if (item.dismissed) return false
          if (item.snoozeUntil && item.snoozeUntil > Date.now()) return false
          if (filters.priority && item.priority !== filters.priority) return false
          return true
        })
    }
    const tenantName = roster.find((t) => t.id === tenantId)?.name ?? tenants.find((t) => t.id === tenantId)?.name
    const industryIds =
      filters.businessUnit
        ? new Set(roster.filter((t) => t.industry === filters.businessUnit).map((t) => t.id))
        : null
    return mspItems.filter((item) => {
      if (item.dismissed) return false
      if (item.snoozeUntil && item.snoozeUntil > Date.now()) return false
      if (filters.priority && item.priority !== filters.priority) return false
      if (industryIds) {
        return item.affectedTenants?.some((t) => industryIds.has(t.id)) || (item.tenantNames ?? []).some((name) => roster.some((t) => t.name === name && industryIds.has(t.id)))
      }
      return true
    })
  }, [mspItems, isGlobal, tenantId, roster, filters.businessUnit, filters.priority, overview, tenantPatches])

  const mspVisible = useMemo(() => {
    const q = queueSearch.trim().toLowerCase()
    return mspScoped.filter((item) => {
      if (filters.issue && item.issue !== filters.issue) return false
      if (filters.priority && item.priority !== filters.priority) return false
      if (filters.provider) {
        const blob = `${item.issue} ${item.fixSummary} ${item.category}`.toLowerCase()
        const want = filters.provider.toLowerCase()
        const inferred = blob.includes("blob") || blob.includes("azure") ? "azure" : blob.includes("gcp") ? "gcp" : "aws"
        if (!inferred.startsWith(want.slice(0, 3).toLowerCase()) && !blob.includes(want)) return false
      }
      if (q) {
        const hay = [
          item.issue,
          item.fixSummary,
          ...(item.tenantNames ?? []),
          ...(item.affectedTenants ?? []).map((t) => t.name),
        ]
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (queueAiStatus && item.aiStatus !== queueAiStatus) return false
      if (queueAge && item.ageBucket !== queueAge) return false
      return true
    })
  }, [mspScoped, filters.issue, filters.priority, filters.provider, queueSearch, queueAiStatus, queueAge])

  const historyRows = useMemo(() => {
    let rows = mspHistory
    if (!isGlobal) {
      rows = rows.filter((row) => row.tenantId === tenantId)
    } else if (filters.businessUnit) {
      const ids = new Set(roster.filter((t) => t.industry === filters.businessUnit).map((t) => t.id))
      rows = rows.filter((row) => ids.has(row.tenantId))
    }
    return rows
  }, [isGlobal, tenantId, filters.businessUnit, roster])

  const filterChips = useMemo(() => {
    const chips = []
    if (filters.issue) chips.push(`Issue: ${filters.issue}`)
    if (filters.provider) chips.push(`Provider: ${filters.provider}`)
    if (queueAiStatus) chips.push(`AI status: ${queueAiStatus}`)
    if (queueAge) chips.push(`Age: ${queueAge}`)
    return chips
  }, [filters.issue, filters.provider, queueAiStatus, queueAge])

  function flash(message) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2400)
  }

  function patchItem(id, patch) {
    if (!isGlobal) {
      setTenantPatches((prev) => ({
        ...prev,
        [`${tenantId}:${id}`]: { ...(prev[`${tenantId}:${id}`] ?? {}), ...patch },
      }))
      return
    }
    setMspItems((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function openRemediation(view = "queue") {
    setRemediationView(view)
    setPage("remediation")
  }

  function openHistoryNav(arg = {}) {
    const opts = typeof arg === "string" ? { outcome: arg } : (arg ?? {})
    setHistoryOutcome(opts.outcome ?? "")
    setHistoryActor(opts.actor ?? "")
    setHistoryEvent(opts.event ?? "")
    setHistoryTenant(opts.tenant ?? "")
    setHistoryApprover("")
    setHistorySla(opts.sla ?? "")
    setHistoryFocusId(opts.focusId ?? "")
    openRemediation("history")
  }

  function openHistoryRow(row, { rollback = false } = {}) {
    setHistoryOutcome("")
    setHistoryTenant("")
    setHistoryApprover("")
    setHistorySla("")
    setHistoryActor("")
    setHistoryEvent("")
    setHistoryFocusId(row?.id ?? "")
    setReviewing(null)
    setRollbackEntry(rollback && row ? row : null)
    openRemediation("history")
  }

  const queueHandlers = {
    onReview: (item) => {
      setRollbackEntry(null)
      setReviewing(item)
    },
    onAssign: (item, person) => {
      patchItem(item.id, { owner: person })
      flash(`Assigned ${item.issue} to ${person.name}`)
    },
    onSnooze: (item) => {
      patchItem(item.id, { snoozeUntil: Date.now() + 60 * 60 * 1000, breachAt: item.breachAt + 60 * 60 * 1000 })
      flash("Snoozed 1 hour")
    },
    onDismiss: (item) => {
      patchItem(item.id, { dismissed: true })
      flash("Dismissed from the action queue")
    },
    onBulkApprove: (rows) => {
      rows.forEach((row) => patchItem(row.id, { dismissed: true }))
      flash(`Approved ${rows.length} similar remediations`)
    },
    onBulkAssign: (rows, person) => {
      rows.forEach((row) => patchItem(row.id, { owner: person }))
      flash(`Assigned ${rows.length} items to ${person.name}`)
    },
    onRequestAccess: (item) => {
      flash(`Access request sent for ${item.issue}`)
    },
  }

  function onTenantChange(id) {
    setTenantId(id)
    setInvestigating(null)
    setRemediating(null)
    if (id === GLOBAL_MSP.id) setClientIds(ALL_CLIENT_IDS)
    else setClientIds([id])
    setFilters((prev) => ({ ...prev, resource: "" }))
    setQueueAiStatus("")
    setQueueAge("")
  }

  function onCopilotHunt(query) {
    setHunting(true)
    if (page !== "overview") setPage("overview")
    window.setTimeout(() => {
      setCopilotQuery(query)
      setHunting(false)
    }, 1100)
  }

  function onExport() {
    if (page === "remediation" && remediationView === "history") {
      exportHistoryCsv(historyRows)
      return
    }
    if (isGlobal) {
      const header = [
        "Issue",
        "Tenant",
        "Provider",
        "RTO Delta",
        "Priority",
        "Score",
      ]
      const lines = clustered.map((row) =>
        [
          row.issue,
          (row.affectedTenants ?? []).map((item) => item.name).join("; "),
          (row.affectedProviders ?? []).map((item) => item.name).join("; ") || row.provider,
          `+${row.rtoDelta}h`,
          row.priority,
          row.score,
        ]
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      const csv = [header.join(","), ...lines].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "beacon-msp-top-risks.csv"
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const header = [
      "Resource",
      "Type",
      "Business Unit",
      "Issue",
      "Provider",
      "RTO Delta",
      "TBR",
      "Priority",
      "Score",
    ]
    const lines = filtered.map((row) =>
      [
        row.name,
        row.type,
        row.businessUnit,
        row.issue,
        row.provider,
        `+${row.rtoDelta}h`,
        row.tbr,
        row.priority,
        row.score,
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    const csv = [header.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "beacon-top-risks.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const scopeName = isGlobal
    ? GLOBAL_MSP.name
    : (tenants.find((t) => t.id === tenantId)?.name ?? "Tenant")
  const rosterName = roster.find((t) => t.id === rosterTenantId)?.name
  const pageTitle =
    page === "overview"
      ? "Overview"
      : page === "remediation"
        ? "Remediation"
        : page === "settings"
          ? "Settings"
          : isGlobal
            ? (rosterTenantId ? "Summary" : "Tenants")
            : "Resources"
  const breadcrumb = !isGlobal
    ? ["Tenants", scopeName]
    : page === "tenants" && rosterTenantId
      ? [GLOBAL_MSP.name, "Tenants", rosterName, "Summary"]
      : [scopeName]

  function onSetPage(id) {
    setPage(id)
    setRosterTenantId(null)
    if (id === "tenants") {
      setFilters((prev) =>
        MSP_INDUSTRIES.includes(prev.businessUnit) ? prev : { ...prev, businessUnit: "" },
      )
    } else if (id === "overview" && MSP_INDUSTRIES.includes(filters.businessUnit)) {
      setFilters((prev) => ({ ...prev, businessUnit: "" }))
    }
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f4f5f8] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-[16px] font-semibold tracking-tight text-slate-900">Beacon</p>
          <p className="mt-1 text-[13px] text-slate-600">You have been signed out.</p>
          <button
            type="button"
            onClick={() => setSignedIn(true)}
            className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-full bg-[#6d5cff] px-4 text-[13px] font-semibold text-white outline-none hover:bg-[#5b4cf0] focus-visible:ring-2 focus-visible:ring-[#6d5cff] focus-visible:ring-offset-2"
          >
            Sign in as Molly Reid
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-[#f4f5f8]">
      <Sidebar
        page={page}
        setPage={onSetPage}
        isGlobal={isGlobal}
        tenants={SCOPE_TENANTS}
        tenantId={tenantId}
        onTenantChange={onTenantChange}
        envRisk={envRisk}
        envRiskByTenant={envRiskByTenant}
      />
      <div className="flex min-w-0 flex-1 flex-col">
      <Header
        pageTitle={pageTitle}
        breadcrumb={breadcrumb}
        range={range}
        setRange={setRange}
        notifications={notifications}
        onOpenNotification={(item) => {
          if (item.risk) setInvestigating(item.risk)
        }}
        page={page}
        filters={filters}
        options={filterOptions}
        setFilter={setFilter}
        isGlobal={isGlobal}
        remediationView={remediationView}
        onLogOut={() => setSignedIn(false)}
      />
      {page !== "settings" && (
        <CopilotBar
          onHunt={onCopilotHunt}
          hunting={hunting}
          banner={banner}
          lastQuery={copilotQuery}
          global={isGlobal}
          placeholder={
            isGlobal
              ? undefined
              : `Ask about ${scopeName}, e.g. Why are 4 fixes waiting on a human?`
          }
          onClear={() => {
            setCopilotQuery("")
            setHunting(false)
          }}
        />
      )}

      <main className="px-3 pb-8 lg:px-4">
        {page === "overview" && isGlobal && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="space-y-4">
                <PortfolioHealth
                  range={range}
                  onOpenStatus={(key) => {
                    setTenantsStatusFilter(key)
                    setRosterTenantId(null)
                    setPage("tenants")
                  }}
                  onOpenTenant={(id) => {
                    setTenantsStatusFilter("all")
                    setPage("tenants")
                    setRosterTenantId(id)
                  }}
                />
                <AiEfficiencyHero
                  range={range}
                  onOpenHistory={(outcome) => {
                    openHistoryNav({ outcome, actor: "AI" })
                  }}
                />
                <SlaPerformance
                  range={range}
                  onOpenBreaches={() => {
                    openHistoryNav({ sla: "SLA breached" })
                  }}
                />
              </div>
              <div className="relative min-h-[28rem] lg:min-h-0">
                <div className="lg:absolute lg:inset-0">
                  <ActionQueueRail
                    compact
                    items={mspScoped}
                    filterChips={[]}
                    onClearFilters={() => {}}
                    selectedId={reviewing?.id}
                    onViewAll={() => openRemediation("queue")}
                    {...queueHandlers}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {page === "overview" && !isGlobal && overview && (
          <TenantOverview
            overview={overview}
            queueItems={mspScoped}
            selectedId={reviewing?.id}
            onHistory={(arg) => openHistoryNav(arg)}
            onActivityAction={(entry) => {
              if (entry.action === "queue") {
                const item = mspScoped.find((row) => row.id === entry.queueId)
                if (item) {
                  setHistoryFocusId("")
                  setRollbackEntry(null)
                  setReviewing(item)
                  openRemediation("queue")
                }
                return
              }
              const row = historyRowForActivity(entry, tenantId)
              if (!row) {
                flash("No matching history row")
                return
              }
              openHistoryRow(row, { rollback: Boolean(entry.openRollback) || Boolean(entry.openChange) })
            }}
            onViewAll={() => openRemediation("queue")}
            onQueueFilter={({ status, age }) => {
              setQueueAiStatus(status ?? "")
              setQueueAge(age ?? "")
              openRemediation("queue")
            }}
            queueHandlers={queueHandlers}
          />
        )}
        {page === "remediation" && (
          <RemediationPage
            view={remediationView}
            onView={setRemediationView}
            queueItems={mspVisible}
            filterChips={filterChips}
            onClearFilters={() => {
              setQueueSearch("")
              setQueueAiStatus("")
              setQueueAge("")
              setFilters((prev) => ({ ...prev, issue: "", provider: "" }))
            }}
            selectedId={reviewing?.id}
            search={queueSearch}
            onSearch={setQueueSearch}
            historyRows={historyRows}
            isGlobal={isGlobal}
            scope={isGlobal ? "global" : "tenant"}
            queueAiStatus={queueAiStatus}
            queueAge={queueAge}
            onQueueAiStatus={isGlobal ? undefined : setQueueAiStatus}
            onQueueAge={isGlobal ? undefined : setQueueAge}
            historyOutcome={historyOutcome}
            historyTenant={historyTenant}
            historyApprover={historyApprover}
            historySla={historySla}
            historyActor={historyActor}
            historyEvent={historyEvent}
            historyFocusId={historyFocusId}
            onHistoryFilter={(key, value) => {
              if (key === "outcome") setHistoryOutcome(value)
              if (key === "tenant") setHistoryTenant(value)
              if (key === "approver") setHistoryApprover(value)
              if (key === "sla") setHistorySla(value)
              if (key === "actor") setHistoryActor(value)
              if (key === "event") setHistoryEvent(value)
            }}
            onViewRollback={(row) => {
              setReviewing(null)
              setRollbackEntry(row)
            }}
            onOpenTenant={(id) => {
              setTenantsStatusFilter("all")
              setPage("tenants")
              setRosterTenantId(id)
            }}
            {...queueHandlers}
          />
        )}
        {page === "tenants" && isGlobal && (
          <div className="space-y-4">
            {rosterTenantId ? (
              <TenantDetail
                tenant={roster.find((t) => t.id === rosterTenantId) ?? roster[0]}
                range={range}
                onBack={() => setRosterTenantId(null)}
                onAssign={(id, person) => {
                  setOwnerOverrides((prev) => ({ ...prev, [id]: person }))
                  flash(`Assigned ${person.name} as owner`)
                }}
                onOpenQueue={(queueId) => {
                  const item = mspItems.find((row) => row.id === queueId)
                  if (!item) {
                    flash("No matching Action queue item")
                    return
                  }
                  setTenantId(GLOBAL_MSP.id)
                  setRollbackEntry(null)
                  setReviewing(item)
                  openRemediation("queue")
                }}
              />
            ) : (
              <TenantsRoster
                tenants={roster}
                statusFilter={tenantsStatusFilter}
                onStatusFilter={setTenantsStatusFilter}
                industry={filters.businessUnit}
                onOpen={setRosterTenantId}
                range={range}
              />
            )}
          </div>
        )}
        {page === "tenants" && !isGlobal && (
          <ResourcesPage
            rows={resourceRows}
            selectedId={investigating?.id ?? remediating?.id}
            issuesByResource={issuesByResource}
            onInvestigate={setInvestigating}
            onRemediate={setRemediating}
          />
        )}
        {page === "settings" && <SettingsPage />}
      </main>

      <InvestigationDrawer
        risk={investigating}
        onClose={() => setInvestigating(null)}
        onRemediate={(row) => {
          setInvestigating(null)
          setRemediating(row)
        }}
      />
      <RemediationModal risk={isGlobal ? null : remediating} onClose={() => setRemediating(null)} />
      <DecisionDrawer
        item={reviewing}
        historyEntry={rollbackEntry}
        onClose={() => {
          setReviewing(null)
          setRollbackEntry(null)
        }}
        onDecide={(action, item) => {
          if (action === "approve") {
            patchItem(item.id, { dismissed: true })
            flash("Approved. Change will apply in the next maintenance window.")
          } else if (action === "reject") {
            patchItem(item.id, { dismissed: true })
            flash("Rejected. Auto-apply remains blocked.")
          } else {
            flash("Requested changes. AI will restage the plan.")
          }
          setReviewing(null)
        }}
      />
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      </div>
    </div>
  )
}
