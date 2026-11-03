export const JUSTIFICATIONS = [
  "Verified signed admin binary in 30d replay",
  "Approved via Purple Team exception #402",
  "Merge Hunk A only (Skip exclusion)",
]

export const MERGE_A_ONLY = JUSTIFICATIONS[2]

export const COACH_PRESETS = [
  {
    id: "signature",
    label: "Exclusion is too permissive — enforce valid Authenticode signature check",
  },
  {
    id: "upstream",
    label: "Do not modify SIEM KQL — push normalization upstream to Cribl Stream pack instead",
  },
  {
    id: "info",
    label: "Keep noisy matches but downgrade severity to Informational for SOAR enrichment",
  },
]

export const RULES = [
  {
    id: "powershell",
    title: "Suspicious PowerShell EncodedCommand",
    technique: "T1059.001",
    tactic: "Execution",
    severity: "CRITICAL",
    tone: "critical",
    status: "silent",
    pill: "Silent Blind Spot",
    queueClass: "Silent Rule Breakage",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "0 hits (Expected ~42/day)",
    spark: [12, 14, 11, 13, 9, 0, 0],
    cause: "Falcon v7.14 renamed 'ProcessCommandLine' -> 'process.cmd_line'.",
    lineage: ["CrowdStrike v7.14", "Cribl v2.4", "Sentinel Rule #402"],
    nodes: ["falcon", "cribl", "sentinel"],
    branch: "fix/schema-coalesce-t1059",
    pr: 842,
    backtest: 9941,
    schemaBreak: true,
    parserDrift: true,
    gap: true,
    degraded: true,
    fields: "ProcessCommandLine process.cmd_line",
    broken: `DeviceProcessEvents
| where ProcessCommandLine has "-enc"
| where InitiatingProcessFileName endswith "powershell.exe"`,
    hunkA: `| extend NormalizedCmd = coalesce(ProcessCommandLine, tostring(parse_json(AdditionalFields).["process.cmd_line"]))`,
    hunkB: `| where InitiatingProcessFileName !in~ ("CcmExec.exe", "monitoringhost.exe")`,
    coach: {
      signature: `| where InitiatingProcessFileName !in~ ("CcmExec.exe", "monitoringhost.exe")
    and InitiatingProcessSignatureStatus == "Valid"`,
      upstream: `// KQL exclusion withheld
// Cribl pack: coalesce(process.cmd_line, ProcessCommandLine) as ProcessCommandLine`,
      info: `| extend AlertSeverity = "Informational"`,
    },
  },
  {
    id: "okta",
    title: "Okta Impossible Travel & Session Anomaly",
    technique: "T1078",
    tactic: "Initial Access",
    severity: "HIGH",
    tone: "degraded",
    status: "noisy",
    pill: "Precision Collapse",
    queueClass: "Alert Storm / Precision Drop",
    siem: "Splunk",
    siemLabel: "Splunk Enterprise (SPL)",
    volume: "1,840 hits (+340% spike)",
    spark: [40, 42, 55, 80, 120, 160, 184],
    cause: "New Cloudflare WARP corporate egress CIDR missing from 'trusted_egress.csv'.",
    lineage: ["Okta System Log", "Splunk Enterprise", "trusted_egress.csv"],
    nodes: ["okta", "splunk"],
    branch: "fix/okta-warp-lookup-t1078",
    pr: 843,
    backtest: 9942,
    schemaBreak: false,
    parserDrift: false,
    gap: true,
    degraded: true,
    fields: "trusted_egress.csv src_ip",
    broken: `index=okta sourcetype=okta:log action=success
| where NOT [| inputlookup trusted_egress.csv | fields src_ip]
| eval miles=relative_distance(src_lat, src_lon, prev_lat, prev_lon)
| where miles>500 AND hours<2`,
    hunkA: `| lookup trusted_egress.csv src_ip OUTPUT cidr AS trusted_cidr
| where isnull(trusted_cidr)`,
    hunkB: `| where user_agent!="OktaVerify" AND app!="okta_preview"`,
    coach: {
      signature: `| where user_agent!="OktaVerify" AND cidrmatch("10.0.0.0/8", src_ip)=0
    AND match(signature, "corp-warp")`,
      upstream: `// SPL exclusion withheld
// Cribl lookup pack: append Cloudflare WARP CIDR to trusted_egress.csv`,
      info: `| eval severity="informational"`,
    },
  },
  {
    id: "lsass",
    title: "LSASS Memory Dump via Rundll32",
    technique: "T1003.001",
    tactic: "Credential Access",
    severity: "HIGH",
    tone: "degraded",
    status: "downstream",
    pill: "Downstream Break",
    queueClass: "SOAR Automation Failure",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "4 hits (SOAR Failed)",
    spark: [3, 4, 2, 5, 3, 4, 4],
    cause: "Query '| project' clause omitted 'DeviceId' required by Torq isolation webhook.",
    lineage: ["Defender for Endpoint", "Sentinel", "Torq isolate-host"],
    nodes: ["defender", "sentinel", "torq"],
    branch: "fix/torq-deviceid-t1003",
    pr: 844,
    backtest: 9943,
    schemaBreak: true,
    parserDrift: false,
    webhook: true,
    gap: true,
    degraded: true,
    fields: "DeviceId project isolate-host",
    broken: `DeviceProcessEvents
| where FileName =~ "rundll32.exe" and ProcessCommandLine has "comsvcs"
| project Timestamp, DeviceName, ProcessCommandLine`,
    hunkA: `| project Timestamp, DeviceName, DeviceId, ProcessCommandLine`,
    hunkB: `| where InitiatingProcessFileName !in~ ("MsSense.exe")`,
    coach: {
      signature: `| where InitiatingProcessFileName !in~ ("MsSense.exe")
    and InitiatingProcessSignatureStatus == "Valid"`,
      upstream: `// KQL projection kept
// Cribl pack: ensure DeviceId is copied onto the Sentinel entity before the webhook`,
      info: `| extend AlertSeverity = "Informational"`,
    },
  },
  {
    id: "iam",
    title: "AWS IAM Root & AssumeRole Abuse",
    technique: "T1078.004",
    tactic: "Persistence",
    severity: "MEDIUM",
    tone: "degraded",
    status: "lag",
    pill: "Ingestion Lag",
    queueClass: "Telemetry Ingestion Stall",
    siem: "Snowflake",
    siemLabel: "Snowflake OCSF (SQL)",
    volume: "Delayed 4.5h",
    spark: [22, 20, 16, 11, 7, 4, 2],
    cause: "STS AssumeRole session policy expired on Cribl S3 SQS worker.",
    lineage: ["AWS CloudTrail", "Cribl S3 pull", "Snowflake OCSF"],
    nodes: ["cloudtrail", "cribl", "snowflake"],
    branch: "fix/cribl-cloudtrail-session-t1078",
    pr: 845,
    backtest: 9944,
    schemaBreak: true,
    parserDrift: true,
    gap: true,
    degraded: true,
    fields: "AssumeRole session policy",
    broken: `SELECT event_time, actor_user, api_operation
FROM ocsf.api_activity
WHERE api_operation IN ('AssumeRole', 'CreateUser')
  AND event_time > dateadd(hour, -1, current_timestamp())`,
    hunkA: `-- refresh Cribl worker role, then widen the late-arrival window
WHERE event_time > dateadd(hour, -6, current_timestamp())`,
    hunkB: `AND actor_user NOT IN ('OrganizationAccountAccessRole')`,
    coach: {
      signature: `AND actor_user NOT IN ('OrganizationAccountAccessRole')
  AND session_issuer LIKE '%/aws-reserved/%' = FALSE`,
      upstream: `-- SQL predicate withheld
-- Cribl: rotate the S3 pull AssumeRole session and retry the SQS worker`,
      info: `AND severity = 'Informational'`,
    },
  },
  {
    id: "kerberoast",
    title: "Kerberoasting SPN Ticket Request Anomaly",
    technique: "T1558.003",
    tactic: "Credential Access",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "12 hits (98.4% precision)",
    spark: [10, 12, 11, 13, 12, 11, 12],
    cause: "Contract holds. Ticket requests match the ASIM authentication schema.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "ServicePrincipalName TicketEncryptionType",
  },
  {
    id: "shadow",
    title: "Shadow Copy Deletion via Vssadmin",
    technique: "T1490",
    tactic: "Defense Evasion",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Splunk",
    siemLabel: "Splunk Enterprise (SPL)",
    volume: "2 hits (100% precision)",
    spark: [1, 2, 1, 3, 2, 2, 2],
    cause: "Contract holds. vssadmin delete shadows still parses on the endpoint pack.",
    lineage: ["Defender for Endpoint", "Splunk Enterprise"],
    nodes: ["defender", "splunk"],
    degraded: false,
    gap: false,
    fields: "vssadmin ProcessCommandLine",
  },
]

export const NODES = [
  { id: "falcon", stage: "Telemetry Sources", title: "CrowdStrike Falcon v7.14", badge: "Schema Mutated", tone: "degraded", x: 16, y: 44 },
  { id: "okta", stage: "Telemetry Sources", title: "Okta System Log", badge: "Healthy", tone: "healthy", x: 16, y: 118 },
  { id: "cloudtrail", stage: "Telemetry Sources", title: "AWS CloudTrail", badge: "Lagging", tone: "degraded", x: 16, y: 192 },
  { id: "defender", stage: "Telemetry Sources", title: "Defender for Endpoint", badge: "Healthy", tone: "healthy", x: 16, y: 266 },
  { id: "cribl", stage: "Pipeline & Normalization", title: "Cribl Stream v2.4", badge: "ASIM Mapping Drop", tone: "critical", x: 270, y: 96 },
  { id: "snowflake", stage: "Pipeline & Normalization", title: "Snowflake OCSF Collector", badge: "Healthy", tone: "healthy", x: 270, y: 196 },
  { id: "sentinel", stage: "Detection Engine", title: "Microsoft Sentinel (142 Rules)", badge: "2 Silent Zero-Match", tone: "critical", x: 524, y: 96 },
  { id: "splunk", stage: "Detection Engine", title: "Splunk Enterprise (88 Rules)", badge: "+340% FP Spike", tone: "degraded", x: 524, y: 196 },
  { id: "torq", stage: "Response & SOAR", title: "Torq SOAR Playbooks", badge: "Payload Contract Broken", tone: "critical", x: 778, y: 146 },
]

export const EDGES = [
  ["falcon", "cribl"],
  ["cloudtrail", "cribl"],
  ["defender", "sentinel"],
  ["okta", "splunk"],
  ["cribl", "sentinel"],
  ["cribl", "snowflake"],
  ["sentinel", "torq"],
  ["splunk", "torq"],
]

export const NODE_W = 220
export const NODE_H = 64

export const MATRIX = [
  {
    tactic: "Initial Access",
    cells: [
      { id: "T1078", ruleId: "okta", base: "degraded" },
      { id: "T1190", base: "verified" },
      { id: "T1133", base: "verified" },
    ],
  },
  {
    tactic: "Execution",
    cells: [
      { id: "T1059.001", ruleId: "powershell", base: "blind" },
      { id: "T1059.003", base: "verified" },
      { id: "T1047", base: "verified" },
    ],
  },
  {
    tactic: "Persistence",
    cells: [
      { id: "T1078.004", ruleId: "iam", base: "degraded" },
      { id: "T1053", base: "verified" },
      { id: "T1547", base: "verified" },
    ],
  },
  {
    tactic: "Privilege Escalation",
    cells: [
      { id: "T1068", base: "verified" },
      { id: "T1055", base: "verified" },
      { id: "T1134", base: "verified" },
    ],
  },
  {
    tactic: "Credential Access",
    cells: [
      { id: "T1003.001", ruleId: "lsass", base: "degraded" },
      { id: "T1558.003", ruleId: "kerberoast", base: "verified" },
      { id: "T1110", base: "verified" },
    ],
  },
  {
    tactic: "Defense Evasion",
    cells: [
      { id: "T1070", base: "verified" },
      { id: "T1490", ruleId: "shadow", base: "verified" },
      { id: "T1562", base: "verified" },
    ],
  },
]

export const VOLUME_DAYS = ["Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 1", "Nov 2", "Nov 3"]
export const VOLUME_EXPECTED = [42, 41, 43, 40, 42, 44, 42]
export const VOLUME_ACTUAL = [40, 44, 41, 39, 43, 36, 0]

export const SOURCES = [
  {
    id: "falcon",
    name: "CrowdStrike Falcon EDR",
    pack: "Cribl Stream v2.4 · falcon_asim",
    rawPreview: `{
  "process": { "cmd_line": "powershell.exe -enc aGVsbG8=" }
}`,
    rawNote: "New in v7.14",
    impact: "Breaks 3 KQL Rules & 1 Hunting Query",
    expression: `// Cribl Stream v2.4 · Falcon ASIM pack
coalesce(process.cmd_line, ProcessCommandLine) as ProcessCommandLine`,
    rows: [
      { raw: "process.cmd_line", transform: "UNMAPPED", target: "event.ProcessCommandLine", state: "broken", note: "NULL / UNMAPPED" },
      { raw: "process.parent_pid", transform: "rename → ParentProcessId", target: "ParentProcessId", state: "ok" },
      { raw: "device.hostname", transform: "rename → DeviceName", target: "DeviceName", state: "ok" },
    ],
  },
  {
    id: "okta",
    name: "Okta Identity",
    pack: "Cribl Stream v2.4 · okta_ocsf",
    rawPreview: `{
  "client": { "ipAddress": "104.28.18.44" },
  "eventType": "user.session.start"
}`,
    rawNote: "Cloudflare WARP egress",
    impact: "Lookup trusted_egress.csv has no row for this CIDR.",
    expression: `// Cribl lookup pack
lookup_csv("trusted_egress.csv").append("104.28.0.0/15", "cloudflare-warp")`,
    rows: [
      { raw: "eventType", transform: "passthrough", target: "authentication.event_type", state: "ok" },
      { raw: "client.ipAddress", transform: "lookup trusted_egress.csv", target: "src_endpoint.ip", state: "drift", note: "CIDR missing" },
      { raw: "actor.alternateId", transform: "rename → user", target: "actor.user.name", state: "ok" },
    ],
  },
  {
    id: "cloudtrail",
    name: "AWS CloudTrail",
    pack: "Cribl Stream v2.4 · aws_s3_sqs",
    rawPreview: `{
  "eventName": "AssumeRole",
  "errorMessage": "ExpiredToken"
}`,
    rawNote: "Worker session expired",
    impact: "Snowflake sees CloudTrail 4.5h late.",
    expression: `// Cribl S3 pull worker
assume_role("arn:aws:iam::${"core"}:role/cribl-cloudtrail", duration: 3600)`,
    rows: [
      { raw: "eventName", transform: "map → api.operation", target: "api.operation", state: "ok" },
      { raw: "userIdentity.arn", transform: "map → actor.user", target: "actor.user.uid", state: "ok" },
      { raw: "sessionIssuer", transform: "SQS pull stalled", target: "unmapped.session", state: "drift", note: "ExpiredToken" },
    ],
  },
  {
    id: "defender",
    name: "Microsoft Defender",
    pack: "Cribl Stream v2.4 · mde_asim",
    rawPreview: `{
  "ProcessCommandLine": "vssadmin.exe delete shadows /all /quiet"
}`,
    rawNote: "ASIM process schema",
    impact: "No open contract breaks on this pack.",
    expression: `// Cribl · Defender ASIM pack
rename(ProcessCommandLine, event.ProcessCommandLine)`,
    rows: [
      { raw: "ProcessCommandLine", transform: "rename", target: "event.ProcessCommandLine", state: "ok" },
      { raw: "DeviceId", transform: "passthrough", target: "device.id", state: "ok" },
      { raw: "InitiatingProcessFileName", transform: "rename", target: "actor.process.file.name", state: "ok" },
    ],
  },
]

export const PLAYBOOKS = [
  {
    id: "isolate",
    name: "Torq // Isolate Compromised Endpoint & Revoke OAuth",
    ruleId: "lsass",
    trigger: "LSASS Memory Dump (T1003.001)",
    error: "HTTP 422 Unprocessable Entity — Required key 'payload.entity.DeviceId' evaluated to NULL.",
    expected: `{
  "payload": {
    "entity": { "DeviceId": "string", "Hostname": "string" },
    "action": "isolate-host"
  }
}`,
    actual: `{
  "payload": {
    "entity": { "DeviceId": null, "Hostname": "win-04" },
    "action": "isolate-host"
  }
}`,
  },
  {
    id: "stepup",
    name: "Torq // Okta Step-Up MFA & Slack Security Challenge",
    ruleId: "okta",
    trigger: "Okta Impossible Travel (T1078)",
    note: "Webhook contract matches. Step-up MFA and the Slack challenge both receive actor.alternateId.",
  },
  {
    id: "quarantine",
    name: "Torq // AWS IAM Quarantine Temporary Credentials",
    ruleId: "iam",
    trigger: "AWS IAM Root & AssumeRole Abuse (T1078.004)",
    note: "Quarantine accepts the OCSF actor fields. The playbook is waiting on late CloudTrail, not a broken payload.",
  },
]

export function canMerge(drawer) {
  if (!drawer || drawer.replay !== "done" || !drawer.justification) return false
  if (drawer.justification === MERGE_A_ONLY) return true
  return drawer.hunkBApproved
}

export function patchedQuery(rule, drawer) {
  const includeB = drawer.hunkBApproved && drawer.justification !== MERGE_A_ONLY
  return [rule.broken, rule.hunkA, includeB ? drawer.hunkBCode : null].filter(Boolean).join("\n")
}

export function litNodeIds(nodeId) {
  if (!nodeId) return null
  const ids = new Set([nodeId])
  for (const rule of RULES) {
    if (rule.nodes.includes(nodeId)) rule.nodes.forEach((id) => ids.add(id))
  }
  return ids
}
