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
  {
    id: "dns",
    title: "DNS Tunneling via High-Entropy Queries",
    technique: "T1071.004",
    tactic: "Command and Control",
    severity: "CRITICAL",
    tone: "critical",
    status: "silent",
    pill: "Silent Blind Spot",
    queueClass: "Silent Rule Breakage",
    siem: "Splunk",
    siemLabel: "Splunk Enterprise (SPL)",
    volume: "0 hits (Expected ~28/day)",
    spark: [26, 24, 29, 27, 22, 0, 0],
    cause: "Zeek 6.2 renamed 'query' to 'dns.qname'. The SPL still filters the old field, so the tunnel rule matches nothing.",
    lineage: ["Zeek DNS", "Cribl v2.4", "Splunk Enterprise"],
    nodes: ["zeek", "cribl", "splunk"],
    branch: "fix/zeek-qname-t1071",
    pr: 846,
    backtest: 9945,
    schemaBreak: true,
    parserDrift: true,
    gap: true,
    degraded: true,
    fields: "dns.qname query entropy",
    broken: `index=zeek sourcetype=zeek:dns
| where len(query)>40
| where match(query, "[a-z0-9]{30,}")`,
    hunkA: `| eval qname=coalesce(query, 'dns.qname')
| where len(qname)>40`,
    hunkB: `| where qname!="*.windowsupdate.com" AND qname!="*.office.com"`,
    coach: {
      signature: `| where qname!="*.windowsupdate.com" AND qname!="*.office.com"
    AND NOT match(answers, "corp-resolver")`,
      upstream: `// SPL exclusion withheld
// Cribl pack: coalesce(dns.qname, query) as query`,
      info: `| eval severity="informational"`,
    },
  },
  {
    id: "schtask",
    title: "Suspicious Scheduled Task Registration",
    technique: "T1053.005",
    tactic: "Persistence",
    severity: "HIGH",
    tone: "critical",
    status: "silent",
    pill: "Silent Blind Spot",
    queueClass: "Silent Rule Breakage",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "0 hits (Expected ~9/day)",
    spark: [8, 9, 7, 11, 8, 0, 0],
    cause: "Defender renamed 'TaskContent' to 'TaskArguments'. The KQL project also drops TaskName, so Torq cannot disable the task.",
    lineage: ["Defender for Endpoint", "Sentinel", "Torq disable-task"],
    nodes: ["defender", "sentinel", "torq"],
    branch: "fix/schtask-arguments-t1053",
    pr: 847,
    backtest: 9946,
    schemaBreak: true,
    parserDrift: false,
    webhook: true,
    gap: true,
    degraded: true,
    fields: "TaskContent TaskArguments TaskName",
    broken: `DeviceProcessEvents
| where FileName =~ "schtasks.exe" and ProcessCommandLine has "/create"
| project Timestamp, DeviceName, ProcessCommandLine`,
    hunkA: `| extend TaskArgs = coalesce(TaskContent, TaskArguments)
| project Timestamp, DeviceName, DeviceId, TaskName, TaskArgs, ProcessCommandLine`,
    hunkB: `| where InitiatingProcessFileName !in~ ("SetupHost.exe", "TiWorker.exe")`,
    coach: {
      signature: `| where InitiatingProcessFileName !in~ ("SetupHost.exe", "TiWorker.exe")
    and InitiatingProcessSignatureStatus == "Valid"`,
      upstream: `// KQL exclusion withheld
// Cribl pack: coalesce(TaskArguments, TaskContent) as TaskContent`,
      info: `| extend AlertSeverity = "Informational"`,
    },
  },
  {
    id: "github",
    title: "GitHub PAT Exfiltration to External Gist",
    technique: "T1567.002",
    tactic: "Exfiltration",
    severity: "MEDIUM",
    tone: "degraded",
    status: "lag",
    pill: "Ingestion Lag",
    queueClass: "Telemetry Ingestion Stall",
    siem: "Snowflake",
    siemLabel: "Snowflake OCSF (SQL)",
    volume: "Delayed 3.1h",
    spark: [6, 7, 5, 4, 3, 2, 1],
    cause: "GitHub audit stream webhook secret rotated. Cribl is buffering gist.create events 3.1 hours behind.",
    lineage: ["GitHub Enterprise Audit", "Cribl HTTP pull", "Snowflake OCSF"],
    nodes: ["github", "cribl", "snowflake"],
    branch: "fix/github-audit-lag-t1567",
    pr: 848,
    backtest: 9947,
    schemaBreak: false,
    parserDrift: true,
    gap: true,
    degraded: true,
    fields: "gist.create action token_last_eight",
    broken: `SELECT event_time, actor_user, api_operation
FROM ocsf.api_activity
WHERE api_operation = 'gist.create'
  AND event_time > dateadd(minute, -15, current_timestamp())`,
    hunkA: `-- accept the buffered GitHub audit window
WHERE event_time > dateadd(hour, -4, current_timestamp())`,
    hunkB: `AND actor_user NOT IN ('github-actions[bot]', 'dependabot[bot]')`,
    coach: {
      signature: `AND actor_user NOT IN ('github-actions[bot]', 'dependabot[bot]')
  AND repo_visibility = 'public'`,
      upstream: `-- SQL predicate withheld
-- Cribl: rotate the GitHub audit webhook secret and drain the retry buffer`,
      info: `AND severity = 'Informational'`,
    },
  },
  {
    id: "entra",
    title: "Entra Privileged Role Assigned Outside PIM",
    technique: "T1098.003",
    tactic: "Persistence",
    severity: "HIGH",
    tone: "degraded",
    status: "noisy",
    pill: "Precision Collapse",
    queueClass: "Alert Storm / Precision Drop",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "640 hits (+180% spike)",
    spark: [18, 22, 30, 48, 70, 90, 110],
    cause: "Break-glass PIM eligible assignments are missing from the approved_role_assigners watchlist.",
    lineage: ["Microsoft Entra ID", "Sentinel Analytics"],
    nodes: ["entra", "sentinel"],
    branch: "fix/entra-pim-watchlist-t1098",
    pr: 849,
    backtest: 9948,
    schemaBreak: false,
    parserDrift: false,
    gap: false,
    degraded: true,
    fields: "RoleDefinition approved_role_assigners",
    broken: `AuditLogs
| where OperationName == "Add member to role"
| where Result == "success"`,
    hunkA: `| join kind=leftouter (_GetWatchlist('approved_role_assigners')) on $left.InitiatedBy == $right.SearchKey
| where isempty(SearchKey)`,
    hunkB: `| where RoleDefinition !in~ ("Directory Readers", "Reports Reader")`,
    coach: {
      signature: `| where RoleDefinition !in~ ("Directory Readers", "Reports Reader")
    and AssignmentType != "Eligible"`,
      upstream: `// KQL exclusion withheld
// Watchlist pack: append the break-glass PIM group to approved_role_assigners`,
      info: `| extend AlertSeverity = "Informational"`,
    },
  },
  {
    id: "spray",
    title: "Entra Password Spray from Hosting ASN",
    technique: "T1110.003",
    tactic: "Initial Access",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "31 hits (97.1% precision)",
    spark: [20, 24, 28, 22, 30, 27, 31],
    cause: "Contract holds. Sign-in error 50126 still maps to ASIM authentication.",
    lineage: ["Microsoft Entra ID", "Sentinel"],
    nodes: ["entra", "sentinel"],
    degraded: false,
    gap: false,
    fields: "ResultType 50126 ASN",
  },
  {
    id: "wmi",
    title: "WMI Remote Process Creation",
    technique: "T1047",
    tactic: "Execution",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "6 hits (99.0% precision)",
    spark: [4, 5, 6, 5, 7, 6, 6],
    cause: "Contract holds. Win32_Process Create maps to InitiatingProcessParentFileName.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "Win32_Process WmiPrvSE.exe",
  },
  {
    id: "inject",
    title: "Process Injection via CreateRemoteThread",
    technique: "T1055",
    tactic: "Privilege Escalation",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "3 hits (100% precision)",
    spark: [2, 3, 2, 4, 3, 3, 3],
    cause: "Contract holds. Cross-process CreateRemoteThread still lands on the ASIM process schema.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "CreateRemoteThread SourceProcessId",
  },
  {
    id: "clearlog",
    title: "Windows Security Log Cleared",
    technique: "T1070.001",
    tactic: "Defense Evasion",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "1 hit (100% precision)",
    spark: [0, 1, 0, 1, 0, 1, 1],
    cause: "Contract holds. Event 1102 still parses from the Defender security channel.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "EventId 1102 wevtutil",
  },
  {
    id: "defendoff",
    title: "Defender Real-Time Protection Disabled",
    technique: "T1562.001",
    tactic: "Defense Evasion",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "4 hits (96.8% precision)",
    spark: [3, 4, 3, 5, 4, 4, 4],
    cause: "Contract holds. Set-MpPreference DisableRealtimeMonitoring is still on the script schema.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "DisableRealtimeMonitoring Set-MpPreference",
  },
  {
    id: "token",
    title: "Access Token Impersonation",
    technique: "T1134",
    tactic: "Privilege Escalation",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Sentinel",
    siemLabel: "Microsoft Sentinel (KQL)",
    volume: "2 hits (100% precision)",
    spark: [1, 2, 1, 2, 2, 1, 2],
    cause: "Contract holds. ImpersonateLoggedOnUser still maps to the ASIM process actor.",
    lineage: ["Defender for Endpoint", "Sentinel"],
    nodes: ["defender", "sentinel"],
    degraded: false,
    gap: false,
    fields: "ImpersonateLoggedOnUser TokenElevation",
  },
  {
    id: "rdp",
    title: "External RDP from an Untrusted ASN",
    technique: "T1133",
    tactic: "Initial Access",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Splunk",
    siemLabel: "Splunk Enterprise (SPL)",
    volume: "5 hits (94.2% precision)",
    spark: [4, 6, 5, 4, 7, 5, 5],
    cause: "Contract holds. The VPN concentrator still emits src_ip and dest_port 3389.",
    lineage: ["Okta System Log", "Splunk Enterprise"],
    nodes: ["okta", "splunk"],
    degraded: false,
    gap: false,
    fields: "dest_port 3389 src_ip",
  },
  {
    id: "kubectl",
    title: "kubectl exec into a Privileged Pod",
    technique: "T1609",
    tactic: "Execution",
    severity: "HEALTHY",
    tone: "healthy",
    status: "healthy",
    pill: "Verified",
    queueClass: "Verified",
    siem: "Snowflake",
    siemLabel: "Snowflake OCSF (SQL)",
    volume: "7 hits (98.6% precision)",
    spark: [5, 6, 8, 7, 6, 7, 7],
    cause: "Contract holds. Kubernetes audit verb exec maps to OCSF api.operation.",
    lineage: ["Kubernetes Audit", "Snowflake OCSF"],
    nodes: ["k8s", "snowflake"],
    degraded: false,
    gap: false,
    fields: "objectRef verb exec privileged",
  },
]

export const NODES = [
  { id: "falcon", stage: "Telemetry Sources", title: "CrowdStrike Falcon v7.14", badge: "Schema Mutated", tone: "degraded", x: 16, y: 40 },
  { id: "okta", stage: "Telemetry Sources", title: "Okta System Log", badge: "Healthy", tone: "healthy", x: 16, y: 114 },
  { id: "cloudtrail", stage: "Telemetry Sources", title: "AWS CloudTrail", badge: "Lagging", tone: "degraded", x: 16, y: 188 },
  { id: "defender", stage: "Telemetry Sources", title: "Defender for Endpoint", badge: "Healthy", tone: "healthy", x: 16, y: 262 },
  { id: "entra", stage: "Telemetry Sources", title: "Microsoft Entra ID", badge: "Healthy", tone: "healthy", x: 16, y: 336 },
  { id: "zeek", stage: "Telemetry Sources", title: "Zeek DNS", badge: "qname Unmapped", tone: "critical", x: 16, y: 410 },
  { id: "github", stage: "Telemetry Sources", title: "GitHub Enterprise Audit", badge: "Lagging 3.1h", tone: "degraded", x: 16, y: 484 },
  { id: "k8s", stage: "Telemetry Sources", title: "Kubernetes Audit", badge: "Healthy", tone: "healthy", x: 16, y: 558 },
  { id: "cribl", stage: "Pipeline & Normalization", title: "Cribl Stream v2.4", badge: "ASIM Mapping Drop", tone: "critical", x: 270, y: 160 },
  { id: "snowflake", stage: "Pipeline & Normalization", title: "Snowflake OCSF Collector", badge: "Healthy", tone: "healthy", x: 270, y: 400 },
  { id: "sentinel", stage: "Detection Engine", title: "Microsoft Sentinel (142 Rules)", badge: "2 Silent Zero-Match", tone: "critical", x: 524, y: 130 },
  { id: "splunk", stage: "Detection Engine", title: "Splunk Enterprise (88 Rules)", badge: "1 Silent · +340% FP", tone: "degraded", x: 524, y: 340 },
  { id: "torq", stage: "Response & SOAR", title: "Torq SOAR Playbooks", badge: "2 Payload Contracts Broken", tone: "critical", x: 778, y: 250 },
]

export const EDGES = [
  ["falcon", "cribl"],
  ["cloudtrail", "cribl"],
  ["zeek", "cribl"],
  ["github", "cribl"],
  ["defender", "sentinel"],
  ["entra", "sentinel"],
  ["okta", "splunk"],
  ["k8s", "snowflake"],
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
      { id: "T1133", ruleId: "rdp", base: "verified" },
      { id: "T1110.003", ruleId: "spray", base: "verified" },
    ],
  },
  {
    tactic: "Execution",
    cells: [
      { id: "T1059.001", ruleId: "powershell", base: "blind" },
      { id: "T1059.003", base: "verified" },
      { id: "T1047", ruleId: "wmi", base: "verified" },
      { id: "T1609", ruleId: "kubectl", base: "verified" },
    ],
  },
  {
    tactic: "Persistence",
    cells: [
      { id: "T1078.004", ruleId: "iam", base: "degraded" },
      { id: "T1053.005", ruleId: "schtask", base: "blind" },
      { id: "T1098.003", ruleId: "entra", base: "degraded" },
      { id: "T1547", base: "verified" },
    ],
  },
  {
    tactic: "Privilege Escalation",
    cells: [
      { id: "T1068", base: "verified" },
      { id: "T1055", ruleId: "inject", base: "verified" },
      { id: "T1134", ruleId: "token", base: "verified" },
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
      { id: "T1070.001", ruleId: "clearlog", base: "verified" },
      { id: "T1490", ruleId: "shadow", base: "verified" },
      { id: "T1562.001", ruleId: "defendoff", base: "verified" },
    ],
  },
  {
    tactic: "Command and Control",
    cells: [
      { id: "T1071.004", ruleId: "dns", base: "blind" },
      { id: "T1071", base: "verified" },
      { id: "T1572", base: "verified" },
    ],
  },
  {
    tactic: "Exfiltration",
    cells: [
      { id: "T1567.002", ruleId: "github", base: "degraded" },
      { id: "T1048", base: "verified" },
      { id: "T1041", base: "verified" },
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
      { raw: "process.user_name", transform: "rename → AccountName", target: "actor.user.name", state: "ok" },
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
      { raw: "TaskArguments", transform: "rename → TaskContent", target: "unmapped.TaskContent", state: "drift", note: "schtasks /create" },
    ],
  },
  {
    id: "zeek",
    name: "Zeek DNS",
    pack: "Cribl Stream v2.4 · zeek_dns",
    rawPreview: `{
  "dns": { "qname": "k7f3a9c1e.corp-tunnel.net", "qtype": "TXT" }
}`,
    rawNote: "Renamed in Zeek 6.2",
    impact: "Breaks the DNS tunneling SPL. Expected volume was ~28 hits a day.",
    expression: `// Cribl Stream v2.4 · Zeek DNS pack
coalesce(dns.qname, query) as query`,
    rows: [
      { raw: "dns.qname", transform: "UNMAPPED", target: "dns.query", state: "broken", note: "NULL / UNMAPPED" },
      { raw: "dns.qtype", transform: "rename → query_type", target: "dns.query_type", state: "ok" },
      { raw: "id.orig_h", transform: "rename → src_ip", target: "src_endpoint.ip", state: "ok" },
      { raw: "answers", transform: "passthrough", target: "dns.answers", state: "ok" },
    ],
  },
  {
    id: "github",
    name: "GitHub Enterprise Audit",
    pack: "Cribl Stream v2.4 · github_http",
    rawPreview: `{
  "action": "gist.create",
  "actor": "npatel",
  "created_at": "2026-11-03T09:12:00Z"
}`,
    rawNote: "Webhook secret rotated",
    impact: "gist.create reaches Snowflake 3.1 hours late.",
    expression: `// Cribl HTTP pull
input("github_audit", { token: env("GH_AUDIT_TOKEN"), replay: "4h" })`,
    rows: [
      { raw: "action", transform: "map → api.operation", target: "api.operation", state: "ok" },
      { raw: "actor", transform: "rename → actor.user", target: "actor.user.name", state: "ok" },
      { raw: "created_at", transform: "buffer stalled", target: "time", state: "drift", note: "3.1h lag" },
    ],
  },
  {
    id: "entra",
    name: "Microsoft Entra ID",
    pack: "Cribl Stream v2.4 · entra_asim",
    rawPreview: `{
  "operationName": "Add member to role",
  "initiatedBy": "breakglass-pim"
}`,
    rawNote: "PIM eligible assignment",
    impact: "Role-assignment rule is noisy. The sign-in schema itself still maps.",
    expression: `// Cribl watchlist pack
lookup_csv("approved_role_assigners.csv").append("breakglass-pim", "Eligible")`,
    rows: [
      { raw: "operationName", transform: "passthrough", target: "audit.operation", state: "ok" },
      { raw: "initiatedBy", transform: "lookup approved_role_assigners", target: "actor.user.name", state: "drift", note: "PIM group missing" },
      { raw: "resultType", transform: "rename → ResultType", target: "authentication.result", state: "ok" },
      { raw: "ipAddress", transform: "rename → src_ip", target: "src_endpoint.ip", state: "ok" },
    ],
  },
  {
    id: "k8s",
    name: "Kubernetes Audit",
    pack: "Cribl Stream v2.4 · k8s_ocsf",
    rawPreview: `{
  "verb": "create",
  "objectRef": { "resource": "pods" },
  "user": { "username": "system:serviceaccount:ci:deploy" }
}`,
    rawNote: "Audit policy v1",
    impact: "No open contract breaks on this pack.",
    expression: `// Cribl · Kubernetes OCSF pack
rename(verb, api.operation)`,
    rows: [
      { raw: "verb", transform: "map → api.operation", target: "api.operation", state: "ok" },
      { raw: "objectRef.resource", transform: "rename → resource", target: "api.resource", state: "ok" },
      { raw: "user.username", transform: "rename → actor.user", target: "actor.user.name", state: "ok" },
      { raw: "requestObject.spec.containers", transform: "passthrough", target: "unmapped.containers", state: "ok" },
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
    healed: "DeviceId is projected again. isolate-host accepts the payload.",
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
  {
    id: "disable-task",
    name: "Torq // Disable Rogue Scheduled Task",
    ruleId: "schtask",
    trigger: "Suspicious Scheduled Task Registration (T1053.005)",
    error: "HTTP 422 Unprocessable Entity — Required key 'payload.task.TaskName' evaluated to NULL.",
    healed: "TaskName is projected again. disable-task accepts the payload.",
    expected: `{
  "payload": {
    "task": { "TaskName": "string", "DeviceId": "string" },
    "action": "disable-task"
  }
}`,
    actual: `{
  "payload": {
    "task": { "TaskName": null, "DeviceId": "a91c" },
    "action": "disable-task"
  }
}`,
  },
  {
    id: "sinkhole",
    name: "Torq // DNS Sinkhole High-Entropy Domain",
    ruleId: "dns",
    trigger: "DNS Tunneling via High-Entropy Queries (T1071.004)",
    note: "The sinkhole webhook is valid. It never fires because the Zeek qname field no longer matches.",
  },
  {
    id: "revoke-pat",
    name: "Torq // Revoke GitHub Personal Access Token",
    ruleId: "github",
    trigger: "GitHub PAT Exfiltration to External Gist (T1567.002)",
    note: "Revoke accepts actor and token_last_eight. The playbook is waiting on the late audit stream.",
  },
  {
    id: "pim",
    name: "Torq // Entra PIM Challenge for Role Assignment",
    ruleId: "entra",
    trigger: "Entra Privileged Role Assigned Outside PIM (T1098.003)",
    note: "The PIM challenge receives InitiatedBy. Noise is the watchlist, not the webhook.",
  },
  {
    id: "isolate-pod",
    name: "Torq // Quarantine Privileged Kubernetes Pod",
    ruleId: "kubectl",
    trigger: "kubectl exec into a Privileged Pod (T1609)",
    note: "Namespace, pod name, and the exec verb all arrive on the OCSF payload.",
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
