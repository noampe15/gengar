/** Hardcoded Global MSP mock for the PM portfolio dashboard. No backend. */

export const mspEfficiency = {
  rate: 94.2,
  rateDeltaPts: 2.1,
  attempted: 1508,
  succeeded: 1420,
  rolledBack: 31,
  escalated: 57,
  hoursSaved: 2840,
  minutesPerFix: 20,
  hoursCalc:
    "1,420 succeeded remediations × 2h blended toil saved (20 min engineer fix + 100 min avoided incident coordination) = 2,840 hours.",
  sparkline: [
    { date: "Sep 30", hours: 340 },
    { date: "Oct 1", hours: 380 },
    { date: "Oct 2", hours: 360 },
    { date: "Oct 3", hours: 420 },
    { date: "Oct 4", hours: 410 },
    { date: "Oct 5", hours: 450 },
    { date: "Oct 6", hours: 480 },
  ],
}

export const mspHealth = {
  counts: { secure: 42, warning: 5, critical: 2 },
  deltas: { secure: 3, warning: -2, critical: -1 },
}

export function rangeMeta(rangeLabel = "Last 7 days") {
  const s = String(rangeLabel).toLowerCase()
  if (s.includes("24")) {
    return {
      key: "24h",
      ms: 24 * 3600_000,
      countFactor: 1 / 7,
      priorLabel: "vs. prior 24 hours",
      periodLabel: "Last 24 hours",
      chipLabel: "last 24 hours",
      shortLabel: "24h",
    }
  }
  if (s.includes("30")) {
    return {
      key: "30d",
      ms: 30 * 24 * 3600_000,
      countFactor: 30 / 7,
      priorLabel: "vs. prior 30 days",
      periodLabel: "Last 30 days",
      chipLabel: "last 30 days",
      shortLabel: "30d",
    }
  }
  return {
    key: "7d",
    ms: 7 * 24 * 3600_000,
    countFactor: 1,
    priorLabel: "vs. prior 7 days",
    periodLabel: "Last 7 days",
    chipLabel: "last 7 days",
    shortLabel: "7d",
  }
}

export function scaleCounts(succeeded, rolledBack, escalated, factor) {
  const s = Number(succeeded) || 0
  const r = Number(rolledBack) || 0
  const e = Number(escalated) || 0
  if (Math.abs(factor - 1) < 0.001) return { succeeded: s, rolledBack: r, escalated: e }
  if (factor > 1) {
    return {
      succeeded: Math.round(s * factor),
      rolledBack: Math.round(r * factor),
      escalated: Math.round(e * factor),
    }
  }
  return {
    succeeded: s ? Math.max(1, Math.round(s * factor)) : 0,
    rolledBack: r ? Math.max(1, Math.round(r * factor)) : 0,
    escalated: e ? Math.max(1, Math.round(e * factor)) : 0,
  }
}

export function sparkLabels(rangeLabel) {
  const key = rangeMeta(rangeLabel).key
  if (key === "24h") return ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
  if (key === "30d") return ["Sep 8", "Sep 12", "Sep 16", "Sep 20", "Sep 24", "Sep 28", "Oct 2", "Oct 6"]
  return ["Sep 30", "Oct 1", "Oct 2", "Oct 3", "Oct 4", "Oct 5", "Oct 6"]
}

export function sparkSeries(rangeLabel, endValue, key, digits = 0) {
  const labels = sparkLabels(rangeLabel)
  const n = labels.length
  return labels.map((date, i) => {
    const t = n <= 1 ? 1 : i / (n - 1)
    const start = endValue * 0.88
    const raw = start + (endValue - start) * t
    const value = digits ? Number(raw.toFixed(digits)) : Math.round(raw)
    return { date, [key]: value }
  })
}

export function sparkDistributed(rangeLabel, total, key) {
  const labels = sparkLabels(rangeLabel)
  const n = labels.length
  const weights = labels.map((_, i) => 0.82 + (i / Math.max(1, n - 1)) * 0.36)
  const sum = weights.reduce((a, b) => a + b, 0)
  return labels.map((date, i) => ({ date, [key]: Math.max(0, Math.round((total * weights[i]) / sum)) }))
}

export function healthForRange(rangeLabel) {
  const meta = rangeMeta(rangeLabel)
  const deltas =
    meta.key === "24h"
      ? { secure: 1, warning: 0, critical: -1 }
      : meta.key === "30d"
        ? { secure: 5, warning: -3, critical: -2 }
        : mspHealth.deltas
  return { counts: mspHealth.counts, deltas, priorLabel: meta.priorLabel }
}

export function tenantActivityInRange(tenant, rangeLabel) {
  const mix = scaleCounts(tenant?.aiFixed7d ?? 0, tenant?.rolledBack7d ?? 0, tenant?.escalated7d ?? 0, rangeMeta(rangeLabel).countFactor)
  return { fixed: mix.succeeded, rolledBack: mix.rolledBack, escalated: mix.escalated }
}

export const ESCALATION_REASONS = {
  blast: "Blast radius exceeds auto-apply limit (>5 tenants)",
  confidence: "Confidence below 90% threshold",
  policy: "Policy requires approval: production data plane",
  rollback: "Previous auto-fix was rolled back",
}

export const QUEUE_TENANT_POOL = [
  { id: "stark", name: "Stark Industrial", initials: "SI" },
  { id: "lumen", name: "Lumen Studios", initials: "LS" },
  { id: "helios", name: "Helios Payments", initials: "HP" },
  { id: "northwind", name: "Northwind Logistics", initials: "NW" },
  { id: "initech", name: "Initech SaaS", initials: "IN" },
  { id: "acme", name: "Industrial Illusions", initials: "II" },
  { id: "globex", name: "Globex Manufacturing", initials: "GX" },
  { id: "contoso", name: "Contoso Logistics", initials: "CL" },
  { id: "atlas", name: "Atlas Freight", initials: "AF" },
  { id: "fabrikam", name: "Fabrikam Health", initials: "FH" },
  { id: "meridian", name: "Meridian Clinics", initials: "MC" },
  { id: "wayne", name: "Wayne Retail Group", initials: "WR" },
  { id: "apex", name: "Apex Media", initials: "AM" },
  { id: "cobalt", name: "Cobalt Bank", initials: "CB" },
  { id: "driftwood", name: "Driftwood Hotels", initials: "DH" },
  { id: "redwood", name: "Redwood Analytics", initials: "RA" },
  { id: "nimbus", name: "Nimbus Education", initials: "NE" },
  { id: "harbor", name: "Harbor Insurance", initials: "HI" },
  { id: "umbrella", name: "Umbrella Pharma", initials: "UP" },
  { id: "piedpiper", name: "Pied Piper Cloud", initials: "PP" },
]

export function blastRadius(leadIds, count) {
  const lead = leadIds
    .map((id) => QUEUE_TENANT_POOL.find((t) => t.id === id))
    .filter(Boolean)
  const rest = QUEUE_TENANT_POOL.filter((t) => !leadIds.includes(t.id))
  const affectedTenants = [...lead, ...rest].slice(0, count)
  return {
    affectedTenants,
    tenantNames: affectedTenants.slice(0, 2).map((t) => t.name),
    tenantCount: affectedTenants.length,
  }
}

export function queueBlastCount(item) {
  if (item?.affectedTenants?.length) return item.affectedTenants.length
  if (typeof item?.tenantCount === "number") return item.tenantCount
  return item?.tenantNames?.length ?? 0
}

function formatClock(msAbs) {
  const total = Math.max(0, Math.round(Math.abs(msAbs) / 60000))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h <= 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, "0")}m`
}

export function slaDeadlineStatus(breachAt, nowTs = Date.now()) {
  const remain = breachAt - nowTs
  if (remain <= 0) {
    return { kind: "breached", text: `Breached ${formatClock(remain)} ago`, tone: "red" }
  }
  return {
    kind: "upcoming",
    text: `Breaches in ${formatClock(remain)}`,
    tone: remain <= 60 * 60 * 1000 ? "red" : remain <= 2 * 60 * 60 * 1000 ? "amber" : "slate",
  }
}

const now = Date.now()

export const mspQueueItems = [
  {
    id: "esc-eventbridge",
    issue: "EventBridge rule targeting deleted bus",
    priority: "Critical",
    score: 96,
    reason: ESCALATION_REASONS.confidence,
    breachAt: now + (1 * 60 + 12) * 60 * 1000,
    confidence: 88,
    reversible: true,
    ...blastRadius(["stark", "northwind"], 9),
    category: "Identity Systems",
    fixSummary: "Recreate default bus and re-point 3 rules",
    owner: { initials: "MA", name: "Maya Reid" },
    rollbackPlan: "Delete the recreated bus and restore the prior EventBridge rule ARNs from last night's config snapshot.",
    rationale: "Nine tenants share the deleted default bus. Auto-apply is blocked because blast radius exceeds 5. Confidence is 92% from identical Terraform diffs.",
    controls: [
      { framework: "SOC 2", id: "CC6.1", name: "Logical access" },
      { framework: "CIS AWS", id: "4.3", name: "Default event bus intact" },
      { framework: "ISO 27001", id: "A.17.1.2", name: "Implementing information security continuity" },
    ],
    cluster: true,
  },
  {
    id: "esc-cve",
    issue: "Unpatched kernel CVE-2024-1086",
    priority: "Critical",
    score: 91,
    reason: ESCALATION_REASONS.confidence,
    breachAt: now + (4 * 60 + 20) * 60 * 1000,
    confidence: 84,
    reversible: false,
    ...blastRadius(["globex", "northwind"], 5),
    category: "Containers",
    fixSummary: "Roll a canary AMI, then fleet-replace remaining nodes",
    owner: { initials: "MR", name: "Molly Reid" },
    rollbackPlan: "Pin node groups back to the previous AMI ID. Kernel upgrades are not in-place reversible.",
    rationale: "Exploit PoC exists, but mixed kernel families drop model confidence to 84%. Policy requires a human before irreversible node replacement.",
    controls: [{ framework: "ISO 27001", id: "A.12.6.1", name: "Management of technical vulnerabilities" }],
    cluster: true,
  },
  {
    id: "esc-blob",
    issue: "Public blob container policy drift",
    priority: "Critical",
    score: 88,
    reason: ESCALATION_REASONS.policy,
    breachAt: now + (5 * 60 + 10) * 60 * 1000,
    confidence: 91,
    reversible: true,
    ...blastRadius(["acme", "fabrikam"], 6),
    category: "Identity Systems",
    fixSummary: "Restore private ACL and rotate leaked SAS tokens",
    owner: null,
    rollbackPlan: "Re-apply the previous container ACL from Terraform state if a partner integration breaks.",
    rationale: "Production object storage is tagged data-plane. Policy always requires approval even when confidence is high.",
    controls: [
      { framework: "SOC 2", id: "CC6.1", name: "Logical access" },
      { framework: "HIPAA", id: "164.312(a)(1)", name: "Access control" },
    ],
    cluster: true,
  },
  {
    id: "esc-privileged",
    issue: "Privileged container runtime allowed",
    priority: "Critical",
    score: 94,
    reason: ESCALATION_REASONS.rollback,
    breachAt: now - (2 * 60 + 14) * 60 * 1000,
    confidence: 89,
    reversible: true,
    ...blastRadius(["stark", "lumen"], 14),
    category: "Containers",
    fixSummary: "Enforce restricted PodSecurity and evict privileged pods",
    owner: { initials: "JS", name: "James Shaw" },
    rollbackPlan: "Last auto-apply evicted a payments sidecar. Keep a break-glass namespace exemption ready for 30 minutes.",
    rationale: "A prior auto-fix was rolled back after a payments sidecar failed. Human review is mandatory on the retry.",
    controls: [{ framework: "SOC 2", id: "CC6.1", name: "Logical access" }],
    cluster: true,
  },
  {
    id: "esc-tls",
    issue: "TLS certificate expires in 12 days",
    priority: "High",
    score: 73,
    reason: ESCALATION_REASONS.blast,
    breachAt: now + 6 * 60 * 60 * 1000,
    confidence: 96,
    reversible: true,
    ...blastRadius(["northwind", "helios"], 6),
    category: "Identity Systems",
    fixSummary: "Issue ACM certs and swap listeners with overlap",
    owner: null,
    rollbackPlan: "Keep the outgoing certificate attached on a second listener until cutover health checks pass.",
    rationale: "Six tenants share the same expired SAN. Auto-apply is blocked at >5 tenants even though confidence is 96%.",
    controls: [{ framework: "SOC 2", id: "CC6.7", name: "Transmission encryption" }],
    cluster: true,
  },
  {
    id: "esc-rds",
    issue: "RDS deletion protection disabled",
    priority: "Critical",
    score: 87,
    reason: ESCALATION_REASONS.policy,
    breachAt: now - 12 * 60 * 1000,
    confidence: 93,
    reversible: true,
    ...blastRadius(["initech", "helios"], 18),
    category: "Databases",
    fixSummary: "Enable deletion protection and snapshot before change",
    owner: { initials: "DK", name: "Daniel King" },
    rollbackPlan: "Flip deletion_protection to false only via break-glass with dual control.",
    rationale: "Production data plane. Enabling protection is reversible in config, but policy still requires a named approver.",
    controls: [{ framework: "SOC 2", id: "CC6.1", name: "Logical access" }],
    cluster: true,
  },
  {
    id: "esc-guardduty",
    issue: "GuardDuty detector suspended",
    priority: "High",
    score: 81,
    reason: ESCALATION_REASONS.confidence,
    breachAt: now + 8 * 60 * 60 * 1000,
    confidence: 81,
    reversible: true,
    ...blastRadius(["piedpiper"], 1),
    category: "Identity Systems",
    fixSummary: "Re-enable detector and backfill 24h of findings",
    owner: null,
    rollbackPlan: "Suspend the detector again if the tenant's security account hits API quotas.",
    rationale: "Single-tenant, but detector state was changed out-of-band. Confidence is 81% until we confirm no quota conflict.",
    controls: [{ framework: "CIS AWS", id: "2.1.1", name: "GuardDuty enabled" }],
    cluster: true,
  },
  {
    id: "esc-s3",
    issue: "S3 bucket versioning disabled",
    priority: "Critical",
    score: 95,
    reason: ESCALATION_REASONS.blast,
    breachAt: now - 48 * 60 * 1000,
    confidence: 90,
    reversible: true,
    ...blastRadius(["helios", "lumen"], 14),
    category: "Databases",
    fixSummary: "Enable versioning and apply a 30-day MFA-delete hold",
    owner: null,
    rollbackPlan: "Versioning cannot be fully undone; suspend MFA-delete if restore workflows break.",
    rationale: "Affects the entire selected estate. Auto-apply stops at 5 tenants. Enabling versioning is the lowest-risk remaining control.",
    controls: [
      { framework: "SOC 2", id: "A1.2", name: "Recovery and backup" },
      { framework: "CIS AWS", id: "2.1.3", name: "S3 bucket versioning" },
      { framework: "HIPAA", id: "164.312(c)(1)", name: "Integrity controls" },
      { framework: "ISO 27001", id: "A.12.3.1", name: "Information backup" },
    ],
    cluster: true,
  },
  {
    id: "esc-eks-logging",
    issue: "EKS control plane logging disabled",
    priority: "Critical",
    score: 95,
    reason: ESCALATION_REASONS.blast,
    breachAt: now + (1 * 60 + 48) * 60 * 1000,
    confidence: 91,
    reversible: true,
    ...blastRadius(["lumen", "helios"], 8),
    category: "Containers",
    fixSummary: "Enable api, audit and authenticator logs",
    owner: null,
    rollbackPlan: "Disable the five log types if CloudWatch ingest cost spikes; retain 24h of already shipped logs.",
    rationale: "Seven AWS estates share the same EKS module. Auto-apply is blocked above 5 tenants even though the Terraform change is identical.",
    controls: [
      { framework: "SOC 2", id: "CC7.2", name: "System monitoring" },
      { framework: "CIS AWS", id: "5.1.1", name: "EKS control plane logging" },
      { framework: "ISO 27001", id: "A.12.4.1", name: "Event logging" },
    ],
    cluster: true,
  },
  {
    id: "esc-ami",
    issue: "Node group AMI 47 days stale",
    priority: "High",
    score: 82,
    reason: ESCALATION_REASONS.rollback,
    breachAt: now + (3 * 60 + 5) * 60 * 1000,
    confidence: 84,
    reversible: true,
    ...blastRadius(["northwind", "initech"], 11),
    category: "Containers",
    fixSummary: "Rolling replace of 2 node groups per tenant",
    owner: { initials: "DK", name: "Daniel King" },
    rollbackPlan: "Node replacement is not in-place reversible. Keep the previous launch template version pinned for 2 hours.",
    rationale: "AMI IDs differ by region and Kubernetes minor. Confidence is 88%, under the 90% auto-apply threshold, and the change is irreversible.",
    controls: [
      { framework: "ISO 27001", id: "A.12.6.1", name: "Management of technical vulnerabilities" },
      { framework: "CIS AWS", id: "5.4.2", name: "EKS node AMI currency" },
      { framework: "SOC 2", id: "CC8.1", name: "Change management" },
    ],
    cluster: true,
    introducedBy: {
      actor: "Daniel King",
      handle: "d.king",
      source: "AWS console",
      at: now - 3 * 24 * 3600_000,
      summary: "Manual change in AWS console",
    },
  },
]

export const MSP_INDUSTRIES = ["Retail", "Industrial", "Healthcare"]

export const OWNERS = {
  MR: { initials: "MR", name: "Molly Reid" },
  JS: { initials: "JS", name: "James Shaw" },
  AL: { initials: "AL", name: "Amelia Lewis" },
  MY: { initials: "MY", name: "Maisie Young" },
  DK: { initials: "DK", name: "Daniel King" },
}

export const mspAssignees = [OWNERS.MR, OWNERS.JS, OWNERS.AL, OWNERS.MY, OWNERS.DK]

function hashId(id) {
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0
  return h
}

function issue(severity, title, aiStatus, queueItemId) {
  return { severity, title, aiStatus, queueItemId: queueItemId ?? null }
}

function resourcesFor(id, withIssues) {
  const h = hashId(id)
  const groups = [
    { group: "Databases", count: 8 + (h % 12) },
    { group: "Containers", count: 10 + ((h >>> 3) % 16) },
    { group: "Identity", count: 4 + ((h >>> 6) % 8) },
    { group: "Storage", count: 11 + ((h >>> 9) % 14) },
  ]
  let leftover = withIssues
  return groups.map((g, i) => {
    const n = leftover <= 0 ? 0 : i === groups.length - 1 ? leftover : Math.min(leftover, i === 0 ? Math.min(2, leftover) : leftover > 2 ? 1 : leftover)
    leftover -= n
    return { ...g, withIssues: Math.max(0, n) }
  })
}

function recentAi(id, { fixed, rolled, escalated }) {
  const stamps = ["12 min ago", "3h ago", "Yesterday 16:40", "Yesterday 09:12", "2 days ago", "2 days ago", "3 days ago", "4 days ago"]
  const outcomes = []
  if (escalated) outcomes.push("Escalated")
  if (rolled) outcomes.push("Rolled back")
  while (outcomes.length < 8) outcomes.push("Fixed")
  const actions = [
    "Enabled backup retention",
    "Rotated access key",
    "Patched node AMI canary",
    "Closed public storage ACL",
    "Re-enabled detector",
    "Tightened security group",
    "Rotated expired certificate",
    "Enabled encryption at rest",
  ]
  const h = hashId(id)
  return stamps.map((at, i) => ({
    id: `${id}-ai-${i}`,
    action: actions[(h + i) % actions.length],
    outcome: outcomes[i],
    at,
  }))
}

function tenant({
  id,
  name,
  initials,
  bu,
  health,
  owner,
  breachH,
  issues = [],
  fixed,
  rolled = 0,
  esc = 0,
}) {
  const h = hashId(id)
  const aiFixed = fixed ?? 16 + (h % 22)
  const resources = resourcesFor(id, issues.length)
  return {
    id,
    name,
    initials,
    industry: MSP_INDUSTRIES[bu],
    health,
    owner: owner ? OWNERS[owner] : null,
    openIssues: issues,
    nextBreachAt: breachH == null ? null : Date.now() + breachH * 3_600_000,
    aiFixed7d: aiFixed,
    rolledBack7d: rolled,
    escalated7d: esc,
    resources,
    recentAi: recentAi(id, { fixed: aiFixed, rolled, escalated: esc }),
  }
}

export const mspTenants = [
  tenant({
    id: "lumen",
    name: "Lumen Studios",
    initials: "LS",
    bu: 0,
    health: "critical",
    owner: "JS",
    breachH: 0.92,
    issues: [
      issue("Critical", "EventBridge rule targeting deleted bus", "Waiting on human", "esc-eventbridge"),
      issue("High", "Node group AMI stale", "Waiting on human", "esc-ami"),
    ],
    fixed: 19,
    rolled: 1,
    esc: 2,
  }),
  tenant({
    id: "helios",
    name: "Helios Payments",
    initials: "HP",
    bu: 0,
    health: "critical",
    owner: "AL",
    breachH: 0.8,
    issues: [
      issue("Critical", "S3 bucket versioning disabled", "Waiting on human", "esc-s3"),
      issue("High", "EKS control plane logging disabled", "Waiting on human", "esc-eks-logging"),
    ],
    fixed: 24,
    rolled: 2,
    esc: 3,
  }),
  tenant({
    id: "stark",
    name: "Stark Industrial",
    initials: "SI",
    bu: 1,
    health: "warning",
    owner: "MR",
    breachH: 1.15,
    issues: [
      issue("High", "EKS control plane logging disabled", "Waiting on human", "esc-eks-logging"),
      issue("High", "Node group AMI stale", "Waiting on human", "esc-ami"),
      issue("Critical", "S3 bucket versioning disabled", "Waiting on human", "esc-s3"),
    ],
    fixed: 11,
    rolled: 1,
    esc: 2,
  }),
  tenant({
    id: "globex",
    name: "Globex Manufacturing",
    initials: "GX",
    bu: 1,
    health: "warning",
    owner: null,
    breachH: 1.35,
    issues: [
      issue("High", "Node group AMI stale", "Waiting on human", "esc-ami"),
      issue("High", "EKS control plane logging disabled", "Waiting on human", "esc-eks-logging"),
    ],
    fixed: 9,
    rolled: 0,
    esc: 2,
  }),
  tenant({
    id: "acme",
    name: "Industrial Illusions",
    initials: "II",
    bu: 1,
    health: "warning",
    owner: null,
    breachH: 1.55,
    issues: [
      issue("Critical", "EventBridge rule targeting deleted bus", "Waiting on human", "esc-eventbridge"),
      issue("High", "Node group AMI stale", "Waiting on human", "esc-ami"),
    ],
    fixed: 14,
    rolled: 0,
    esc: 1,
  }),
  tenant({
    id: "northwind",
    name: "Northwind Logistics",
    initials: "NW",
    bu: 1,
    health: "warning",
    owner: "MR",
    breachH: 1.2,
    issues: [
      issue("Critical", "S3 bucket versioning disabled", "Waiting on human", "esc-s3"),
      issue("Critical", "EKS control plane logging disabled", "Waiting on human", "esc-eks-logging"),
      issue("High", "Node group AMI 47 days stale", "Waiting on human", "esc-ami"),
      issue("Critical", "EventBridge rule targeting deleted bus", "Blocked", "esc-eventbridge"),
      issue("High", "TLS certificate expires in 12 days", "Waiting on human", "esc-tls"),
      issue("High", "RDS deletion protection disabled", "AI fixing", "esc-rds"),
      issue("High", "Unpatched kernel CVE-2024-1086", "AI fixing", "esc-cve"),
      issue("Medium", "Public blob container policy drift", "AI fixing", "esc-blob"),
      issue("Medium", "Privileged container runtime allowed", "Blocked", "esc-privileged"),
    ],
    fixed: 41,
    rolled: 2,
    esc: 3,
  }),
  tenant({
    id: "initech",
    name: "Initech SaaS",
    initials: "IN",
    bu: 2,
    health: "warning",
    owner: "AL",
    breachH: 2.55,
    issues: [
      issue("Critical", "S3 bucket versioning disabled", "Waiting on human", "esc-s3"),
      issue("Critical", "EventBridge rule targeting deleted bus", "Waiting on human", "esc-eventbridge"),
    ],
    fixed: 13,
    rolled: 1,
    esc: 2,
  }),
  tenant({
    id: "contoso",
    name: "Contoso Logistics",
    initials: "CL",
    bu: 1,
    health: "secure",
    owner: "JS",
    issues: [
      issue("Critical", "EventBridge rule targeting deleted bus", "AI fixing", "esc-eventbridge"),
      issue("High", "EKS control plane logging disabled", "AI fixing", "esc-eks-logging"),
      issue("High", "Node group AMI stale", "Blocked", "esc-ami"),
    ],
    fixed: 28,
    esc: 0,
  }),
  tenant({
    id: "atlas",
    name: "Atlas Freight",
    initials: "AF",
    bu: 1,
    health: "secure",
    owner: "MR",
    issues: [
      issue("Critical", "EventBridge rule targeting deleted bus", "AI fixing", "esc-eventbridge"),
      issue("High", "EKS control plane logging disabled", "AI fixing", "esc-eks-logging"),
      issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3"),
    ],
    fixed: 22,
  }),
  tenant({
    id: "fabrikam",
    name: "Fabrikam Health",
    initials: "FH",
    bu: 2,
    health: "secure",
    owner: "AL",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 31,
  }),
  tenant({
    id: "meridian",
    name: "Meridian Clinics",
    initials: "MC",
    bu: 2,
    health: "secure",
    owner: "AL",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 27,
  }),
  tenant({
    id: "wayne",
    name: "Wayne Retail Group",
    initials: "WR",
    bu: 0,
    health: "secure",
    owner: "JS",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 20,
  }),
  tenant({
    id: "apex",
    name: "Apex Media",
    initials: "AM",
    bu: 0,
    health: "secure",
    owner: null,
    issues: [
      issue("High", "EKS control plane logging disabled", "AI fixing", "esc-eks-logging"),
      issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3"),
    ],
    fixed: 18,
  }),
  tenant({
    id: "cobalt",
    name: "Cobalt Bank",
    initials: "CB",
    bu: 0,
    health: "secure",
    owner: "MR",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 16,
  }),
  tenant({
    id: "driftwood",
    name: "Driftwood Hotels",
    initials: "DH",
    bu: 2,
    health: "secure",
    owner: "JS",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 15,
  }),
  tenant({
    id: "redwood",
    name: "Redwood Analytics",
    initials: "RA",
    bu: 0,
    health: "secure",
    owner: null,
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 23,
  }),
  tenant({
    id: "nimbus",
    name: "Nimbus Education",
    initials: "NE",
    bu: 2,
    health: "secure",
    owner: "AL",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 19,
  }),
  tenant({
    id: "harbor",
    name: "Harbor Insurance",
    initials: "HI",
    bu: 0,
    health: "secure",
    owner: "MR",
    issues: [issue("Critical", "S3 bucket versioning disabled", "AI fixing", "esc-s3")],
    fixed: 12,
  }),
  // remaining secure tenants — no overlapping queue issues
  ...[
    ["umbrella", "Umbrella Pharma", "UP", 2, "AL"],
    ["piedpiper", "Pied Piper Cloud", "PP", 2, null],
    ["brightpath", "Brightpath Energy", "BE", 1, "JS"],
    ["silverline", "Silverline Legal", "SL", 0, "MR"],
    ["oakmont", "Oakmont Foods", "OF", 1, null],
    ["cascade", "Cascade Telecom", "CT", 1, "AL"],
    ["vanguard", "Vanguard Auto", "VA", 1, "JS"],
    ["bluebird", "Bluebird Airlines", "BA", 1, "MR"],
    ["pinnacle", "Pinnacle Realty", "PR", 0, null],
    ["ironclad", "Ironclad Security", "IS", 0, "AL"],
    ["meadowlark", "Meadowlark Farms", "MF", 1, "JS"],
    ["quartz", "Quartz Biotech", "QB", 2, "AL"],
    ["solarwind", "Solarwind Utilities", "SU", 1, "MR"],
    ["foxglove", "Foxglove Media", "FM", 0, null],
    ["kepler", "Kepler Robotics", "KR", 1, "JS"],
    ["linden", "Linden Credit Union", "LC", 0, "MR"],
    ["marblehead", "Marblehead Marine", "MM", 1, null],
    ["nightingale", "Nightingale Hospitals", "NH", 2, "AL"],
    ["orion", "Orion Gaming", "OG", 0, "JS"],
    ["prairie", "Prairie Grain Co", "PG", 1, "MR"],
    ["questline", "Questline Diagnostics", "QD", 2, "AL"],
    ["riverbend", "Riverbend Municipal", "RM", 2, null],
    ["summit", "Summit Athletics", "SA", 0, "JS"],
    ["timberland", "Timberland Sawmills", "TS", 1, "MR"],
    ["union", "Union Station Transit", "US", 1, "AL"],
    ["vertex", "Vertex Semiconductors", "VS", 0, "JS"],
    ["willow", "Willow Creek Schools", "WC", 2, null],
    ["zenith", "Zenith Apparel", "ZA", 0, "MR"],
    ["arctic", "Arctic Logistics", "AR", 1, "JS"],
    ["beaconmut", "Beacon Mutual", "BM", 0, "AL"],
    ["cypress", "Cypress Dental", "CD", 2, null],
  ].map(([id, name, initials, bu, owner]) => tenant({ id, name, initials, bu, health: "secure", owner })),
]

export const HEALTH_RANK = { critical: 0, warning: 1, secure: 2 }

export function formatSlaRemain(ms) {
  if (ms == null) return "None"
  if (ms <= 0) return "SLA breached"
  const total = Math.round(ms / 60000)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h <= 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, "0")}m`
}

export function slaUrgency(ms) {
  if (ms == null) return "none"
  if (ms <= 0 || ms <= 60 * 60 * 1000) return "red"
  if (ms <= 2 * 60 * 60 * 1000) return "amber"
  return "ok"
}

export function queueItemById(id) {
  return mspQueueItems.find((row) => row.id === id) ?? null
}

const SLA_SPARKLINE = [
  { date: "Sep 30", pct: 95.1 },
  { date: "Oct 1", pct: 95.4 },
  { date: "Oct 2", pct: 95.8 },
  { date: "Oct 3", pct: 95.6 },
  { date: "Oct 4", pct: 96.0 },
  { date: "Oct 5", pct: 96.2 },
  { date: "Oct 6", pct: 96.4 },
]

export const SLA_GOAL_PCT = 95

const SLA_WAIT = "The gap is mostly time spent waiting for approval."

export const slaBreachSpecs = [
  { tenantId: "lumen", tenantName: "Lumen Studios", issue: "EventBridge rule targeting deleted bus", priority: "Critical" },
  { tenantId: "helios", tenantName: "Helios Payments", issue: "S3 bucket versioning disabled", priority: "Critical" },
  { tenantId: "stark", tenantName: "Stark Industrial", issue: "Privileged container runtime allowed", priority: "Critical" },
  { tenantId: "acme", tenantName: "Industrial Illusions", issue: "Public blob container policy drift", priority: "Critical" },
  { tenantId: "globex", tenantName: "Globex Manufacturing", issue: "Node group AMI stale", priority: "High" },
  { tenantId: "northwind", tenantName: "Northwind Logistics", issue: "TLS certificate expires in 12 days", priority: "High" },
]

export function durationToMinutes(label) {
  const s = String(label ?? "")
  const hours = s.match(/(\d+)\s*h/i)
  const mins = s.match(/(\d+)\s*m/i)
  if (hours || mins) return (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0)
  const n = Number.parseInt(s, 10)
  return Number.isFinite(n) ? n : 0
}

export function formatSlaPct(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return "0"
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

function enrichPriorityRow(row) {
  const tracked = row.tracked ?? 0
  const withinTarget = row.withinTarget ?? 0
  const metPct = tracked ? Number(((withinTarget / tracked) * 100).toFixed(1)) : 100
  const belowGoal = metPct < SLA_GOAL_PCT
  return {
    ...row,
    tracked,
    withinTarget,
    metPct,
    missed: belowGoal,
    belowGoal,
    badge: belowGoal ? "Below goal" : "Meeting goal",
  }
}

export function buildSlaView(byPriority, extras = {}) {
  const rows = (byPriority ?? []).map(enrichPriorityRow)
  const tracked = rows.reduce((sum, row) => sum + row.tracked, 0)
  const withinTarget = rows.reduce((sum, row) => sum + row.withinTarget, 0)
  const breaches = tracked - withinTarget
  const metPct = tracked ? Number(((withinTarget / tracked) * 100).toFixed(1)) : 100
  const breachByPriority = rows
    .map((row) => ({ priority: row.priority, n: row.tracked - row.withinTarget }))
    .filter((row) => row.n > 0)
  const aiMedian = extras.aiMedian ?? "4 min"
  const humanMedian = extras.humanMedian ?? "2h 10m"
  const aiMedianMin = extras.aiMedianMin ?? durationToMinutes(aiMedian)
  const humanMedianMin = extras.humanMedianMin ?? durationToMinutes(humanMedian)
  const multiple = aiMedianMin ? Math.floor(humanMedianMin / aiMedianMin) : 0
  return {
    slaGoalPct: SLA_GOAL_PCT,
    goalTooltip: "A priority meets its goal when at least 95% of its issues were remediated within target.",
    waitTooltip: extras.waitTooltip ?? SLA_WAIT,
    sparkline: extras.sparkline ?? SLA_SPARKLINE,
    deltaPts: extras.deltaPts ?? 0,
    aiMedian,
    humanMedian,
    aiMedianMin,
    humanMedianMin,
    humanMultiple: multiple,
    byPriority: rows,
    tracked,
    withinTarget,
    metPct,
    breaches,
    breachByPriority,
    windows: tracked,
    metWindows: withinTarget,
    tenantId: extras.tenantId,
    tenantName: extras.tenantName,
  }
}

function scaleSlaPriorities(rows, factor) {
  if (Math.abs(factor - 1) < 0.001) return rows
  return rows.map((row) => {
    const missed = Math.max(0, (row.tracked ?? 0) - (row.withinTarget ?? 0))
    const tracked = row.tracked ? Math.max(missed ? missed : 1, Math.round(row.tracked * factor)) : 0
    const missedScaled = missed ? Math.min(tracked, Math.max(1, Math.round(missed * factor))) : 0
    return { ...row, tracked, withinTarget: Math.max(0, tracked - missedScaled) }
  })
}

const MSP_SLA_PRIORITIES = [
  { priority: "Critical", target: "4h", median: "2h 48m", tracked: 49, withinTarget: 45 },
  { priority: "High", target: "24h", median: "11h 40m", tracked: 71, withinTarget: 69 },
  { priority: "Medium", target: "72h", median: "18h", tracked: 47, withinTarget: 47 },
]

export const mspSla = buildSlaView(MSP_SLA_PRIORITIES, {
  deltaPts: 0.8,
  aiMedian: "4 min",
  humanMedian: "2h 10m",
  aiMedianMin: 4,
  humanMedianMin: 130,
  sparkline: SLA_SPARKLINE,
})

const SLA_BY_HEALTH = {
  critical: {
    deltaPts: -1.1,
    aiMedian: "6 min",
    humanMedian: "4h 05m",
    aiMedianMin: 6,
    humanMedianMin: 245,
    sparkline: SLA_SPARKLINE.map((p) => ({ ...p, pct: Number((p.pct - 8.2).toFixed(1)) })),
    byPriority: [
      { priority: "Critical", target: "4h", median: "6h 40m", tracked: 2, withinTarget: 1 },
      { priority: "High", target: "24h", median: "14h", tracked: 2, withinTarget: 2 },
      { priority: "Medium", target: "72h", median: "22h", tracked: 1, withinTarget: 1 },
    ],
  },
  warning: {
    deltaPts: 0.3,
    aiMedian: "5 min",
    humanMedian: "2h 48m",
    aiMedianMin: 5,
    humanMedianMin: 168,
    sparkline: SLA_SPARKLINE.map((p) => ({ ...p, pct: Number((p.pct - 2.3).toFixed(1)) })),
    byPriority: [
      { priority: "Critical", target: "4h", median: "3h 50m", tracked: 2, withinTarget: 2 },
      { priority: "High", target: "24h", median: "26h", tracked: 5, withinTarget: 4 },
      { priority: "Medium", target: "72h", median: "16h", tracked: 3, withinTarget: 3 },
    ],
  },
  secure: {
    deltaPts: 0.4,
    aiMedian: "3 min",
    humanMedian: "48 min",
    aiMedianMin: 3,
    humanMedianMin: 48,
    sparkline: SLA_SPARKLINE.map((p) => ({ ...p, pct: 100 })),
    byPriority: [
      { priority: "Critical", target: "4h", median: "42 min", tracked: 3, withinTarget: 3 },
      { priority: "High", target: "24h", median: "3h 10m", tracked: 4, withinTarget: 4 },
      { priority: "Medium", target: "72h", median: "8h", tracked: 2, withinTarget: 2 },
    ],
  },
}

export function slaForTenant(tenantId) {
  if (!tenantId) return mspSla
  const tenant = mspTenants.find((row) => row.id === tenantId)
  if (!tenant) return mspSla
  const pack = SLA_BY_HEALTH[tenant.health] ?? SLA_BY_HEALTH.secure
  return buildSlaView(pack.byPriority, {
    ...pack,
    tenantId: tenant.id,
    tenantName: tenant.name,
  })
}

export function slaRiskScore(item, nowTs = Date.now()) {
  const hours = Math.max(0.08, (item.breachAt - nowTs) / 3_600_000)
  return (1 / hours) * queueBlastCount(item)
}

export function rankMspQueue(items, nowTs = Date.now()) {
  return [...items].sort((a, b) => slaRiskScore(b, nowTs) - slaRiskScore(a, nowTs))
}

export function workspaceRankScore(item, nowTs = Date.now()) {
  const n = queueBlastCount(item)
  const hours = (item.breachAt - nowTs) / 3_600_000
  if (hours <= 0) return 1_000_000 + Math.abs(hours) * n
  return (1 / Math.max(0.08, hours)) * n
}

export function rankWorkspaceQueue(items, nowTs = Date.now()) {
  return [...items].sort((a, b) => workspaceRankScore(b, nowTs) - workspaceRankScore(a, nowTs))
}

export function sortWorkspaceQueue(items, key, dir, nowTs = Date.now()) {
  if (!key || key === "rank") return rankWorkspaceQueue(items, nowTs)
  const sign = dir === "asc" ? 1 : -1
  return [...items].sort((a, b) => {
    if (key === "issue") return sign * a.issue.localeCompare(b.issue)
    if (key === "blast") return sign * (queueBlastCount(a) - queueBlastCount(b))
    if (key === "confidence") return sign * ((a.confidence ?? 0) - (b.confidence ?? 0))
    if (key === "sla") {
      const da = a.breachAt - nowTs
      const db = b.breachAt - nowTs
      const aBreached = da <= 0
      const bBreached = db <= 0
      if (aBreached !== bBreached) return aBreached ? -1 : 1
      return sign * (da - db)
    }
    return 0
  })
}

const HISTORY_EMPTY_TENANTS = new Set([
  "cypress",
  "beaconmut",
  "willow",
  "zenith",
  "arctic",
  "summit",
  "riverbend",
  "questline",
])

function buildMspHistory() {
  const specs = mspQueueItems.map((item) => ({ issue: item.issue, action: item.fixSummary }))
  const pool = mspTenants.filter((t) => !HISTORY_EMPTY_TENANTS.has(t.id))
  const approvers = ["Auto", "Molly Reid", "James Shaw", "Amelia Lewis"]
  const causes = [
    {
      cause: "Error rate on the payments sidecar jumped above 2% within 4 minutes of apply.",
      restored: "Reverted the control to the last known-good Terraform state and restored the namespace exemption.",
    },
    {
      cause: "Canary node group failed kubelet health checks in eu-west-1.",
      restored: "Pinned the previous AMI launch template version and drained the canary set.",
    },
    {
      cause: "Versioning MFA-delete blocked a tenant restore workflow.",
      restored: "Suspended MFA-delete and left versioning enabled.",
    },
  ]
  const mix = [
    ["Fixed", 1420],
    ["Rolled back", 31],
    ["Escalated", 57],
  ]
  const extraMix = [
    ["Fixed", Math.round(1420 * (23 / 7))],
    ["Rolled back", Math.round(31 * (23 / 7))],
    ["Escalated", Math.round(57 * (23 / 7))],
  ]
  const rows = []
  let n = 0
  const day = 24 * 3600_000
  const window7 = 7 * day
  const window23 = 23 * day

  function pushMix(pairs, windowStart, windowLen, idPrefix) {
    for (const [outcome, count] of pairs) {
      for (let i = 0; i < count; i += 1) {
        const tenant = pool[(n * 3 + i) % pool.length]
        const spec = specs[n % specs.length]
        const offset = windowStart + Math.floor(((i + 1) / (count + 1)) * windowLen) + (n % 17) * 60_000
        const at = now - Math.min(offset, windowStart + windowLen - 60_000)
        const approvedBy =
          outcome === "Fixed" ? (i % 11 === 0 ? "Molly Reid" : "Auto") : outcome === "Escalated" ? approvers[1 + (i % 3)] : i % 2 === 0 ? "Auto" : "James Shaw"
        const rb = causes[i % causes.length]
        rows.push({
          id: `${idPrefix}-${outcome}-${i}`,
          at,
          tenantId: tenant.id,
          tenantName: tenant.name,
          issue: spec.issue,
          action: spec.action,
          event: outcome,
          outcome,
          actorKind: "ai",
          actor: approvedBy,
          confidence: outcome === "Escalated" ? 78 + (i % 12) : 88 + (i % 11),
          approvedBy,
          reason: outcome === "Rolled back" ? rb.cause : null,
          rollbackCause: outcome === "Rolled back" ? rb.cause : null,
          restored: outcome === "Rolled back" ? rb.restored : null,
          slaBreached: false,
          diff: null,
        })
        n += 1
      }
    }
  }

  pushMix(mix, 0, window7, "hist")
  pushMix(extraMix, window7, window23, "hist30")

  const breachHoursAgo = [8, 36, 53, 84, 120, 149]
  slaBreachSpecs.forEach((spec, i) => {
    const action = mspQueueItems.find((item) => item.issue === spec.issue)?.fixSummary ?? spec.issue
    const used = rows.find((row) => row.tenantId === spec.tenantId && row.issue === spec.issue && !row.slaBreached)
    const target = used ?? rows.find((row) => row.tenantId === spec.tenantId && !row.slaBreached) ?? rows[i]
    if (!target) return
    target.tenantId = spec.tenantId
    target.tenantName = spec.tenantName
    target.issue = spec.issue
    target.action = action
    target.slaBreached = true
    target.at = now - breachHoursAgo[i] * 3600_000
    target.actorKind = "ai"
    target.event = target.outcome ?? "Escalated"
  })
  const activityPins = [
    {
      id: "hist-nw-public-access",
      tenantId: "northwind",
      tenantName: "Northwind Logistics",
      issue: "Public access blocked on bucket",
      action: "Enabled Block Public Access on nw-prod-assets",
      event: "Fixed",
      outcome: "Fixed",
      actorKind: "ai",
      actor: "Auto",
      confidence: 96,
      approvedBy: "Auto",
      at: now - 12 * 60 * 1000,
      slaBreached: false,
      reason: null,
      rollbackCause: null,
      restored: null,
    },
    {
      id: "hist-nw-ami-rollback",
      tenantId: "northwind",
      tenantName: "Northwind Logistics",
      issue: "Node group AMI refresh",
      action: "Rolling replace of 2 node groups",
      event: "Rolled back",
      outcome: "Rolled back",
      actorKind: "ai",
      actor: "Auto",
      confidence: 81,
      approvedBy: "Auto",
      at: now - 2 * 3600_000,
      slaBreached: false,
      reason: "Health check failed on 1 of 2 nodes after the AMI refresh.",
      rollbackCause: "Health check failed on 1 of 2 nodes after the AMI refresh.",
      restored: "Previous AMI restored in 4 min. This fix type now requires human approval.",
    },
    {
      id: "hist-nw-s3-escalated",
      tenantId: "northwind",
      tenantName: "Northwind Logistics",
      issue: "S3 bucket versioning disabled",
      action: "Re-enable versioning on 3 buckets",
      event: "Escalated",
      outcome: "Escalated",
      actorKind: "ai",
      actor: "Auto",
      confidence: 92,
      approvedBy: "Auto",
      at: now - 4 * 3600_000,
      slaBreached: false,
      reason: null,
      rollbackCause: null,
      restored: null,
      relatedId: "hist-nw-s3-approved",
    },
  ]
  activityPins.forEach((pin) => {
    const inWindow = (row) => now - row.at <= window7
    const target =
      rows.find((row) => row.tenantId === pin.tenantId && row.outcome === pin.outcome && !row.slaBreached && inWindow(row)) ??
      rows.find((row) => row.outcome === pin.outcome && !row.slaBreached && inWindow(row)) ??
      rows.find((row) => row.tenantId === pin.tenantId && row.outcome === pin.outcome && !row.slaBreached) ??
      rows.find((row) => row.outcome === pin.outcome && !row.slaBreached)
    if (!target) return
    Object.assign(target, pin)
  })

  function rehomeNorthwind(outcome, needed) {
    const have = rows.filter((row) => row.tenantId === "northwind" && row.outcome === outcome && row.actorKind !== "human" && now - row.at <= window7).length
    const missing = needed - have
    if (missing <= 0) return
    const candidates = rows.filter(
      (row) => row.tenantId !== "northwind" && row.outcome === outcome && row.actorKind !== "human" && !row.slaBreached && now - row.at <= window7,
    )
    for (let i = 0; i < missing; i += 1) {
      const row = candidates[i]
      if (!row) return
      row.tenantId = "northwind"
      row.tenantName = "Northwind Logistics"
    }
  }
  rehomeNorthwind("Fixed", 41)
  rehomeNorthwind("Rolled back", 2)
  rehomeNorthwind("Escalated", 3)

  const humanActors = [OWNERS.MY, OWNERS.DK, OWNERS.MR, OWNERS.JS, OWNERS.AL]
  const humanResult = {
    "Approved fix": "Approved unchanged",
    "Rejected fix": "Rejected",
    "Manual remediation": "Manually applied",
    "Manual rollback": "Manually rolled back",
    Reassigned: "Reassigned",
    Snoozed: "Snoozed",
    Dismissed: "Dismissed",
    "Threshold changed": "Threshold updated",
  }
  const humanReason = {
    "Rejected fix": "Change would affect a production change window.",
    Dismissed: "Covered by an existing ticket.",
    Snoozed: "Waiting on a tenant maintenance window.",
  }
  const humanMix = [
    ["Approved fix", 72],
    ["Rejected fix", 16],
    ["Manual remediation", 14],
    ["Manual rollback", 6],
    ["Reassigned", 10],
    ["Snoozed", 8],
    ["Dismissed", 10],
    ["Threshold changed", 6],
  ]

  function pushHuman(pairs, windowStart, windowLen, idPrefix) {
    let h = 0
    for (const [event, count] of pairs) {
      for (let i = 0; i < count; i += 1) {
        const tenant = pool[(h * 5 + i) % pool.length]
        if (tenant.id === "northwind" && idPrefix === "hist") {
          h += 1
          continue
        }
        const spec = specs[h % specs.length]
        const owner = humanActors[(h + i) % humanActors.length]
        const needsReason = event === "Rejected fix" || event === "Dismissed" || event === "Snoozed"
        const hasDiff = event === "Manual remediation" || event === "Threshold changed"
        const offset = windowStart + Math.floor(((i + 1) / (count + 1)) * windowLen) + (h % 13) * 45_000
        const at = now - Math.min(offset, windowStart + windowLen - 60_000)
        rows.push({
          id: `${idPrefix}-human-${event.replaceAll(" ", "-")}-${i}`,
          at,
          tenantId: tenant.id,
          tenantName: tenant.name,
          issue: spec.issue,
          action: `${event}: ${spec.issue}`,
          event,
          outcome: humanResult[event],
          actorKind: "human",
          actor: owner.name,
          approvedBy: owner.name,
          confidence: null,
          reason: needsReason ? humanReason[event] : null,
          rollbackCause: null,
          restored: null,
          slaBreached: false,
          diff: hasDiff
            ? event === "Threshold changed"
              ? ["--- policy.auto_apply", "- min_confidence = 90", "+ min_confidence = 85"]
              : ["--- resource.policy", "- enabled = false", "+ enabled = true"]
            : null,
        })
        h += 1
      }
    }
  }

  pushHuman(humanMix, 0, window7, "hist")
  pushHuman(
    humanMix.map(([event, count]) => [event, Math.round(count * (23 / 7))]),
    window7,
    window23,
    "hist30",
  )

  const northwindHumans = [
    {
      id: "hist-nw-s3-approved",
      at: now - 38 * 60 * 1000,
      issue: "S3 bucket versioning",
      event: "Approved fix",
      actor: OWNERS.MY.name,
      relatedId: "hist-nw-s3-escalated",
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-manual-s3",
      at: now - 5 * 3600_000,
      issue: "S3 bucket versioning disabled",
      event: "Manual remediation",
      actor: OWNERS.DK.name,
      reason: null,
      diff: [
        "--- aws_s3_bucket.nw_prod_assets",
        "- versioning { enabled = false }",
        "+ versioning { enabled = true }",
      ],
    },
    {
      id: "hist-nw-rejected-ami",
      at: now - 8 * 3600_000,
      issue: "Node group AMI 47 days stale",
      event: "Rejected fix",
      actor: OWNERS.MY.name,
      reason: "Canary failed last week; wait for the next AMI before applying.",
      diff: null,
    },
    {
      id: "hist-nw-dismissed-tls",
      at: now - 11 * 3600_000,
      issue: "TLS certificate expires in 12 days",
      event: "Dismissed",
      actor: OWNERS.DK.name,
      reason: "Renewal already scheduled in the tenant change ticket.",
      diff: null,
    },
    {
      id: "hist-nw-threshold",
      at: now - 22 * 3600_000,
      issue: "Auto-apply confidence threshold",
      event: "Threshold changed",
      actor: OWNERS.MR.name,
      reason: null,
      diff: ["--- policy.auto_apply", "- min_confidence = 90", "+ min_confidence = 85"],
    },
    {
      id: "hist-nw-snoozed-eks",
      at: now - 28 * 3600_000,
      issue: "EKS control plane logging disabled",
      event: "Snoozed",
      actor: OWNERS.MY.name,
      reason: "Waiting on a tenant maintenance window.",
      diff: null,
    },
    {
      id: "hist-nw-reassigned",
      at: now - 30 * 3600_000,
      issue: "EventBridge rule targeting deleted bus",
      event: "Reassigned",
      actor: OWNERS.DK.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-manual-rollback",
      at: now - 40 * 3600_000,
      issue: "Public blob container policy drift",
      event: "Manual rollback",
      actor: OWNERS.JS.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-rds",
      at: now - 46 * 3600_000,
      issue: "RDS deletion protection disabled",
      event: "Approved fix",
      actor: OWNERS.AL.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-cve",
      at: now - 52 * 3600_000,
      issue: "Unpatched kernel CVE-2024-1086",
      event: "Approved fix",
      actor: OWNERS.MY.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-blob",
      at: now - 58 * 3600_000,
      issue: "Public blob container policy drift",
      event: "Approved fix",
      actor: OWNERS.DK.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-rejected-eventbridge",
      at: now - 70 * 3600_000,
      issue: "EventBridge rule targeting deleted bus",
      event: "Rejected fix",
      actor: OWNERS.MY.name,
      reason: "Needs a tenant admin grant before the bus can be recreated.",
      diff: null,
    },
    {
      id: "hist-nw-approved-logging",
      at: now - 76 * 3600_000,
      issue: "EKS control plane logging disabled",
      event: "Approved fix",
      actor: OWNERS.MY.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-tls",
      at: now - 82 * 3600_000,
      issue: "TLS certificate expires in 12 days",
      event: "Approved fix",
      actor: OWNERS.DK.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-ami",
      at: now - 90 * 3600_000,
      issue: "Node group AMI stale",
      event: "Approved fix",
      actor: OWNERS.MY.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-s3-prior",
      at: now - 100 * 3600_000,
      issue: "S3 bucket versioning disabled",
      event: "Approved fix",
      actor: OWNERS.AL.name,
      reason: null,
      diff: null,
    },
    {
      id: "hist-nw-approved-public",
      at: now - 110 * 3600_000,
      issue: "Public access blocked on bucket",
      event: "Approved fix",
      actor: OWNERS.DK.name,
      reason: null,
      diff: null,
    },
  ]
  northwindHumans.forEach((pin) => {
    rows.push({
      tenantId: "northwind",
      tenantName: "Northwind Logistics",
      action: `${pin.event}: ${pin.issue}`,
      outcome: humanResult[pin.event],
      actorKind: "human",
      approvedBy: pin.actor,
      confidence: null,
      rollbackCause: null,
      restored: null,
      slaBreached: false,
      ...pin,
    })
  })

  return rows.sort((a, b) => b.at - a.at)
}

export const mspHistory = buildMspHistory()

export function historyRowForActivity(entry, tenantId) {
  if (!entry) return null
  if (entry.historyId) return mspHistory.find((row) => row.id === entry.historyId) ?? null
  const inTenant = mspHistory.filter((row) => !tenantId || row.tenantId === tenantId)
  return (
    inTenant.find((row) => row.issue === entry.title && row.outcome === entry.outcome) ??
    inTenant.find((row) => row.issue === entry.title) ??
    inTenant.find((row) => row.outcome === entry.outcome) ??
    null
  )
}

export function isAiHistoryRow(row) {
  return row.actorKind !== "human"
}

export const HUMAN_EVENT_TYPES = [
  "Approved fix",
  "Rejected fix",
  "Manual remediation",
  "Manual rollback",
  "Reassigned",
  "Snoozed",
  "Dismissed",
  "Threshold changed",
]

export const HISTORY_TOTALS = (() => {
  const ai = mspHistory.filter(isAiHistoryRow)
  return {
    attempted: ai.filter((r) => ["Fixed", "Rolled back", "Escalated"].includes(r.outcome)).length,
    succeeded: ai.filter((r) => r.outcome === "Fixed").length,
    rolledBack: ai.filter((r) => r.outcome === "Rolled back").length,
    escalated: ai.filter((r) => r.outcome === "Escalated").length,
  }
})()

export function historyInRange(rows, rangeLabel, nowTs = Date.now()) {
  const ms = rangeMeta(rangeLabel).ms
  return rows.filter((row) => nowTs - row.at <= ms)
}

export function efficiencyForRange(rangeLabel) {
  const meta = rangeMeta(rangeLabel)
  const rows = historyInRange(mspHistory, rangeLabel).filter(isAiHistoryRow)
  const succeeded = rows.filter((r) => r.outcome === "Fixed").length
  const rolledBack = rows.filter((r) => r.outcome === "Rolled back").length
  const escalated = rows.filter((r) => r.outcome === "Escalated").length
  const attempted = succeeded + rolledBack + escalated
  const rate = attempted ? Number(((succeeded / attempted) * 100).toFixed(1)) : 0
  const hoursSaved = succeeded * 2
  const sparkline = meta.key === "7d" ? mspEfficiency.sparkline : sparkDistributed(rangeLabel, hoursSaved, "hours")
  return {
    rate,
    rateDeltaPts: meta.key === "24h" ? 0.6 : meta.key === "30d" ? 1.4 : mspEfficiency.rateDeltaPts,
    attempted,
    succeeded,
    rolledBack,
    escalated,
    hoursSaved,
    minutesPerFix: 20,
    hoursCalc: `${succeeded.toLocaleString()} succeeded remediations × 2h blended toil saved (20 min engineer fix + 100 min avoided incident coordination) = ${hoursSaved.toLocaleString()} hours.`,
    sparkline,
    periodLabel: meta.periodLabel,
    priorLabel: meta.priorLabel,
    chipLabel: meta.chipLabel,
  }
}

export function slaForRange(rangeLabel, tenantId) {
  const meta = rangeMeta(rangeLabel)
  const base = slaForTenant(tenantId)
  if (meta.key === "7d") {
    return { ...base, periodLabel: meta.periodLabel, priorLabel: meta.priorLabel }
  }
  const scaled = scaleSlaPriorities(base.byPriority, meta.countFactor)
  const view = buildSlaView(scaled, {
    ...base,
    deltaPts: meta.key === "24h" ? (tenantId ? 0.2 : 0.4) : tenantId ? 0.6 : 1.1,
    sparkline: sparkSeries(rangeLabel, base.metPct, "pct", 1),
    aiMedian: meta.key === "24h" ? (tenantId ? base.aiMedian : "3 min") : tenantId ? base.aiMedian : "5 min",
    humanMedian: meta.key === "24h" ? (tenantId ? base.humanMedian : "55 min") : tenantId ? base.humanMedian : "2h 40m",
    aiMedianMin: meta.key === "24h" && !tenantId ? 3 : base.aiMedianMin,
    humanMedianMin: meta.key === "24h" && !tenantId ? 55 : base.humanMedianMin,
  })
  return { ...view, periodLabel: meta.periodLabel, priorLabel: meta.priorLabel }
}

function applyRangeToOverview(overview, rangeLabel) {
  const meta = rangeMeta(rangeLabel)
  const mix = scaleCounts(overview.activityTotals.fixed, overview.activityTotals.rolledBack, overview.activityTotals.escalated, meta.countFactor)
  const attempted = mix.succeeded + mix.rolledBack + mix.escalated
  const rate = attempted ? Number(((mix.succeeded / attempted) * 100).toFixed(1)) : 100
  const portfolioAvg = efficiencyForRange(rangeLabel).rate
  const empty = overview.summary.mtta === "—"
  const mttaMin = empty ? null : meta.key === "24h" ? 14 : meta.key === "30d" ? 21 : Number.parseInt(overview.summary.mtta, 10) || 18
  const mttaDelta = empty ? 0 : meta.key === "24h" ? -2 : meta.key === "30d" ? -6 : overview.summary.mttaDeltaMin
  const mttrAi = empty ? "—" : meta.key === "24h" ? "5m" : meta.key === "30d" ? "7m" : overview.summary.mttrAi
  const mttrHuman = empty ? "—" : meta.key === "24h" ? "1h 20m" : meta.key === "30d" ? "2h 35m" : overview.summary.mttrHuman
  const mttrDelta = empty ? 0 : meta.key === "24h" ? -5 : meta.key === "30d" ? -18 : overview.summary.mttrDeltaMin
  const insight = mix.rolledBack
    ? meta.key === "7d" && overview.autonomy.insight
      ? overview.autonomy.insight
      : `${mix.rolledBack} rollback${mix.rolledBack === 1 ? " was" : "s were"} recorded in the ${meta.chipLabel}.`
    : null
  const srcHuman = overview.autonomy.human ?? { approved: 0, rejected: 0, manualFix: 0, dismissed: 0, reviewed: 0, overrideNumerator: 0, overrideRate: 0 }
  const humanMix = scaleCounts(srcHuman.approved, srcHuman.rejected, srcHuman.manualFix, meta.countFactor)
  const dismissed =
    meta.key === "7d" ? srcHuman.dismissed : meta.key === "24h" ? Math.min(1, srcHuman.dismissed) : Math.max(srcHuman.dismissed, Math.round(srcHuman.dismissed * (30 / 7)))
  const approved = meta.key === "24h" ? Math.max(srcHuman.approved ? 2 : 0, humanMix.succeeded) : humanMix.succeeded
  const rejected = meta.key === "24h" ? Math.max(srcHuman.rejected ? 1 : 0, humanMix.rolledBack) : humanMix.rolledBack
  const manualFix = meta.key === "24h" ? (srcHuman.manualFix ? 1 : 0) : humanMix.escalated
  const reviewed = approved + rejected + manualFix
  const overrideNumerator = rejected + manualFix
  const overrideRate = reviewed ? Math.round((overrideNumerator / reviewed) * 100) : 0
  const human = empty
    ? { approved: 0, rejected: 0, manualFix: 0, dismissed: 0, reviewed: 0, overrideNumerator: 0, overrideRate: 0 }
    : { approved, rejected, manualFix, dismissed, reviewed, overrideNumerator, overrideRate }
  const humanDecisions = empty
    ? 0
    : meta.key === "7d"
      ? (overview.activityTotals.humanDecisions ?? approved)
      : meta.key === "24h"
        ? approved + rejected
        : Math.round((overview.activityTotals.humanDecisions ?? approved) * (30 / 7))
  return {
    ...overview,
    periodLabel: meta.periodLabel,
    chipLabel: meta.chipLabel,
    priorLabel: meta.priorLabel,
    summary: {
      ...overview.summary,
      priorLabel: meta.priorLabel,
      periodLabel: meta.periodLabel,
      mtta: empty ? "—" : `${mttaMin}m`,
      mttaDeltaMin: mttaDelta,
      mttrAi,
      mttrHuman,
      mttrDeltaMin: mttrDelta,
      mttaSparkline: sparkSeries(rangeLabel, empty ? 10 : mttaMin, "minutes"),
    },
    activityTotals: { fixed: mix.succeeded, rolledBack: mix.rolledBack, escalated: mix.escalated, humanDecisions },
    autonomy: {
      ...overview.autonomy,
      rate,
      deltaPts: meta.key === "24h" ? -1.4 : meta.key === "30d" ? -2.2 : overview.autonomy.deltaPts,
      attempted,
      succeeded: mix.succeeded,
      rolledBack: mix.rolledBack,
      escalated: mix.escalated,
      portfolioAvg,
      insight,
      periodLabel: meta.periodLabel,
      priorLabel: meta.priorLabel,
      human,
    },
  }
}

export function exportHistoryCsv(rows) {
  const header = ["Timestamp", "Tenant", "Issue", "Event", "Actor", "Outcome", "Reason", "Confidence", "SLA"]
  const lines = rows.map((row) =>
    [
      new Date(row.at).toISOString(),
      row.tenantName,
      row.issue,
      row.event ?? row.outcome,
      row.actor ?? row.approvedBy,
      row.outcome,
      row.reason ?? "",
      row.confidence != null ? `${row.confidence}%` : "",
      row.slaBreached ? "SLA breached" : "",
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  )
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "beacon-remediation-history.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export function queueItemTouchesTenant(item, tenantId, tenantName) {
  if (item.affectedTenants?.some((t) => t.id === tenantId)) return true
  return (item.tenantNames ?? []).includes(tenantName)
}

export const QUEUE_AI_STATUSES = ["AI fixing", "Waiting on human", "Blocked"]
export const QUEUE_AGE_BUCKETS = ["< 1h", "1–4h", "4–24h", "> 24h"]

export function ageBucketFromHours(hours) {
  if (hours < 1) return "< 1h"
  if (hours < 4) return "1–4h"
  if (hours < 24) return "4–24h"
  return "> 24h"
}

function emptyQueueBuckets() {
  return QUEUE_AGE_BUCKETS.map((label) => ({
    label,
    "AI fixing": 0,
    "Waiting on human": 0,
    Blocked: 0,
  }))
}

function bucketsFromQueue(items) {
  const buckets = emptyQueueBuckets()
  const idx = Object.fromEntries(QUEUE_AGE_BUCKETS.map((label, i) => [label, i]))
  for (const item of items) {
    const key = item.ageBucket ?? ageBucketFromHours(item.waitHours ?? 0)
    const row = buckets[idx[key] ?? 0]
    if (row && item.aiStatus) row[item.aiStatus] = (row[item.aiStatus] ?? 0) + 1
  }
  return buckets
}

function tenantQueueRow(partial) {
  const global = mspQueueItems.find((row) => row.id === partial.id)
  const waitHours = partial.waitHours ?? 2
  const name = "Northwind Logistics"
  const owner = partial.ownerKey ? OWNERS[partial.ownerKey] : "owner" in partial ? partial.owner : global?.owner ?? null
  return {
    ...global,
    ...partial,
    owner,
    breachAt: now + (partial.minutesToBreach ?? 240) * 60 * 1000,
    waitHours,
    ageBucket: ageBucketFromHours(waitHours),
    tenantCount: 1,
    tenantNames: [name],
    tenantId: "northwind",
    cluster: false,
    affectedTenants: [{ id: "northwind", name, initials: "NW" }],
    rollbackPlan: partial.rollbackPlan ?? global?.rollbackPlan,
    rationale: partial.rationale ?? partial.reason ?? global?.rationale,
    reversible: partial.reversible ?? global?.reversible ?? true,
    cta: partial.cta ?? "review",
  }
}

const NORTHWIND_QUEUE = [
  tenantQueueRow({
    id: "esc-s3",
    issue: "S3 bucket versioning disabled",
    priority: "Critical",
    score: 95,
    reason: "Blast radius exceeds auto-apply limit",
    minutesToBreach: 72,
    confidence: 92,
    reversible: true,
    fixSummary: "Re-enable versioning on 3 buckets",
    owner: null,
    aiStatus: "Waiting on human",
    waitHours: 6.33,
  }),
  tenantQueueRow({
    id: "esc-eks-logging",
    issue: "EKS control plane logging disabled",
    priority: "Critical",
    score: 95,
    reason: "Confidence below 90% threshold",
    minutesToBreach: 108,
    confidence: 88,
    reversible: true,
    fixSummary: "Enable api, audit and authenticator logs",
    ownerKey: "MY",
    aiStatus: "Waiting on human",
    waitHours: 2.1,
  }),
  tenantQueueRow({
    id: "esc-ami",
    issue: "Node group AMI 47 days stale",
    priority: "High",
    score: 82,
    reason: "Previous auto-fix was rolled back",
    minutesToBreach: 185,
    confidence: 84,
    reversible: true,
    fixSummary: "Rolling replace of 2 node groups",
    ownerKey: "DK",
    aiStatus: "Waiting on human",
    waitHours: 2.6,
  }),
  tenantQueueRow({
    id: "esc-eventbridge",
    issue: "EventBridge rule targeting deleted bus",
    priority: "Critical",
    score: 96,
    reason: "Needs tenant admin access grant",
    minutesToBreach: 340,
    confidence: 91,
    reversible: true,
    fixSummary: "Recreate default bus, re-point 3 rules",
    owner: null,
    aiStatus: "Blocked",
    waitHours: 30,
    cta: "request-access",
  }),
  tenantQueueRow({
    id: "esc-tls",
    issue: "TLS certificate expires in 12 days",
    priority: "High",
    score: 73,
    reason: ESCALATION_REASONS.blast,
    minutesToBreach: 480,
    confidence: 96,
    reversible: true,
    fixSummary: "Issue ACM certs and swap listeners with overlap",
    owner: null,
    aiStatus: "Waiting on human",
    waitHours: 0.5,
  }),
  tenantQueueRow({
    id: "esc-rds",
    issue: "RDS deletion protection disabled",
    priority: "High",
    score: 80,
    reason: ESCALATION_REASONS.policy,
    minutesToBreach: 600,
    confidence: 93,
    reversible: true,
    fixSummary: "Enable deletion_protection and lock Terraform",
    ownerKey: "AL",
    aiStatus: "AI fixing",
    waitHours: 0.4,
  }),
  tenantQueueRow({
    id: "esc-cve",
    issue: "Unpatched kernel CVE-2024-1086",
    priority: "High",
    score: 78,
    reason: ESCALATION_REASONS.confidence,
    minutesToBreach: 720,
    confidence: 84,
    reversible: false,
    fixSummary: "Roll a canary AMI, then fleet-replace remaining nodes",
    ownerKey: "MR",
    aiStatus: "AI fixing",
    waitHours: 0.35,
  }),
  tenantQueueRow({
    id: "esc-blob",
    issue: "Public blob container policy drift",
    priority: "Medium",
    score: 64,
    reason: ESCALATION_REASONS.policy,
    minutesToBreach: 900,
    confidence: 91,
    reversible: true,
    fixSummary: "Restore private ACL and rotate leaked SAS tokens",
    owner: null,
    aiStatus: "AI fixing",
    waitHours: 0.55,
  }),
  tenantQueueRow({
    id: "esc-privileged",
    issue: "Privileged container runtime allowed",
    priority: "Medium",
    score: 61,
    reason: "Needs tenant admin access grant",
    minutesToBreach: 1080,
    confidence: 89,
    reversible: true,
    fixSummary: "Enforce restricted PodSecurity and evict privileged pods",
    owner: null,
    aiStatus: "Blocked",
    waitHours: 8,
  }),
]

const NORTHWIND_OVERVIEW = {
  name: "Northwind Logistics",
  health: "warning",
  summary: {
    open: 9,
    critical: 2,
    high: 4,
    medium: 3,
    waiting: 4,
    oldestWait: "6h 20m",
    aiFixing: 3,
    blocked: 2,
    mtta: "18m",
    mttaDeltaMin: -4,
    mttrAi: "6m",
    mttrHuman: "2h 10m",
    mttrDeltaMin: -12,
    mttaSparkline: [
      { date: "Sep 30", minutes: 26 },
      { date: "Oct 1", minutes: 24 },
      { date: "Oct 2", minutes: 22 },
      { date: "Oct 3", minutes: 21 },
      { date: "Oct 4", minutes: 20 },
      { date: "Oct 5", minutes: 19 },
      { date: "Oct 6", minutes: 18 },
    ],
  },
  activity: [
    {
      id: "nw-act-1",
      actorKind: "ai",
      title: "Public access blocked on bucket",
      outcome: "Fixed",
      confidence: 96,
      description:
        "Enabled Block Public Access on nw-prod-assets. No downstream changes detected after the post-fix check.",
      chips: ["12 min ago", "Auto-applied", "Reversible"],
      actionLabel: "View change",
      action: "history",
      historyId: "hist-nw-public-access",
    },
    {
      id: "nw-act-human-1",
      actorKind: "human",
      actor: "Maisie Y.",
      actorName: "Maisie Young",
      title: "Approved fix: S3 bucket versioning",
      outcome: "Approved unchanged",
      description: "Maisie Young approved the staged versioning fix without changes after the earlier AI escalation.",
      chips: ["38 min ago", "Approved unchanged", "Human-approved"],
      actionLabel: "View in log",
      action: "history",
      historyId: "hist-nw-s3-approved",
    },
    {
      id: "nw-act-2",
      actorKind: "ai",
      title: "Node group AMI refresh",
      outcome: "Rolled back",
      confidence: 81,
      description:
        "Health check failed on 1 of 2 nodes. Previous AMI restored in 4 min. This fix type now requires human approval.",
      chips: ["2h ago", "Auto-applied", "Restored in 4 min"],
      actionLabel: "View reason",
      action: "history",
      historyId: "hist-nw-ami-rollback",
      openRollback: true,
    },
    {
      id: "nw-act-3",
      actorKind: "ai",
      title: "EKS control plane logging",
      outcome: "Escalated",
      confidence: 88,
      description:
        "Confidence of 88% is below the 90% auto-apply threshold, so the fix was routed to a human owner for review.",
      chips: ["3h ago", "Waiting on Maisie Young", "Reversible"],
      actionLabel: "Open in queue",
      action: "queue",
      queueId: "esc-eks-logging",
    },
    {
      id: "nw-act-human-2",
      actorKind: "human",
      actor: "Daniel K.",
      actorName: "Daniel King",
      title: "Manual remediation: S3 bucket versioning",
      outcome: "Manually applied",
      description: "Daniel King enabled versioning directly after reviewing the staged plan.",
      chips: ["5h ago", "Manually applied", "Human-approved"],
      actionLabel: "View change",
      action: "history",
      historyId: "hist-nw-manual-s3",
      openChange: true,
    },
    {
      id: "nw-act-human-3",
      actorKind: "human",
      actor: "Maisie Y.",
      actorName: "Maisie Young",
      title: "Rejected fix: Node group AMI",
      outcome: "Rejected",
      description: "Canary failed last week; wait for the next AMI before applying.",
      chips: ["8h ago", "Rejected", "Human-approved"],
      actionLabel: "View in log",
      action: "history",
      historyId: "hist-nw-rejected-ami",
    },
    {
      id: "nw-act-4",
      actorKind: "ai",
      title: "RDS backup retention extended",
      outcome: "Fixed",
      confidence: 94,
      description: "Raised automated backup retention to 35 days on nw-prod-postgres after the last restore drill.",
      chips: ["Yesterday 16:40", "Auto-applied", "Reversible"],
      actionLabel: "View change",
      action: "history",
      historyId: "hist-nw-rds-backup",
    },
    {
      id: "nw-act-5",
      actorKind: "ai",
      title: "GuardDuty detector re-enabled",
      outcome: "Fixed",
      confidence: 97,
      description: "Restored the organisation detector in eu-west-2 after it was paused during the account move.",
      chips: ["Yesterday 09:12", "Auto-applied", "Reversible"],
      actionLabel: "View change",
      action: "history",
      historyId: "hist-nw-guardduty",
    },
  ],
  activityTotals: { fixed: 41, rolledBack: 2, escalated: 3, humanDecisions: 9 },
  autonomy: {
    rate: 89.1,
    deltaPts: -3.1,
    attempted: 46,
    succeeded: 41,
    rolledBack: 2,
    escalated: 3,
    portfolioAvg: 94.2,
    insight:
      "2 fixes were rolled back this week, both on the node group AMI refresh. Human approval is now required for that fix type.",
    human: {
      approved: 9,
      rejected: 2,
      manualFix: 1,
      dismissed: 1,
      reviewed: 12,
      overrideNumerator: 3,
      overrideRate: 25,
    },
  },
  queue: NORTHWIND_QUEUE,
  timeInQueue: bucketsFromQueue(NORTHWIND_QUEUE),
}

function healthyOverview(tenant) {
  const attempted = (tenant.aiFixed7d ?? 0) + (tenant.rolledBack7d ?? 0) + (tenant.escalated7d ?? 0)
  return {
    name: tenant.name,
    health: tenant.health,
    summary: {
      open: 0,
      critical: 0,
      high: 0,
      medium: 0,
      waiting: 0,
      oldestWait: null,
      aiFixing: 0,
      blocked: 0,
      mtta: "—",
      mttaDeltaMin: 0,
      mttrAi: "—",
      mttrHuman: "—",
      mttrDeltaMin: 0,
      mttaSparkline: [
        { date: "Sep 30", minutes: 12 },
        { date: "Oct 1", minutes: 11 },
        { date: "Oct 2", minutes: 12 },
        { date: "Oct 3", minutes: 10 },
        { date: "Oct 4", minutes: 11 },
        { date: "Oct 5", minutes: 10 },
        { date: "Oct 6", minutes: 9 },
      ],
    },
    activity: [],
    activityTotals: {
      fixed: tenant.aiFixed7d ?? 0,
      rolledBack: tenant.rolledBack7d ?? 0,
      escalated: tenant.escalated7d ?? 0,
      humanDecisions: 0,
    },
    autonomy: {
      rate: attempted ? Number((((tenant.aiFixed7d ?? 0) / attempted) * 100).toFixed(1)) : 100,
      deltaPts: 0.4,
      attempted,
      succeeded: tenant.aiFixed7d ?? 0,
      rolledBack: tenant.rolledBack7d ?? 0,
      escalated: tenant.escalated7d ?? 0,
      portfolioAvg: 94.2,
      insight: null,
      human: { approved: 0, rejected: 0, manualFix: 0, dismissed: 0, reviewed: 0, overrideNumerator: 0, overrideRate: 0 },
    },
    queue: [],
    timeInQueue: emptyQueueBuckets(),
  }
}

function derivedOverview(tenant) {
  const queue = (tenant.openIssues ?? []).map((row, i) => {
    const global = row.queueItemId ? mspQueueItems.find((item) => item.id === row.queueItemId) : null
    const waitHours = row.aiStatus === "Blocked" ? 8 : row.aiStatus === "Waiting on human" ? 2 + i : 0.4
    return {
      ...(global ?? {}),
      id: row.queueItemId ?? `${tenant.id}-issue-${i}`,
      issue: row.title,
      priority: row.severity,
      score: global?.score ?? (row.severity === "Critical" ? 90 : row.severity === "High" ? 80 : 60),
      reason: global?.reason ?? "Requires review",
      breachAt: now + (180 + i * 90) * 60 * 1000,
      confidence: global?.confidence ?? 88,
      reversible: global?.reversible ?? true,
      fixSummary: global?.fixSummary ?? "Apply the recommended control",
      owner: global?.owner ?? tenant.owner,
      aiStatus: row.aiStatus,
      waitHours,
      ageBucket: ageBucketFromHours(waitHours),
      tenantCount: 1,
      tenantNames: [tenant.name],
      tenantId: tenant.id,
      cluster: false,
      affectedTenants: [{ id: tenant.id, name: tenant.name, initials: tenant.initials }],
      cta: row.aiStatus === "Blocked" ? "request-access" : "review",
      rollbackPlan: global?.rollbackPlan,
      rationale: global?.rationale,
    }
  })
  const attempted = (tenant.aiFixed7d ?? 0) + (tenant.rolledBack7d ?? 0) + (tenant.escalated7d ?? 0)
  return {
    name: tenant.name,
    health: tenant.health,
    summary: {
      open: queue.length,
      critical: queue.filter((q) => q.priority === "Critical").length,
      high: queue.filter((q) => q.priority === "High").length,
      medium: queue.filter((q) => q.priority === "Medium").length,
      waiting: queue.filter((q) => q.aiStatus === "Waiting on human").length,
      oldestWait: queue.length ? "2h 10m" : null,
      aiFixing: queue.filter((q) => q.aiStatus === "AI fixing").length,
      blocked: queue.filter((q) => q.aiStatus === "Blocked").length,
      mtta: "22m",
      mttaDeltaMin: -2,
      mttrAi: "8m",
      mttrHuman: "1h 40m",
      mttrDeltaMin: -6,
      mttaSparkline: [
        { date: "Sep 30", minutes: 28 },
        { date: "Oct 1", minutes: 26 },
        { date: "Oct 2", minutes: 25 },
        { date: "Oct 3", minutes: 24 },
        { date: "Oct 4", minutes: 23 },
        { date: "Oct 5", minutes: 22 },
        { date: "Oct 6", minutes: 22 },
      ],
    },
    activity: (tenant.recentAi ?? []).slice(0, 5).map((row) => ({
      id: row.id,
      actorKind: "ai",
      title: row.action,
      outcome: row.outcome,
      confidence: 90,
      description: `${row.action} · ${row.at}.`,
      chips: [row.at, "Auto-applied", "Reversible"],
      actionLabel: row.outcome === "Rolled back" ? "View reason" : "View change",
      action: "history",
      openRollback: row.outcome === "Rolled back",
    })),
    activityTotals: {
      fixed: tenant.aiFixed7d ?? 0,
      rolledBack: tenant.rolledBack7d ?? 0,
      escalated: tenant.escalated7d ?? 0,
      humanDecisions: 0,
    },
    autonomy: {
      rate: attempted ? Number((((tenant.aiFixed7d ?? 0) / attempted) * 100).toFixed(1)) : 100,
      deltaPts: 0.6,
      attempted,
      succeeded: tenant.aiFixed7d ?? 0,
      rolledBack: tenant.rolledBack7d ?? 0,
      escalated: tenant.escalated7d ?? 0,
      portfolioAvg: 94.2,
      insight: tenant.rolledBack7d ? `${tenant.rolledBack7d} rollback(s) in the last 7 days for this tenant.` : null,
      human: { approved: 0, rejected: 0, manualFix: 0, dismissed: 0, reviewed: 0, overrideNumerator: 0, overrideRate: 0 },
    },
    queue,
    timeInQueue: bucketsFromQueue(queue),
  }
}

export const TENANT_OVERVIEWS = {
  northwind: NORTHWIND_OVERVIEW,
}

export function tenantOverviewFor(tenantId, rangeLabel = "Last 7 days") {
  let base
  if (TENANT_OVERVIEWS[tenantId]) {
    base = TENANT_OVERVIEWS[tenantId]
  } else {
    const tenant = mspTenants.find((row) => row.id === tenantId)
    if (!tenant) {
      base = healthyOverview({ name: "Tenant", health: "secure", aiFixed7d: 0, rolledBack7d: 0, escalated7d: 0, openIssues: [] })
    } else if (!tenant.openIssues?.length) {
      base = healthyOverview(tenant)
    } else {
      base = derivedOverview(tenant)
    }
  }
  return applyRangeToOverview(base, rangeLabel)
}
