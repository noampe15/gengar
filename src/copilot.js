export function parseCopilotQuery(raw) {
  const q = String(raw ?? "").trim()
  const t = q.toLowerCase()
  const hunt = {
    tier: "",
    provider: "",
    priority: "",
    issueContains: "",
    summarize: false,
  }

  if (/summarize|posture|msp/.test(t) && /global|msp|posture|summarize/.test(t)) {
    hunt.summarize = true
  }

  if (/tier[-\s]?1/.test(t)) hunt.tier = "Tier-1"
  else if (/tier[-\s]?2/.test(t)) hunt.tier = "Tier-2"
  else if (/tier[-\s]?3/.test(t)) hunt.tier = "Tier-3"

  if (/\bcritical\b/.test(t)) hunt.priority = "Critical"
  else if (/\bhigh\b/.test(t)) hunt.priority = "High"
  else if (/\bmedium\b/.test(t)) hunt.priority = "Medium"
  else if (/\blow\b/.test(t)) hunt.priority = "Low"

  if (/\baws\b/.test(t)) hunt.provider = "AWS"
  else if (/\bazure\b/.test(t)) hunt.provider = "Azure"
  else if (/\bgcp\b/.test(t)) hunt.provider = "GCP"

  if (/\bdrift\b/.test(t)) hunt.issueContains = "drift"
  else if (/\bcve|unpatched|kernel\b/.test(t)) hunt.issueContains = "cve"
  else if (/\btls|certificate|cert\b/.test(t)) hunt.issueContains = "tls"

  if (hunt.summarize) {
    hunt.tier = ""
    hunt.provider = ""
    hunt.priority = ""
    hunt.issueContains = ""
  }

  return hunt
}

export function huntIsActive(hunt) {
  return Boolean(hunt?.tier || hunt?.provider || hunt?.priority || hunt?.issueContains)
}

export function applyHunt(list, hunt) {
  if (!huntIsActive(hunt)) return list
  const needle = (hunt.issueContains ?? "").toLowerCase()
  return list.filter((row) => {
    if (hunt.tier && row.tier !== hunt.tier) return false
    if (hunt.provider && row.provider !== hunt.provider) return false
    if (hunt.priority && row.priority !== hunt.priority) return false
    if (needle && !`${row.issue} ${row.name}`.toLowerCase().includes(needle)) return false
    return true
  })
}

export function copilotBanner(query, rows, meta = {}) {
  const units = meta.units ?? []
  const clustered = meta.clustered ?? []
  const t = String(query ?? "").toLowerCase()
  const global = Boolean(meta.global)

  if (global && /summarize|posture/.test(t)) {
    const critical = units.filter((unit) => unit.severity === "Critical").length
    const top = units[0]
    const widest = clustered[0]
    return `Global MSP posture: ${units.length} clients in scope. ${critical} sit at Critical systemic risk${
      top ? `, led by ${top.name} at ${top.score}/100` : ""
    }. Widest blast radius is “${widest?.issue ?? "unclustered"}”, affecting ${
      widest?.tenantCount ?? 0
    } tenants.`
  }

  if (!rows.length) {
    return global
      ? `No risks matched “${query}”. Broaden the prompt or clear AI Assistant to restore the full portfolio.`
      : `No risks matched “${query}”. Broaden the prompt or clear AI Assistant to restore the full table.`
  }

  if (global) {
    const top = clustered[0] ?? rows[0]
    const n = clustered.length || rows.length
    const tenantCount = top.tenantCount ?? 1
    return `AI found ${n} clustered ${n === 1 ? "control gap" : "control gaps"} matching “${query}”. “${
      top.issue
    }” is the lead finding — ${tenantCount} tenant${tenantCount === 1 ? "" : "s"} affected, +${top.rtoDelta}h RTO delta, ${
      top.priority
    } priority.`
  }

  const top = rows[0]
  const extra =
    rows.length > 1
      ? ` ${rows.length - 1} additional ${rows.length === 2 ? "finding is" : "findings are"} correlated in the same window.`
      : ""
  return `AI found ${rows.length} matching ${rows.length === 1 ? "risk" : "risks"}. ${top.name} — ${top.issue} — is driving a +${top.rtoDelta}h RTO delta on ${top.tier} ${top.businessUnit}.${extra}`
}
