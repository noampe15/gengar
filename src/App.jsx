import { useMemo, useState } from "react"
import DetectionControlPlane from "./components/DetectionControlPlane"
import StackPipeline from "./components/StackPipeline"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import CopilotBar from "./components/CopilotBar"
import DecisionDrawer from "./components/DecisionDrawer"
import InvestigationDrawer from "./components/InvestigationDrawer"
import RemediationModal from "./components/RemediationModal"
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
  ENTERPRISE_SCOPE,
  expandSharedIssues,
  healthyResources,
  risks,
  tenants,
} from "./data"
import { MSP_INDUSTRIES, exportHistoryCsv, mspHistory, mspQueueItems, mspTenants } from "./mspDashboard"
import { drawerItemFor, LINEAGE_NODES, ruleMatchesLineageNode, scenarioFor } from "./detection"

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
  const [range, setRange] = useState("Last 7 days")
  const jitter = 0
  const [investigating, setInvestigating] = useState(null)
  const [remediating, setRemediating] = useState(null)
  const [reviewing, setReviewing] = useState(null)
  const [mspItems, setMspItems] = useState(mspQueueItems)
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
    stack: "",
    lineage: "",
    sort: "score-desc",
  })

  const isGlobal = true
  const tenantId = ENTERPRISE_SCOPE.id
  const roster = mspTenants
  const activeTenants = tenants

  const { units: liveUnits, deficits: liveDeficits, risks: liveRisks, healthy: liveHealthy } = useMemo(() => {
    const opts = { businessUnits, deficitRows, risks, healthyResources, jitter, range }
    if (!isGlobal) {
      const tenant = tenants.find((item) => item.id === tenantId) ?? tenants[0]
      return applyTenant(tenant, opts)
    }
    return applyPortfolio(activeTenants, opts)
  }, [isGlobal, activeTenants, jitter, range])

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

  const notifications = useMemo(() => {
    const items = []
    if (isGlobal) {
      for (const cluster of clustered) {
        if (cluster.priority !== "Critical" && cluster.priority !== "High") continue
        items.push({
          id: cluster.id,
          title: cluster.issue,
          body: "Scope: Enterprise Production // US-East",
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

  const overview = null

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
          if (filters.stack && (scenarioFor(item.issue)?.stage ?? item.category) !== filters.stack) return false
          if (filters.lineage && !ruleMatchesLineageNode(item.issue, filters.lineage)) return false
          return true
        })
    }
    const industryIds =
      filters.businessUnit
        ? new Set(roster.filter((t) => t.industry === filters.businessUnit).map((t) => t.id))
        : null
    return mspItems.filter((item) => {
      if (item.dismissed) return false
      if (item.snoozeUntil && item.snoozeUntil > Date.now()) return false
      if (filters.priority && item.priority !== filters.priority) return false
      if (filters.stack && (scenarioFor(item.issue)?.stage ?? item.category) !== filters.stack) return false
      if (filters.lineage && !ruleMatchesLineageNode(item.issue, filters.lineage)) return false
      if (industryIds) {
        return item.affectedTenants?.some((t) => industryIds.has(t.id)) || (item.tenantNames ?? []).some((name) => roster.some((t) => t.name === name && industryIds.has(t.id)))
      }
      return true
    })
  }, [mspItems, isGlobal, roster, filters.businessUnit, filters.priority, filters.stack, filters.lineage, overview, tenantPatches])

  const mspVisible = useMemo(() => {
    const q = queueSearch.trim().toLowerCase()
    return mspScoped.filter((item) => {
      if (filters.issue && item.issue !== filters.issue) return false
      if (filters.priority && item.priority !== filters.priority) return false
      if (filters.stack && (scenarioFor(item.issue)?.stage ?? item.category) !== filters.stack) return false
      if (filters.lineage && !ruleMatchesLineageNode(item.issue, filters.lineage)) return false
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
  }, [mspScoped, filters.issue, filters.priority, filters.stack, filters.lineage, filters.provider, queueSearch, queueAiStatus, queueAge])

  const historyRows = useMemo(() => {
    let rows = mspHistory
    if (!isGlobal) {
      rows = rows.filter((row) => row.tenantId === tenantId)
    } else if (filters.businessUnit) {
      const ids = new Set(roster.filter((t) => t.industry === filters.businessUnit).map((t) => t.id))
      rows = rows.filter((row) => ids.has(row.tenantId))
    }
    return rows
  }, [isGlobal, filters.businessUnit, roster])

  const filterChips = useMemo(() => {
    const chips = []
    if (filters.issue) chips.push(`Detection Rules: ${filters.issue}`)
    if (filters.lineage) {
      const node = LINEAGE_NODES.find((item) => item.id === filters.lineage)
      if (node) chips.push(`Lineage: ${node.label}`)
    }
    if (filters.provider) chips.push(`Provider: ${filters.provider}`)
    if (queueAiStatus) chips.push(`AI status: ${queueAiStatus}`)
    if (queueAge) chips.push(`Age: ${queueAge}`)
    return chips
  }, [filters.issue, filters.lineage, filters.provider, queueAiStatus, queueAge])

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
      flash("Dismissed from detection health")
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
        "Scope",
        "Provider",
        "MTTD-D",
        "Priority",
        "Score",
      ]
      const lines = clustered.map((row) =>
        [
          row.issue,
          "Enterprise Production // US-East",
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
      a.download = "detpulse-detection-health.csv"
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
      "MTTD-D",
      "MITRE gaps",
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
    a.download = "detpulse-detection-health.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const scopeName = ENTERPRISE_SCOPE.name
  const pageTitle =
    page === "overview"
      ? "Overview"
      : page === "remediation"
        ? "Remediation"
        : page === "settings"
          ? "Settings"
          : "Resources"

  function onSetPage(id) {
    setPage(id)
    if (id === "resources") {
      setFilters((prev) =>
        MSP_INDUSTRIES.includes(prev.businessUnit) ? { ...prev, businessUnit: "" } : prev,
      )
    } else if (id === "overview" && MSP_INDUSTRIES.includes(filters.businessUnit)) {
      setFilters((prev) => ({ ...prev, businessUnit: "" }))
    }
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-[16px] font-semibold tracking-tight text-slate-900">DetPulse</p>
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
    <div className="flex min-h-svh bg-slate-50">
      <Sidebar page={page} setPage={onSetPage} />
      <div className="flex min-w-0 flex-1 flex-col">
      <Header
        pageTitle={pageTitle}
        breadcrumb={[]}
        environmentLabel={ENTERPRISE_SCOPE.label}
        environmentName={scopeName}
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
        {page === "remediation" && (
          <div className="mb-4">
            <StackPipeline
              value={filters.stack}
              onChange={(stage) => setFilter("stack", stage)}
              node={filters.lineage}
              onNode={(id) => setFilter("lineage", id)}
            />
          </div>
        )}
        {page === "overview" && (
          <DetectionControlPlane
            onOpenIssue={(issue) => {
              setRollbackEntry(null)
              setReviewing(drawerItemFor(issue))
            }}
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
            onOpenTenant={() => setPage("resources")}
            {...queueHandlers}
          />
        )}
        {page === "resources" && (
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
