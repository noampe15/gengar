export const businessUnits = [
  {
    id: "checkout",
    name: "Checkout & Core Revenue",
    icon: "cart",
    rto: "< 15 min",
    resources: 34,
    delta: 4.2,
    score: 92,
    severity: "Critical",
  },
  {
    id: "logistics",
    name: "Logistics & Supply",
    icon: "truck",
    rto: "< 1 hr",
    resources: 28,
    delta: 1.8,
    score: 74,
    severity: "High",
  },
  {
    id: "support",
    name: "Customer Support Systems",
    icon: "headset",
    rto: "< 4 hrs",
    resources: 18,
    delta: -2.1,
    score: 45,
    severity: "Medium",
  },
  {
    id: "hr",
    name: "Internal HR & Billing",
    icon: "users",
    rto: "< 24 hrs",
    resources: 11,
    delta: -8.5,
    score: 12,
    severity: "Low",
  },
]

export const deficitRows = [
  {
    name: "Databases",
    count: 118,
    segments: { Critical: 42, High: 34, Medium: 28, Low: 14 },
  },
  {
    name: "Virtual Machines",
    count: 241,
    segments: { Critical: 58, High: 72, Medium: 81, Low: 30 },
  },
  {
    name: "Storage Services",
    count: 312,
    segments: { Critical: 38, High: 70, Medium: 148, Low: 56 },
  },
  {
    name: "Containers",
    count: 94,
    segments: { Critical: 22, High: 31, Medium: 27, Low: 14 },
  },
  {
    name: "Networking",
    count: 79,
    segments: { Critical: 24, High: 29, Medium: 18, Low: 8 },
  },
  {
    name: "Key Vaults",
    count: 38,
    extra: true,
    segments: { Critical: 5, High: 7, Medium: 9, Low: 17 },
  },
  {
    name: "Identity Systems",
    count: 52,
    extra: true,
    segments: { Critical: 16, High: 11, Medium: 17, Low: 8 },
  },
]

export const risks = [
  {
    id: "r1",
    name: "prod-db-postgresql-04",
    type: "RDS",
    icon: "db",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Active IaC configuration drift",
    relatedResources: ["prod-db-postgresql-05", "prod-db-replica-01"],
    provider: "AWS",
    rtoDelta: 14,
    checkedAgo: "checked 6h ago",
    tbr: "< 2 Mins",
    tbrNote: "Direct Dependency",
    tbrTone: "red",
    priority: "Critical",
    score: 94,
  },
  {
    id: "r2",
    name: "vm-prod-core-api-07",
    type: "VM",
    icon: "vm",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Snapshot verification protection gap",
    relatedResources: ["vm-prod-core-api-08", "vm-prod-core-api-09", "vm-prod-worker-03"],
    provider: "Azure",
    rtoDelta: 9,
    checkedAgo: "checked 5h ago",
    tbr: "45 Mins",
    tbrNote: "Buffered by Cache",
    tbrTone: "amber",
    priority: "Critical",
    score: 91,
  },
  {
    id: "r3",
    name: "prod-k8s-cluster-payments-01",
    type: "EKS",
    icon: "k8s",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Missing disaster recovery runbook",
    relatedResources: ["prod-k8s-cluster-checkout-02"],
    provider: "GCP",
    rtoDelta: 11,
    checkedAgo: "checked 8h ago",
    tbr: "< 5 Mins",
    tbrNote: "Core Gateway",
    tbrTone: "red",
    priority: "Critical",
    score: 88,
  },
  {
    id: "r4",
    name: "prod-cache-redis-edge-02",
    type: "Cache",
    icon: "db",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Unencrypted replication traffic",
    relatedResources: [
      "prod-cache-redis-edge-03",
      "prod-cache-redis-edge-04",
      "prod-cache-session-01",
      "prod-cache-session-02",
    ],
    provider: "AWS",
    rtoDelta: 7,
    checkedAgo: "checked 3h ago",
    tbr: "< 8 Mins",
    tbrNote: "Session Store",
    tbrTone: "red",
    priority: "High",
    score: 81,
  },
  {
    id: "r5",
    name: "stg-lb-checkout-front-03",
    type: "LB",
    icon: "net",
    businessUnit: "Logistics & Supply",
    tier: "Tier-2",
    issue: "TLS certificate expires in 12 days",
    relatedResources: ["stg-lb-checkout-front-04"],
    provider: "AWS",
    rtoDelta: 6,
    checkedAgo: "checked 2h ago",
    tbr: "18 Mins",
    tbrNote: "Edge Ingress",
    tbrTone: "amber",
    priority: "High",
    score: 76,
  },
  {
    id: "r6",
    name: "prod-sa-storage-invoices",
    type: "Storage",
    icon: "storage",
    businessUnit: "Internal HR & Billing",
    tier: "Tier-2",
    issue: "Public blob container policy drift",
    relatedResources: ["prod-sa-storage-payroll", "prod-sa-storage-archive"],
    provider: "Azure",
    rtoDelta: 4,
    checkedAgo: "checked 9h ago",
    tbr: "2 Hrs",
    tbrNote: "Buffered by Replica",
    tbrTone: "muted",
    priority: "Medium",
    score: 58,
  },
  {
    id: "r7",
    name: "prod-gke-support-chat-04",
    type: "GKE",
    icon: "k8s",
    businessUnit: "Customer Support Systems",
    tier: "Tier-2",
    issue: "HPA max replicas too low for peak",
    relatedResources: [],
    provider: "GCP",
    rtoDelta: 3,
    checkedAgo: "checked 1h ago",
    tbr: "35 Mins",
    tbrNote: "Queued Fallback",
    tbrTone: "amber",
    priority: "Medium",
    score: 52,
  },
  {
    id: "r8",
    name: "prod-vm-warehouse-sync-11",
    type: "VM",
    icon: "vm",
    businessUnit: "Logistics & Supply",
    tier: "Tier-2",
    issue: "Backup window overlapping peak load",
    relatedResources: ["prod-vm-warehouse-sync-12", "prod-vm-warehouse-etl-02"],
    provider: "Azure",
    rtoDelta: 5,
    checkedAgo: "checked 4h ago",
    tbr: "50 Mins",
    tbrNote: "Batch Pipeline",
    tbrTone: "amber",
    priority: "High",
    score: 69,
  },
  {
    id: "r9",
    name: "prod-net-vpn-hub-01",
    type: "VPN",
    icon: "net",
    businessUnit: "Internal HR & Billing",
    tier: "Tier-3",
    issue: "Stale firewall exception for contractor CIDR",
    relatedResources: [
      "prod-net-vpn-spoke-02",
      "prod-net-vpn-spoke-03",
      "prod-net-fw-hub-01",
      "prod-net-fw-hub-02",
      "prod-net-bastion-01",
      "prod-net-bastion-02",
    ],
    provider: "AWS",
    rtoDelta: 2,
    checkedAgo: "checked 11h ago",
    tbr: "4 Hrs",
    tbrNote: "Admin Path",
    tbrTone: "muted",
    priority: "Low",
    score: 24,
  },
  {
    id: "r10",
    name: "prod-bq-analytics-mart",
    type: "Warehouse",
    icon: "db",
    businessUnit: "Customer Support Systems",
    tier: "Tier-3",
    issue: "No regional failover configured",
    relatedResources: ["prod-bq-reporting-mart"],
    provider: "GCP",
    rtoDelta: 1,
    checkedAgo: "checked 7h ago",
    tbr: "6 Hrs",
    tbrNote: "Reporting Only",
    tbrTone: "muted",
    priority: "Low",
    score: 18,
  },
  {
    id: "r1m",
    name: "prod-db-postgresql-04",
    type: "RDS",
    icon: "db",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Missing point-in-time restore coverage",
    relatedResources: [],
    provider: "AWS",
    rtoDelta: 8,
    checkedAgo: "checked 6h ago",
    tbr: "< 2 Mins",
    tbrNote: "Direct Dependency",
    tbrTone: "red",
    priority: "High",
    score: 73,
  },
  {
    id: "r2m",
    name: "vm-prod-core-api-07",
    type: "VM",
    icon: "vm",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Unpatched kernel CVE-2024-1086",
    relatedResources: [],
    provider: "Azure",
    rtoDelta: 10,
    checkedAgo: "checked 5h ago",
    tbr: "45 Mins",
    tbrNote: "Buffered by Cache",
    tbrTone: "amber",
    priority: "Critical",
    score: 86,
  },
  {
    id: "r3m",
    name: "prod-k8s-cluster-payments-01",
    type: "EKS",
    icon: "k8s",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "Privileged container runtime allowed",
    relatedResources: [],
    provider: "GCP",
    rtoDelta: 6,
    checkedAgo: "checked 8h ago",
    tbr: "< 5 Mins",
    tbrNote: "Core Gateway",
    tbrTone: "red",
    priority: "High",
    score: 79,
  },
]

export const healthyResources = [
  {
    id: "h1",
    name: "prod-db-catalog-readonly-02",
    type: "RDS",
    icon: "db",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "",
    relatedResources: [],
    provider: "AWS",
    rtoDelta: 0,
    checkedAgo: "checked 18m ago",
    tbr: "< 2 Mins",
    tbrNote: "Read replica",
    tbrTone: "muted",
    priority: "None",
    score: 4,
    healthy: true,
  },
  {
    id: "h2",
    name: "prod-vm-payments-web-03",
    type: "VM",
    icon: "vm",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "",
    relatedResources: [],
    provider: "Azure",
    rtoDelta: 0,
    checkedAgo: "checked 22m ago",
    tbr: "12 Mins",
    tbrNote: "Auto-healed",
    tbrTone: "muted",
    priority: "None",
    score: 6,
    healthy: true,
  },
  {
    id: "h3",
    name: "prod-eks-search-cluster-02",
    type: "EKS",
    icon: "k8s",
    businessUnit: "Customer Support Systems",
    tier: "Tier-2",
    issue: "",
    relatedResources: [],
    provider: "AWS",
    rtoDelta: 0,
    checkedAgo: "checked 9m ago",
    tbr: "20 Mins",
    tbrNote: "Within SLO",
    tbrTone: "muted",
    priority: "None",
    score: 5,
    healthy: true,
  },
  {
    id: "h4",
    name: "prod-gcs-static-assets",
    type: "Storage",
    icon: "storage",
    businessUnit: "Customer Support Systems",
    tier: "Tier-2",
    issue: "",
    relatedResources: [],
    provider: "GCP",
    rtoDelta: 0,
    checkedAgo: "checked 14m ago",
    tbr: "1 Hr",
    tbrNote: "CDN backed",
    tbrTone: "muted",
    priority: "None",
    score: 3,
    healthy: true,
  },
  {
    id: "h5",
    name: "prod-lb-public-edge-01",
    type: "LB",
    icon: "net",
    businessUnit: "Logistics & Supply",
    tier: "Tier-2",
    issue: "",
    relatedResources: [],
    provider: "AWS",
    rtoDelta: 0,
    checkedAgo: "checked 7m ago",
    tbr: "8 Mins",
    tbrNote: "Healthy targets",
    tbrTone: "muted",
    priority: "None",
    score: 5,
    healthy: true,
  },
  {
    id: "h6",
    name: "prod-cache-catalog-01",
    type: "Cache",
    icon: "db",
    businessUnit: "Checkout & Billing",
    tier: "Tier-1",
    issue: "",
    relatedResources: [],
    provider: "AWS",
    rtoDelta: 0,
    checkedAgo: "checked 11m ago",
    tbr: "< 4 Mins",
    tbrNote: "Hit rate 98%",
    tbrTone: "muted",
    priority: "None",
    score: 4,
    healthy: true,
  },
  {
    id: "h7",
    name: "prod-kv-secrets-core",
    type: "Key Vault",
    icon: "storage",
    businessUnit: "Internal HR & Billing",
    tier: "Tier-1",
    issue: "",
    relatedResources: [],
    provider: "Azure",
    rtoDelta: 0,
    checkedAgo: "checked 16m ago",
    tbr: "30 Mins",
    tbrNote: "Rotated on schedule",
    tbrTone: "muted",
    priority: "None",
    score: 7,
    healthy: true,
  },
  {
    id: "h8",
    name: "prod-gke-batch-reports-01",
    type: "GKE",
    icon: "k8s",
    businessUnit: "Internal HR & Billing",
    tier: "Tier-3",
    issue: "",
    relatedResources: [],
    provider: "GCP",
    rtoDelta: 0,
    checkedAgo: "checked 25m ago",
    tbr: "3 Hrs",
    tbrNote: "Batch window met",
    tbrTone: "muted",
    priority: "None",
    score: 8,
    healthy: true,
  },
]

export const tenants = [
  {
    id: "northwind",
    name: "Northwind Logistics",
    env: "Production · us-east-1",
    initials: "NW",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: 0,
    deltaShift: 0,
    rtoShift: 0,
    countFactor: 1,
    namePrefix: "nw",
    riskShift: 0,
  },
  {
    id: "helios",
    name: "Helios Payments",
    env: "Production · eu-west-1",
    initials: "HP",
    status: "degraded",
    statusLabel: "Elevated risk",
    scoreShift: 6,
    deltaShift: 2.4,
    rtoShift: 4,
    countFactor: 0.82,
    namePrefix: "hlx",
    riskShift: -22,
  },
  {
    id: "atlas",
    name: "Atlas Freight",
    env: "Production · ap-southeast-2",
    initials: "AF",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -8,
    deltaShift: -1.3,
    rtoShift: 1,
    countFactor: 1.35,
    namePrefix: "atf",
    riskShift: -42,
  },
  {
    id: "meridian",
    name: "Meridian Clinics",
    env: "HIPAA · us-central1",
    initials: "MC",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -18,
    deltaShift: -4.6,
    rtoShift: -3,
    countFactor: 0.64,
    namePrefix: "mdc",
    riskShift: -60,
  },
  {
    id: "lumen",
    name: "Lumen Studios",
    env: "Production · us-west-2",
    initials: "LS",
    status: "incident",
    statusLabel: "Incident watch",
    scoreShift: 11,
    deltaShift: 5.1,
    rtoShift: 7,
    countFactor: 1.18,
    namePrefix: "lms",
    riskShift: 11,
  },
  {
    id: "acme",
    name: "Industrial Illusions",
    env: "Production · us-east-2",
    initials: "II",
    status: "degraded",
    statusLabel: "Elevated risk",
    scoreShift: 4,
    deltaShift: 1.7,
    rtoShift: 2,
    countFactor: 1.12,
    namePrefix: "acm",
    riskShift: -8,
  },
  {
    id: "contoso",
    name: "Contoso Logistics",
    env: "Production · eu-central-1",
    initials: "CL",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -10,
    deltaShift: -2.1,
    rtoShift: 0,
    countFactor: 0.91,
    namePrefix: "cts",
    riskShift: -28,
  },
  {
    id: "fabrikam",
    name: "Fabrikam Health",
    env: "HIPAA · us-east-1",
    initials: "FH",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -14,
    deltaShift: -3.2,
    rtoShift: -1,
    countFactor: 0.72,
    namePrefix: "fbk",
    riskShift: -48,
  },
  {
    id: "globex",
    name: "Globex Manufacturing",
    env: "Production · ap-northeast-1",
    initials: "GX",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: 2,
    deltaShift: 0.8,
    rtoShift: 3,
    countFactor: 1.22,
    namePrefix: "glx",
    riskShift: -16,
  },
  {
    id: "initech",
    name: "Initech SaaS",
    env: "Production · us-west-1",
    initials: "IN",
    status: "incident",
    statusLabel: "Incident watch",
    scoreShift: 9,
    deltaShift: 3.6,
    rtoShift: 5,
    countFactor: 0.88,
    namePrefix: "int",
    riskShift: 6,
  },
  {
    id: "umbrella",
    name: "Umbrella Pharma",
    env: "GxP · eu-west-2",
    initials: "UP",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -6,
    deltaShift: -1.1,
    rtoShift: 1,
    countFactor: 0.79,
    namePrefix: "umb",
    riskShift: -34,
  },
  {
    id: "stark",
    name: "Stark Industrial",
    env: "Production · us-east-1",
    initials: "SI",
    status: "degraded",
    statusLabel: "Elevated risk",
    scoreShift: 7,
    deltaShift: 2.9,
    rtoShift: 4,
    countFactor: 1.41,
    namePrefix: "stk",
    riskShift: -4,
  },
  {
    id: "wayne",
    name: "Wayne Retail Group",
    env: "Production · us-west-2",
    initials: "WR",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -3,
    deltaShift: -0.6,
    rtoShift: 1,
    countFactor: 1.08,
    namePrefix: "wyn",
    riskShift: -38,
  },
  {
    id: "piedpiper",
    name: "Pied Piper Cloud",
    env: "Production · eu-north-1",
    initials: "PP",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -12,
    deltaShift: -2.4,
    rtoShift: -2,
    countFactor: 0.58,
    namePrefix: "ppr",
    riskShift: -52,
  },
  {
    id: "cypress",
    name: "Cypress Dental",
    env: "Production · us-east-2",
    initials: "CD",
    status: "live",
    statusLabel: "All systems live",
    scoreShift: -14,
    deltaShift: -2.8,
    rtoShift: -3,
    countFactor: 0.42,
    namePrefix: "cyp",
    riskShift: -60,
  },
]

export const GLOBAL_MSP = {
  id: "global",
  name: "Multi-tenant",
  env: "All client portfolios",
  initials: "MSP",
  status: "live",
  statusLabel: "Portfolio live",
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function severityFromScore(score) {
  if (score >= 80) return "Critical"
  if (score >= 60) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}

export function environmentRiskLevel(risks) {
  const findings = (risks ?? []).filter((row) => !row.healthy && row.issue)
  if (!findings.length) return "No Risk"
  const rank = { Critical: 4, High: 3, Medium: 2, Low: 1, None: 0 }
  const max = findings.reduce((top, row) => Math.max(top, rank[row.priority] ?? 0), 0)
  if (max === 4) return "Critical Risk"
  if (max === 3) return "High Risk"
  if (max === 2) return "Medium Risk"
  if (max === 1) return "Low Risk"
  return "No Risk"
}

export const envRiskSeverity = {
  "No Risk": "None",
  "Low Risk": "Low",
  "Medium Risk": "Medium",
  "High Risk": "High",
  "Critical Risk": "Critical",
}

function scaleCount(n, factor) {
  return Math.max(1, Math.round(n * factor))
}

function mapTenantResource(row, tenant, jitter, rangeRto) {
  const score = row.healthy
    ? 0
    : clamp(row.score + (tenant.riskShift ?? tenant.scoreShift) + jitter, 1, 99)
  const relatedResources = (row.relatedResources ?? []).map((name) => `${tenant.namePrefix}-${name}`)
  return {
    ...row,
    name: `${tenant.namePrefix}-${row.name}`,
    relatedResources,
    affectsCount: relatedResources.length,
    score,
    priority: row.healthy ? "None" : severityFromScore(score),
    rtoDelta: row.healthy ? 0 : Math.max(0, row.rtoDelta + tenant.rtoShift + rangeRto),
  }
}

export function applyTenant(tenant, { businessUnits, deficitRows, risks, healthyResources = [], jitter = 0, range }) {
  const rangeKey = String(range ?? "").toLowerCase()
  const rangeRto = rangeKey.includes("30") ? 3 : rangeKey.includes("24") ? -2 : 0

  const units = businessUnits.map((unit) => {
    const score = clamp(unit.score + tenant.scoreShift + jitter, 1, 99)
    return {
      ...unit,
      score,
      severity: severityFromScore(score),
      resources: scaleCount(unit.resources, tenant.countFactor),
      delta: Number((unit.delta + tenant.deltaShift).toFixed(1)),
    }
  })

  const deficits = deficitRows.map((row) => {
    const segments = Object.fromEntries(
      Object.entries(row.segments).map(([key, value]) => [key, scaleCount(value, tenant.countFactor)]),
    )
    return {
      ...row,
      segments,
      count: Object.values(segments).reduce((a, b) => a + b, 0),
    }
  })

  const findings = risks.filter((row) => row.issue)
  const rng = mulberry32(hash32(`queue:${tenant.id}`))
  const count = Math.max(1, 3 + Math.floor(rng() * Math.max(1, findings.length - 2)))
  const selected = pickShuffled(findings, rng).slice(0, Math.min(count, findings.length))
  const tenantRisks = selected.map((row) => mapTenantResource(row, tenant, jitter, rangeRto))
  const tenantHealthy = healthyResources.map((row) => mapTenantResource(row, tenant, jitter, rangeRto))

  return { units, deficits, risks: tenantRisks, healthy: tenantHealthy }
}

function attachTenant(row, tenant) {
  const clouds = ["AWS", "Azure", "GCP"]
  const seed = Math.abs([...`${tenant.id}:${row.issue || row.id}`].reduce((n, ch) => n + ch.charCodeAt(0), 0))
  return {
    ...row,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEnv: tenant.env,
    tenantInitials: tenant.initials,
    provider: row.healthy ? row.provider : clouds[seed % clouds.length],
  }
}

export function applyPortfolio(selectedTenants, opts) {
  const appliedList = selectedTenants.map((tenant) => ({
    tenant,
    applied: applyTenant(tenant, opts),
  }))

  const units = appliedList
    .map(({ tenant, applied }) => {
      const findings = applied.risks.filter((row) => !row.healthy && row.issue)
      const score = findings.reduce((max, row) => Math.max(max, row.score), 0)
      const resources = applied.deficits.reduce((sum, row) => sum + row.count, 0)
      return {
        id: tenant.id,
        name: tenant.name,
        initials: tenant.initials,
        icon: "building",
        rto: tenant.env,
        resources,
        findings: findings.length,
        delta: Number((tenant.deltaShift + (opts.jitter ? 0.4 : 0)).toFixed(1)),
        score,
        severity: score ? severityFromScore(score) : "None",
      }
    })
    .sort((a, b) => b.score - a.score)

  const deficitMap = new Map()
  for (const { applied } of appliedList) {
    for (const row of applied.deficits) {
      const prev = deficitMap.get(row.name) ?? {
        name: row.name,
        extra: row.extra,
        segments: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      }
      for (const key of Object.keys(prev.segments)) {
        prev.segments[key] += row.segments[key] ?? 0
      }
      deficitMap.set(row.name, prev)
    }
  }
  const deficits = [...deficitMap.values()].map((row) => ({
    ...row,
    count: Object.values(row.segments).reduce((a, b) => a + b, 0),
  }))

  const risks = appliedList.flatMap(({ tenant, applied }) =>
    applied.risks.map((row) => attachTenant(row, tenant)),
  )
  const healthy = appliedList.flatMap(({ tenant, applied }) =>
    applied.healthy.map((row) => attachTenant(row, tenant)),
  )

  return { units, deficits, risks, healthy }
}

export function clusterRisksByIssue(rows) {
  const map = new Map()
  for (const row of rows) {
    if (row.healthy || !row.issue) continue
    if (!map.has(row.issue)) map.set(row.issue, [])
    map.get(row.issue).push(row)
  }

  const clusters = []
  for (const [issue, members] of map) {
    const tenants = []
    const seen = new Set()
    for (const member of members) {
      const key = member.tenantId ?? member.name
      if (seen.has(key)) continue
      seen.add(key)
      tenants.push({
        id: member.tenantId ?? member.name,
        name: member.tenantName ?? member.name,
        env: member.tenantEnv ?? "",
        initials: member.tenantInitials ?? (member.tenantName ?? member.name).slice(0, 2).toUpperCase(),
        resource: member.name,
        score: member.score,
        priority: member.priority,
        provider: member.provider,
        type: member.type,
      })
    }
    tenants.sort((a, b) => b.score - a.score)
    const providerMap = new Map()
    for (const member of members) {
      const name = member.provider
      if (!name) continue
      const prev = providerMap.get(name) ?? { name, tenantIds: new Set(), count: 0 }
      prev.count += 1
      if (member.tenantId) prev.tenantIds.add(member.tenantId)
      providerMap.set(name, prev)
    }
    const affectedProviders = [...providerMap.values()]
      .map((item) => ({
        name: item.name,
        count: item.count,
        tenantCount: item.tenantIds.size || item.count,
      }))
      .sort((a, b) => b.tenantCount - a.tenantCount)
    const top = members.reduce((best, row) => (row.score >= best.score ? row : best))
    clusters.push({
      ...top,
      id: `cluster:${issue}`,
      issue,
      cluster: true,
      members,
      affectedTenants: tenants,
      tenantCount: tenants.length,
      affectedProviders,
      providerCount: affectedProviders.length,
    })
  }

  clusters.sort((a, b) => b.score - a.score || b.tenantCount - a.tenantCount)
  return clusters
}

const MSP_QUEUE_ISSUES = [
  "Active IaC configuration drift",
  "Snapshot verification protection gap",
  "Missing disaster recovery runbook",
  "Unencrypted replication traffic",
  "TLS certificate expires in 12 days",
  "Public blob container policy drift",
  "HPA max replicas too low for peak",
  "Backup window overlapping peak load",
  "Stale firewall exception for contractor CIDR",
  "No regional failover configured",
  "Missing point-in-time restore coverage",
  "Unpatched kernel CVE-2024-1086",
  "Privileged container runtime allowed",
  "S3 bucket versioning disabled",
  "GuardDuty detector suspended",
  "CloudTrail log file validation off",
  "RDS deletion protection disabled",
  "EBS volumes missing encryption",
  "Security group allows 0.0.0.0/0 SSH",
  "IAM user with unused access keys",
  "Root account MFA not enforced",
  "KMS key rotation disabled",
  "Lambda timeout below SLO",
  "ALB idle timeout too aggressive",
  "WAF managed ruleset not attached",
  "ECS task role overly permissive",
  "EKS control plane logging disabled",
  "Node group AMI 47 days stale",
  "Cluster autoscaler max nodes too low",
  "NAT gateway single-AZ bottleneck",
  "VPC flow logs not retained",
  "Route53 health check failing",
  "ACM certificate auto-renewal failed",
  "CloudFront origin protocol mismatch",
  "ElastiCache at-rest encryption off",
  "Redshift public accessibility on",
  "Glue job IAM role wildcard actions",
  "SQS queue encryption not set",
  "SNS topic missing topic policy",
  "EventBridge rule targeting deleted bus",
  "Secrets Manager secret 400 days old",
  "Parameter Store value unencrypted",
  "Backup vault lock not enabled",
  "AMI public share detected",
  "ECR scan-on-push disabled",
  "Image has critical CVE in base layer",
  "Pod security admission in warn mode",
  "Network policy missing for namespace",
  "Service account token automount on",
  "Ingress TLS secret expired",
  "Persistent volume reclaim policy retain",
  "etcd backup older than 24 hours",
  "Azure NSG allows RDP from internet",
  "Storage account public blob access",
  "Key Vault purge protection off",
  "SQL database TDE not enabled",
  "AKS RBAC not integrated with Entra",
  "Defender for Cloud plan not assigned",
  "Activity log diagnostic missing",
  "App Service HTTPS-only disabled",
  "Function app CORS set to wildcard",
  "Cosmos DB firewall allow Azure IPs",
  "Load balancer health probe failing",
  "VMSS autoscale cooldown too long",
  "Private endpoint missing DNS zone",
  "GCP Cloud SQL SSL not required",
  "GKE workload identity not enabled",
  "GCS bucket uniform access off",
  "IAM service account key 90 days old",
  "Firewall rule allows 0.0.0.0/0 RDP",
  "Cloud Armor policy not attached",
  "Pub/Sub topic without dead-letter",
  "BigQuery dataset public IAM member",
  "Cloud Run ingress set to all",
  "VPC Service Controls perimeter gap",
  "Secret Manager CMEK not configured",
  "Compute disk snapshot schedule missing",
  "OS Login not enforced on project",
]

function hash32(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickShuffled(items, rng) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function buildRemediationQueue(selectedTenants) {
  const templates = risks.filter((row) => row.issue)
  if (!selectedTenants.length || !templates.length) return []

  const clouds = ["AWS", "Azure", "GCP"]
  const scopeKey = selectedTenants.map((item) => item.id).join(",")

  return MSP_QUEUE_ISSUES.map((issue, index) => {
    const template = templates[index % templates.length]
    const rng = mulberry32(hash32(`${issue}:${scopeKey}`))
    const tenantCount = 1 + Math.floor(rng() * selectedTenants.length)
    const chosenTenants = pickShuffled(selectedTenants, rng).slice(0, tenantCount)
    const members = chosenTenants.map((tenant) => {
      const provider = clouds[Math.floor(rng() * clouds.length)]
      const row = attachTenant(mapTenantResource(template, tenant, 0, 0), tenant)
      return {
        ...row,
        issue,
        provider,
        score: clamp(template.score - Math.floor(rng() * 36) + (tenant.riskShift ?? 0), 18, 99),
      }
    })
    members.forEach((member) => {
      member.priority = severityFromScore(member.score)
    })
    const top = members.reduce((best, row) => (row.score >= best.score ? row : best))
    const tenants = members.map((member) => ({
      id: member.tenantId,
      name: member.tenantName,
      env: member.tenantEnv ?? "",
      initials: member.tenantInitials,
      resource: member.name,
      score: member.score,
      priority: member.priority,
      provider: member.provider,
      type: member.type,
    }))
    tenants.sort((a, b) => b.score - a.score)
    const providerMap = new Map()
    for (const member of members) {
      const prev = providerMap.get(member.provider) ?? { name: member.provider, tenantIds: new Set(), count: 0 }
      prev.count += 1
      prev.tenantIds.add(member.tenantId)
      providerMap.set(member.provider, prev)
    }
    const affectedProviders = [...providerMap.values()]
      .map((item) => ({
        name: item.name,
        count: item.count,
        tenantCount: item.tenantIds.size,
      }))
      .sort((a, b) => b.tenantCount - a.tenantCount)

    return {
      ...top,
      id: `cluster:${issue}`,
      issue,
      cluster: true,
      members,
      affectedTenants: tenants,
      tenantCount: tenants.length,
      affectedProviders,
      providerCount: affectedProviders.length,
      provider: affectedProviders[0]?.name ?? top.provider,
    }
  }).sort((a, b) => b.score - a.score || b.tenantCount - a.tenantCount)
}

export function getTriageBrief(cluster) {
  const tenants = cluster.affectedTenants ?? []
  const n = cluster.tenantCount ?? tenants.length
  const names = tenants.slice(0, 3).map((item) => item.name)
  const rest = Math.max(0, n - names.length)
  const list =
    rest > 0 ? `${names.join(", ")}, and ${rest} more` : names.join(names.length === 2 ? " and " : ", ")
  const lead = tenants[0]
  const providerNames = (cluster.affectedProviders ?? [])
    .map((item) => item.name)
    .filter(Boolean)
  const providerLine =
    providerNames.length > 1
      ? ` Providers in scope: ${providerNames.join(", ")}.`
      : providerNames.length === 1
        ? ` Provider: ${providerNames[0]}.`
        : ""
  return `AI clustered “${cluster.issue}” across ${n} client ${
    n === 1 ? "environment" : "environments"
  } (${list || "the selected portfolio"}).${providerLine} Blast radius is ${cluster.priority} with a systemic score of ${
    cluster.score
  }/100.${
    lead
      ? ` Highest exposure is ${lead.name} on ${lead.resource}${lead.env ? ` (${lead.env})` : ""}.`
      : ""
  } Recommended path: one agentic IaC deploy that remediates every affected tenant in a single change window.`
}

export function affectsNote(related) {
  const names = Array.isArray(related) ? related : []
  if (names.length === 0) return ""
  if (names.length === 1) return `Also affects ${names[0]}`
  if (names.length === 2) return `Also affects ${names[0]} and ${names[1]}`
  return `Also affects ${names.length} other resources`
}

export function expandSharedIssues(risks) {
  const seen = new Set(risks.map((row) => `${row.name}|${row.issue}`))
  const extra = []

  for (const row of risks) {
    for (const name of row.relatedResources ?? []) {
      const key = `${name}|${row.issue}`
      if (seen.has(key)) continue
      seen.add(key)
      const peers = [row.name, ...(row.relatedResources ?? []).filter((n) => n !== name)]
      extra.push({
        ...row,
        id: `${row.id}::${name}`,
        name,
        relatedResources: peers,
        affectsCount: peers.length,
        sharedIssue: true,
      })
    }
  }

  return [...risks, ...extra]
}

export const remediations = {
  "Active IaC configuration drift": {
    actions: [
      {
        title: "IaC Re-sync & State Lock",
        body: "Import live resource state into Terraform, apply the master plan, then enable state locking so console edits cannot silently diverge again.",
      },
      {
        title: "Console Access Restriction",
        body: "Remove standing write access in the provider console and require break-glass roles with time-bound approval.",
      },
    ],
    issueDetail:
      "Manual console overrides detected - Live environment out of sync with master Terraform",
    why: "The live PostgreSQL instance has diverged from the master Terraform plan due to manual console changes. Running terraform plan and apply will reconcile the state. A Sentinel or OPA policy should be enforced to block future out-of-band changes. This eliminates silent drift and ensures the environment is reproducible from code.",
    impact: [
      "RTO reduced by ~12h once sync is enforced",
      "Drift recurrence eliminated via policy gate",
    ],
    effort: "~2 hours",
    owner: "Platform\nEngineering",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "Reviewed by SRE team — remediation plan drafted", actor: "SRE Team" },
      { date: "Jun 04", title: "Ticket opened in JIRA (INFRA-4421)", actor: "Platform Engineering" },
      { date: "Jun 03", title: "Alert triggered — severity escalated to Critical", actor: "PagerDuty" },
      { date: "Jun 02", title: "Drift first detected via Terraform plan diff", actor: "Automated Scanner" },
    ],
  },
  "Snapshot verification protection gap": {
    actions: [
      {
        title: "Enable snapshot integrity checks",
        body: "Turn on backup verification jobs and fail the pipeline if restore tests do not complete within the RTO window.",
      },
      {
        title: "Restore drill on standby",
        body: "Run a non-prod restore of the latest snapshot and record actual recovery time.",
      },
    ],
    issueDetail: "Snapshots exist but restore verification has not succeeded in the last 14 days.",
    why: "Without a proven restore path, snapshot coverage is a false sense of protection. A scheduled restore drill confirms the backup chain and surfaces missing disks or encryption keys before an incident.",
    impact: [
      "RTO reduced by ~9h after verified restore path",
      "Backup failure detected before production impact",
    ],
    effort: "~4 hours",
    owner: "Backup\nEngineering",
    automatable: "Partial",
    history: [
      { date: "Jun 05", title: "Restore drill scheduled for next maintenance window", actor: "SRE Team" },
      { date: "Jun 03", title: "Ticket opened in JIRA (BKP-1184)", actor: "Platform Engineering" },
      { date: "Jun 01", title: "Verification job failed three consecutive nights", actor: "Backup Monitor" },
    ],
  },
  "Missing disaster recovery runbook": {
    actions: [
      {
        title: "Publish failover runbook",
        body: "Document regional failover steps, owners, and rollback criteria in the shared ops wiki.",
      },
      {
        title: "Attach runbook to pager",
        body: "Link the runbook in the on-call policy so responders open it from the first alert.",
      },
    ],
    issueDetail: "No approved disaster recovery runbook is attached to this payments cluster.",
    why: "During an outage, responders currently rely on tribal knowledge. A versioned runbook shortens decision time and makes failover repeatable across shifts.",
    impact: [
      "RTO reduced by ~11h with a rehearsed failover path",
      "On-call handoff no longer depends on a single engineer",
    ],
    effort: "~6 hours",
    owner: "Payments\nSRE",
    automatable: "No",
    history: [
      { date: "Jun 04", title: "Runbook gap confirmed in game-day retro", actor: "Incident Commander" },
      { date: "Jun 02", title: "Ticket opened in JIRA (PAY-2201)", actor: "Payments SRE" },
      { date: "May 28", title: "Failover tabletop stalled without a documented path", actor: "SRE Team" },
    ],
  },
  "Missing point-in-time restore coverage": {
    actions: [
      {
        title: "Enable PITR window",
        body: "Turn on continuous WAL/archive retention for at least 7 days on the primary instance.",
      },
    ],
    issueDetail: "Automated backups are nightly only; point-in-time restore is disabled.",
    why: "A logical delete or bad migration cannot be rolled back to a specific minute without PITR. Enabling it closes a gap that snapshots alone do not cover.",
    impact: [
      "RPO drops from 24h to minutes",
      "Restore options available without rebuilding from scratch",
    ],
    effort: "~1 hour",
    owner: "Data\nPlatform",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "PITR enablement approved for primary instance", actor: "Data Platform" },
      { date: "Jun 03", title: "Gap flagged in backup coverage report", actor: "Automated Scanner" },
    ],
  },
  "Unpatched kernel CVE-2024-1086": {
    actions: [
      {
        title: "Patch and recycle node pool",
        body: "Apply the vendor kernel update and rolling-recycle the VM so the CVE is not reachable from the API subnet.",
      },
    ],
    issueDetail: "Host kernel is behind the vendor advisory for CVE-2024-1086.",
    why: "The local privilege-escalation CVE is exploitable from any process on the VM. Patching and recycling removes the attack path without changing application code.",
    impact: [
      "Known kernel exploit closed",
      "Compliance scan returns to passing for this host",
    ],
    effort: "~3 hours",
    owner: "Compute\nSecurity",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "Patch package staged in golden image", actor: "Compute Security" },
      { date: "Jun 04", title: "CVE matched against host inventory", actor: "Qualys" },
      { date: "Jun 03", title: "Vendor advisory ingested", actor: "Automated Scanner" },
    ],
  },
  "Privileged container runtime allowed": {
    actions: [
      {
        title: "Enforce restricted PSS",
        body: "Apply the restricted Pod Security Standard and deny privileged, hostNetwork, and hostPath workloads.",
      },
    ],
    issueDetail: "The payments namespace allows privileged containers and hostPath mounts.",
    why: "A compromised pod can escape to the node and reach adjacent services. Restricting the runtime shrinks blast radius without blocking the current payment workloads.",
    impact: [
      "Container escape path removed",
      "Cluster policy matches the payments tier-1 baseline",
    ],
    effort: "~2 hours",
    owner: "Platform\nEngineering",
    automatable: "Yes",
    history: [
      { date: "Jun 04", title: "Restricted PSS drafted for payments namespace", actor: "Platform Engineering" },
      { date: "Jun 02", title: "Privileged pod detected in admission logs", actor: "Kyverno" },
    ],
  },
  "Unencrypted replication traffic": {
    actions: [
      {
        title: "Require TLS for replica links",
        body: "Rotate replica users and enforce in-transit encryption on the Redis/cache replication channel.",
      },
    ],
    issueDetail: "Replication between primary and replica is plaintext on the overlay network.",
    why: "Session tokens can be observed on the replica link. TLS plus auth rotation removes that exposure.",
    impact: ["Session data no longer traverses the fabric in the clear"],
    effort: "~90 minutes",
    owner: "Network\nSecurity",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "TLS required on replica link in staging", actor: "Network Security" },
      { date: "Jun 03", title: "Plaintext replication flagged on overlay", actor: "Automated Scanner" },
    ],
  },
  "TLS certificate expires in 12 days": {
    actions: [
      {
        title: "Renew and attach certificate",
        body: "Issue a replacement cert from ACM/Key Vault and attach it to the load balancer listener.",
      },
    ],
    issueDetail: "The checkout listener certificate expires in 12 days with no auto-renewal.",
    why: "An expired edge certificate would fail TLS handshake for checkout. Renewing now avoids a hard outage window.",
    impact: ["Checkout TLS remains valid through the next rotation cycle"],
    effort: "~45 minutes",
    owner: "Edge\nPlatform",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "Renewal certificate issued in ACM", actor: "Edge Platform" },
      { date: "Jun 01", title: "Expiry window entered 14-day threshold", actor: "Certificate Monitor" },
    ],
  },
  "Public blob container policy drift": {
    actions: [
      {
        title: "Revert public ACL",
        body: "Set the container to private and add a private-endpoint-only access policy.",
      },
    ],
    issueDetail: "Invoice blobs are reachable with a public container ACL that is not in the IaC baseline.",
    why: "Invoice objects should stay private. Closing the ACL prevents accidental exposure of billing documents.",
    impact: ["Public read path on invoice storage is closed"],
    effort: "~30 minutes",
    owner: "Cloud\nSecurity",
    automatable: "Yes",
    history: [
      { date: "Jun 04", title: "Public ACL reverted in non-prod", actor: "Cloud Security" },
      { date: "Jun 02", title: "Policy drift detected vs IaC baseline", actor: "Automated Scanner" },
    ],
  },
  "HPA max replicas too low for peak": {
    actions: [
      {
        title: "Raise HPA ceiling",
        body: "Increase maxReplicas to cover p99 chat concurrency observed last quarter.",
      },
    ],
    issueDetail: "Horizontal pod autoscaler caps below last quarter’s peak concurrent chats.",
    why: "Support chat latency spikes when the cap is hit. Raising the ceiling uses spare node capacity already provisioned.",
    impact: ["Peak queue time stays inside the support SLO"],
    effort: "~20 minutes",
    owner: "Support\nPlatform",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "HPA ceiling increase approved", actor: "Support Platform" },
      { date: "Jun 01", title: "Peak concurrency exceeded maxReplicas", actor: "Datadog" },
    ],
  },
  "Backup window overlapping peak load": {
    actions: [
      {
        title: "Shift backup window",
        body: "Move snapshot jobs to the overnight trough and throttle IO so peak sync is unaffected.",
      },
    ],
    issueDetail: "Warehouse sync backups run during the afternoon ingest peak.",
    why: "Backup IO contends with the logistics pipeline and extends RTO when both run at once.",
    impact: ["Ingest latency returns to baseline during business hours"],
    effort: "~1 hour",
    owner: "Data\nOps",
    automatable: "Partial",
    history: [
      { date: "Jun 04", title: "Backup window candidate identified in trough", actor: "Data Ops" },
      { date: "Jun 02", title: "IO contention correlated with snapshot jobs", actor: "Observability" },
    ],
  },
  "Stale firewall exception for contractor CIDR": {
    actions: [
      {
        title: "Revoke contractor CIDR",
        body: "Remove the unused allow rule and require VPN + SSO for remaining admin access.",
      },
    ],
    issueDetail: "A contractor CIDR from a closed engagement is still allowed on the VPN hub.",
    why: "The range is no longer associated with an active vendor. Removing it shrinks the admin attack surface.",
    impact: ["Unused network exception is closed"],
    effort: "~15 minutes",
    owner: "Network\nEngineering",
    automatable: "Yes",
    history: [
      { date: "Jun 05", title: "Contractor engagement confirmed closed", actor: "Vendor Ops" },
      { date: "Jun 03", title: "Stale CIDR flagged on VPN hub", actor: "Automated Scanner" },
    ],
  },
  "No regional failover configured": {
    actions: [
      {
        title: "Add secondary region replica",
        body: "Create a cross-region replica and document the promotion path for analytics.",
      },
    ],
    issueDetail: "The analytics mart has no replica outside the primary region.",
    why: "Reporting can wait, but a regional event currently takes the mart offline with no promotion path.",
    impact: ["Analytics survives a single-region event with a delayed replica"],
    effort: "~8 hours",
    owner: "Analytics\nPlatform",
    automatable: "No",
    history: [
      { date: "Jun 04", title: "Secondary region replica scoped", actor: "Analytics Platform" },
      { date: "May 30", title: "Single-region dependency called out in DR review", actor: "SRE Team" },
    ],
  },
}

export function getInvestigation(risk) {
  if (risk?.cluster) {
    return {
      confidence: 94,
      narrative: getTriageBrief(risk),
      peers: risk.affectedTenants ?? [],
    }
  }
  const peers = risk.relatedResources ?? []
  const plan = getRemediation(risk.issue)
  const isDrift = /iac|drift/i.test(risk.issue)
  const confidence = isDrift ? 96 : Math.min(95, Math.max(82, 70 + Math.round(risk.score / 8)))
  const outcome = plan.impact?.[0] ?? "the control gap is closed"

  const narrative = isDrift
    ? `${risk.name} has drifted from Terraform: live backup retention, Multi-AZ, and deletion protection no longer match the master plan. That gap is adding +${risk.rtoDelta}h to RTO on ${risk.tier} ${risk.businessUnit}. Re-syncing IaC restores a known-good baseline so failover can meet the recovery objective.`
    : `${risk.issue} on ${risk.name} is adding +${risk.rtoDelta}h to RTO for ${risk.tier} ${risk.businessUnit}. Applying the recommended fix (${plan.actions[0]?.title ?? "remediation"}) will ${outcome.charAt(0).toLowerCase()}${outcome.slice(1)}.`

  return { confidence, narrative, peers }
}

export function getAiRemediation(risk) {
  const plan = getRemediation(risk.issue)
  const addr = String(risk.issue || risk.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)
  const isDrift = /iac|drift/i.test(risk.issue)
  const tenantCount = risk.tenantCount ?? risk.affectedTenants?.length ?? 1
  const summary = isDrift
    ? `AI will reconcile live state with Terraform across ${tenantCount} tenant ${
        tenantCount === 1 ? "environment" : "environments"
      }: restore 14-day backup retention, Multi-AZ, and deletion protection. This removes the +${risk.rtoDelta}h RTO gap and realigns every drifted replica with the master plan.`
    : `${plan.why} Suggested IaC below encodes the first action (${plan.actions[0]?.title ?? "patch"}) for all ${tenantCount} affected ${
        tenantCount === 1 ? "tenant" : "tenants"
      }.`

  const diff = isDrift
    ? [
        `resource "aws_db_instance" "${addr}" {`,
        `  identifier                 = "${risk.name}"`,
        `- backup_retention_period    = 1`,
        `+ backup_retention_period    = 14`,
        `- multi_az                   = false`,
        `+ multi_az                   = true`,
        `- deletion_protection        = false`,
        `+ deletion_protection        = true`,
        `  apply_immediately          = true`,
        `}`,
      ]
    : [
        `resource "beacon_control" "${addr}" {`,
        `  name     = "${risk.name}"`,
        `  issue    = "${risk.issue}"`,
        `- desired  = "drifted"`,
        `+ desired  = "compliant"`,
        `  owner    = "${plan.owner.replaceAll("\n", " ")}"`,
        `}`,
      ]

  return { summary, diff, plan }
}

export function getRemediation(issue) {
  return (
    remediations[issue] ?? {
      actions: [{ title: "Review and patch", body: "Open the owner runbook and apply the standard control." }],
      issueDetail: issue,
      why: "This control gap should be closed using the standard owner runbook for the resource class.",
      impact: ["Risk score drops after the control is applied"],
      effort: "~2 hours",
      owner: "Platform\nEngineering",
      automatable: "No",
      history: [
        { date: "Jun 05", title: "Remediation plan drafted", actor: "SRE Team" },
        { date: "Jun 03", title: "Issue opened for owner review", actor: "Beacon" },
      ],
    }
  )
}

export const rangeOptions = ["Last 24 hours", "Last 7 days", "Last 30 days"]
export const typeOptions = ["RDS", "VM", "EKS", "GKE", "Cache", "LB", "Storage", "VPN", "Warehouse"]
export const issueOptions = [
  "Active IaC configuration drift",
  "Snapshot verification protection gap",
  "Missing disaster recovery runbook",
  "Missing point-in-time restore coverage",
  "Unpatched kernel CVE-2024-1086",
  "Privileged container runtime allowed",
]
export const providerOptions = ["AWS", "Azure", "GCP"]
export const buOptions = [
  "Checkout & Billing",
  "Logistics & Supply",
  "Customer Support Systems",
  "Internal HR & Billing",
]
export const priorityOptions = ["Critical", "High", "Medium", "Low", "None"]
export const sortOptions = [
  { id: "score-desc", label: "Score (high → low)" },
  { id: "score-asc", label: "Score (low → high)" },
  { id: "rto-desc", label: "RTO delta (high → low)" },
  { id: "name-asc", label: "Resource name" },
]
