export const STACK_STAGES = [
  "Telemetry Sources (EDR/IdP/Cloud)",
  "Data Pipeline (Cribl/Kafka)",
  "Detection Engine (Sentinel/Splunk/Snowflake)",
  "Response & SOAR (Torq/Tines)",
]

export const PS_RULE = "Suspicious PowerShell EncodedCommand (MITRE T1059.001)"
export const OKTA_RULE = "Okta Impossible Travel & Session Anomaly (MITRE T1078)"
export const LSASS_RULE = "LSASS Memory Dump via Rundll32 (MITRE T1003.001)"
export const IAM_RULE = "AWS IAM Root & AssumeRole Abuse (MITRE T1078.004)"

const BROKEN_POWERSHELL = `// BROKEN: Field 'ProcessCommandLine' is NULL after Falcon v7.14 update
DeviceProcessEvents
| where Timestamp > ago(1h)
| where FileName in~ ("powershell.exe", "pwsh.exe")
| where ProcessCommandLine has_any ("-enc", "-EncodedCommand", "IEX")
| project Timestamp, DeviceName, AccountName, ProcessCommandLine

// Raw incoming log payload (Falcon v7.14)
{
  "event_simpleName": "ProcessRollup2",
  "FileName": "powershell.exe",
  "ProcessCommandLine": null,
  "process.cmd_line": "powershell.exe -nop -w hidden -enc SQBFAFgA..."
}`

const REPAIRED_POWERSHELL = `// REPAIRED: Normalize Falcon v7.14 process.cmd_line into ASIM ProcessCommandLine
DeviceProcessEvents
| extend ProcessCommandLine = coalesce(
    ProcessCommandLine,
    tostring(parse_json(tostring(RawEvent))["process.cmd_line"]))
| where Timestamp > ago(1h)
| where FileName in~ ("powershell.exe", "pwsh.exe")
| where ProcessCommandLine has_any ("-enc", "-EncodedCommand", "IEX")
| project Timestamp, DeviceName, AccountName, ProcessCommandLine

// Normalized payload after Cribl ASIM pack
{
  "FileName": "powershell.exe",
  "ProcessCommandLine": "powershell.exe -nop -w hidden -enc SQBFAFgA..."
}`

export const SCENARIOS = {
  [PS_RULE]: {
    stage: STACK_STAGES[2],
    failureClass: "Silent Rule Breakage",
    priority: "Critical",
    lineage: "CrowdStrike Falcon → Cribl Stream → Microsoft Sentinel",
    impact: "Match Volume Dropped to 0% (Silent Blind Spot)",
    rootCause:
      "Upstream Schema Drift: Falcon v7.14 renamed 'ProcessCommandLine' to 'process.cmd_line'; Cribl parser failed to normalize to ASIM.",
    summary:
      "The production KQL rule still filters on ProcessCommandLine, which Falcon v7.14 no longer populates. Cribl should map process.cmd_line into the ASIM ProcessCommandLine field before the rule evaluates.",
    panels: [
      { title: "Broken Production Rule — KQL/SPL", code: BROKEN_POWERSHELL },
      { title: "Repaired Detection Logic", code: REPAIRED_POWERSHELL },
    ],
  },
  [OKTA_RULE]: {
    stage: STACK_STAGES[0],
    failureClass: "Alert Storm / Precision Drop",
    priority: "High",
    lineage: "Okta System Log → Snowflake Security Lake → Splunk SIEM",
    impact: "False Positive Spike (+340% / 142 noisy alerts/hr)",
    rootCause:
      "Environment Drift: New corporate Cloudflare WARP egress IP range missing from 'trusted_corporate_subnets.csv' lookup.",
    summary:
      "Impossible-travel logic treats new WARP egress addresses as untrusted. Adding the published range to the lookup restores precision without widening the rule.",
    panels: [
      {
        title: "Broken Production Rule — KQL/SPL",
        code: `// BROKEN: WARP egress missing from the trusted lookup
index=okta sourcetype=okta:im
| lookup trusted_corporate_subnets.csv client_ip OUTPUT trusted
| where isnull(trusted) AND improbable_travel=1
| stats count by user, client_ip

// Raw Okta system log
{ "eventType": "user.session.start", "client.ipAddress": "104.28.19.44", "outcome": "SUCCESS" }`,
      },
      {
        title: "Repaired Detection Logic",
        code: `// REPAIRED: Cloudflare WARP egress range marked trusted
index=okta sourcetype=okta:im
| lookup trusted_corporate_subnets.csv client_ip OUTPUT trusted
| where isnull(trusted) AND improbable_travel=1
| where NOT cidrmatch("104.28.0.0/16", client_ip)

// trusted_corporate_subnets.csv
client_ip,trusted,comment
104.28.0.0/16,true,Cloudflare WARP egress`,
      },
    ],
  },
  [LSASS_RULE]: {
    stage: STACK_STAGES[3],
    failureClass: "SOAR Automation Failure",
    priority: "High",
    lineage: "Defender for Endpoint → Sentinel → Torq SOAR",
    impact: "Downstream Containment Playbook Failing",
    rootCause:
      "Payload Schema Mismatch: KQL rule projection dropped 'DeviceId' field required by Torq isolate-host webhook.",
    summary:
      "The isolate-host playbook receives an incident entity with no DeviceId, so Torq cannot call the Defender isolate API. Project DeviceId through the analytics rule.",
    panels: [
      {
        title: "Broken Production Rule — KQL/SPL",
        code: `// BROKEN: DeviceId dropped before the Torq webhook
DeviceProcessEvents
| where FileName =~ "rundll32.exe" and ProcessCommandLine has "comsvcs.dll" and ProcessCommandLine has "MiniDump"
| project Timestamp, DeviceName, AccountName
| extend TorqPayload = bag_pack("host", DeviceName)`,
      },
      {
        title: "Repaired Detection Logic",
        code: `// REPAIRED: DeviceId required by Torq isolate-host
DeviceProcessEvents
| where FileName =~ "rundll32.exe" and ProcessCommandLine has "comsvcs.dll" and ProcessCommandLine has "MiniDump"
| project Timestamp, DeviceName, AccountName, DeviceId
| extend TorqPayload = bag_pack("host", DeviceName, "deviceId", DeviceId)`,
      },
    ],
  },
  [IAM_RULE]: {
    stage: STACK_STAGES[1],
    failureClass: "Telemetry Ingestion Stall",
    priority: "Medium",
    lineage: "AWS CloudTrail → S3 SQS Collector → Snowflake OCSF",
    impact: "Ingestion Lag > 4.5 Hours (12 rules degraded)",
    rootCause: "IAM role session policy expired on Cribl S3 pull worker.",
    summary:
      "Twelve detections that depend on CloudTrail in Snowflake are evaluating an empty window. Renew the Cribl worker session policy so the S3 pull resumes.",
    panels: [
      {
        title: "Broken Production Rule — KQL/SPL",
        code: `// BROKEN: CloudTrail objects stop arriving after the worker session expires
SELECT eventTime, userIdentity.type, eventName
FROM cloudtrail_ocsf
WHERE eventTime > dateadd(hour, -1, current_timestamp())
  AND eventName IN ('ConsoleLogin', 'AssumeRole')
// last object seen: 4.5h ago — collector AccessDenied`,
      },
      {
        title: "Repaired Detection Logic",
        code: `// REPAIRED: Cribl S3 pull session policy renewed
{
  "worker": "cribl-cloudtrail-pull",
  "action": "s3:GetObject",
  "resource": "arn:aws:s3:::security-cloudtrail/*",
  "session": "renewed"
}`,
      },
    ],
  },
}

export function scenarioFor(issue) {
  if (!issue) return null
  return SCENARIOS[issue] ?? null
}

export function panelsFor(issue) {
  const known = scenarioFor(issue)
  if (known) return known
  const title = issue || "Detection rule"
  return {
    stage: STACK_STAGES[2],
    failureClass: "Detection drift",
    lineage: "Telemetry → Pipeline → Detection Engine",
    impact: "Rule health degraded",
    rootCause: "Schema or environment drift between the parser and the production rule.",
    summary: `Live detection logic for “${title}” no longer matches the payload arriving from the pipeline. The repaired query binds the current field names.`,
    panels: [
      {
        title: "Broken Production Rule — KQL/SPL",
        code: `// BROKEN: production rule for ${title}
| where LegacyField has_any ("enc", "AssumeRole")
| project Timestamp, LegacyField`,
      },
      {
        title: "Repaired Detection Logic",
        code: `// REPAIRED: bind the current normalized field
| extend Normalized = coalesce(LegacyField, CurrentField)
| where Normalized has_any ("enc", "AssumeRole")
| project Timestamp, Normalized`,
      },
    ],
  }
}
