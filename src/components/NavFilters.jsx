import { Search, Settings2 } from "lucide-react"
import FilterMenu from "./FilterMenu"

export function visibleFilterKeys(page, isGlobal, remediationView = "queue") {
  if (page === "settings") return []
  if (page === "tenants") {
    return isGlobal
      ? ["industry"]
      : ["resource", "type", "issue", "provider", "businessUnit", "priority"]
  }
  if (page === "overview") {
    return isGlobal ? ["industry", "priority"] : ["priority"]
  }
  if (page === "remediation") {
    if (remediationView === "history") return isGlobal ? ["industry"] : []
    return isGlobal ? ["issue", "priority", "industry", "provider"] : ["issue", "priority", "provider"]
  }
  return []
}

export function headerFiltersActive(page, isGlobal, filters, remediationView = "queue") {
  return visibleFilterKeys(page, isGlobal, remediationView).some((key) => {
    if (key === "industry" || key === "businessUnit") return Boolean(filters.businessUnit)
    return Boolean(filters[key])
  })
}

export function ExtraFilters({
  page,
  filters,
  options,
  setFilter,
  isGlobal = false,
  remediationView = "queue",
}) {
  const keys = visibleFilterKeys(page, isGlobal, remediationView)
  if (keys.length === 0) return null

  const items = {
    industry: (
      <FilterMenu
        key="industry"
        label="Industry"
        options={options.industry}
        value={filters.businessUnit}
        onChange={(v) => setFilter("businessUnit", v)}
      />
    ),
    businessUnit: (
      <FilterMenu
        key="businessUnit"
        label="Business Unit"
        options={options.businessUnit}
        value={filters.businessUnit}
        onChange={(v) => setFilter("businessUnit", v)}
      />
    ),
    priority: (
      <FilterMenu
        key="priority"
        label="Priority"
        options={options.priority}
        value={filters.priority}
        onChange={(v) => setFilter("priority", v)}
      />
    ),
    resource: (
      <FilterMenu
        key="resource"
        label="Resource"
        searchable
        icon={<Search className="h-3.5 w-3.5" />}
        options={options.resource}
        value={filters.resource}
        onChange={(v) => setFilter("resource", v)}
      />
    ),
    type: (
      <FilterMenu
        key="type"
        label="Type"
        icon={<Settings2 className="h-3.5 w-3.5" />}
        options={options.type}
        value={filters.type}
        onChange={(v) => setFilter("type", v)}
      />
    ),
    issue: (
      <FilterMenu
        key="issue"
        label="Issue"
        searchable
        options={options.issue}
        value={filters.issue}
        onChange={(v) => setFilter("issue", v)}
      />
    ),
    provider: (
      <FilterMenu
        key="provider"
        label="Provider"
        options={options.provider}
        value={filters.provider}
        onChange={(v) => setFilter("provider", v)}
      />
    ),
  }

  return <>{keys.map((key) => items[key])}</>
}
