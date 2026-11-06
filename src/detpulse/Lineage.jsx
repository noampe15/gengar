import { useLayoutEffect, useRef, useState } from "react"
import { EDGES, NODES, PLAYBOOKS, RULES, litNodeIds } from "./model"
import { usePulse } from "./PulseContext"
import { Card } from "./ui"

const METRICS = {
  falcon: ["4.8k EPS", "ASIM Contract: 1 Key Mutated"],
  okta: ["840 EPS", "CIM Contract: 100%"],
  cloudtrail: ["2.1k EPS", "Lag: 4.5h (STS Expired)"],
  defender: ["3.6k EPS", "ASIM Contract: 100%"],
  entra: ["960 EPS", "ASIM Contract: 100%"],
  zeek: ["12.4k EPS", "OCSF: 'qname' Unmapped"],
  github: ["180 EPS", "Lag: 3.1h"],
  k8s: ["640 EPS", "OCSF v1.1 Verified"],
  cribl: ["24.2k EPS In → 8.1k Out", "2 Normalization Drops"],
  snowflake: ["14.6k EPS", "OCSF v1.1 Verified"],
  sentinel: ["2 Blind • 138 Verified", "ASIM v0.2"],
  splunk: ["1 FP Storm (+340%)", "CIM v5.0"],
  torq: ["18 Active", "2 HTTP 422 Fails"],
}

const FAULTS = {
  "falcon-cribl": { stroke: "#f87171", pill: "! process.cmd_line" },
  "cribl-sentinel": { stroke: "#f87171" },
  "sentinel-torq": { stroke: "#f87171", pill: "! DeviceId" },
  "zeek-cribl": { stroke: "#fbbf24", pill: "! qname" },
  "cloudtrail-cribl": { stroke: "#fbbf24" },
  "github-cribl": { stroke: "#fbbf24" },
  "splunk-torq": { stroke: "#fbbf24" },
}

const PROFILES = {
  falcon: {
    lag: "Ingest lag 12s",
    auth: "Collector auth valid",
    removed: '"ProcessCommandLine": "powershell.exe -enc..."',
    added: '"process": { "cmd_line": "powershell.exe -enc..." }',
    rows: [
      ["TargetProcessCommandLine", "NULL (100% Drop since v7.14 upgrade)", true],
      ["process.cmd_line", "Present on the raw Falcon event", false],
    ],
  },
  okta: {
    lag: "Ingest lag 8s",
    auth: "Collector auth valid",
    removed: null,
    added: '"eventType": "user.session.start", "client.ipAddress": "35.71.x.x"',
    rows: [
      ["src_ip", "Present", false],
      ["trusted_egress.csv", "WARP CIDR missing from the lookup", true],
    ],
  },
  cloudtrail: {
    lag: "Ingest lag 4.5h",
    auth: "STS AssumeRole session expired",
    removed: '"userIdentity.sessionContext.attributes.creationDate": "on time"',
    added: '"error": "ExpiredToken", "delay": "4.5h"',
    rows: [
      ["eventTime", "Trailing real time by 4.5h", true],
      ["userIdentity.sessionContext", "Present on 99.4% of accounts once the lag clears", false],
    ],
  },
  defender: {
    lag: "Ingest lag 20s",
    auth: "Collector auth valid",
    removed: null,
    added: '"DeviceId": "present", "FileName": "rundll32.exe"',
    rows: [
      ["DeviceId", "Present at the collector", false],
      ["TaskArguments", "Renamed from TaskContent", true],
    ],
  },
  entra: {
    lag: "Ingest lag 15s",
    auth: "Collector auth valid",
    removed: null,
    added: '"initiatedBy": "break-glass", "roleDefinition": "Privileged Role Administrator"',
    rows: [
      ["initiatedBy", "Mapped", false],
      ["approved_role_assigners", "Break-glass principal missing from the watchlist", true],
    ],
  },
  zeek: {
    lag: "Ingest lag 6s",
    auth: "Collector auth valid",
    removed: '"query": "aGVsbG8.example.com"',
    added: '"dns": { "qname": "aGVsbG8.example.com" }',
    rows: [
      ["query", "NULL after Zeek 6.2", true],
      ["dns.qname", "Unmapped to the SPL field", true],
    ],
  },
  github: {
    lag: "Ingest lag 3.1h",
    auth: "Webhook secret rotated",
    removed: null,
    added: '"action": "gist.create", "created_at": "buffered"',
    rows: [
      ["created_at", "3.1h behind the audit stream", true],
      ["action", "gist.create still present", false],
    ],
  },
  k8s: {
    lag: "Ingest lag 9s",
    auth: "Collector auth valid",
    removed: null,
    added: '"verb": "exec", "objectRef.resource": "pods"',
    rows: [
      ["api.operation", "verb mapped", false],
      ["actor.user.name", "Mapped", false],
    ],
  },
  cribl: {
    lag: "Worker lag follows the slowest source",
    auth: "Cribl Stream v2.4 pack loaded",
    removed: '"ProcessCommandLine": "powershell.exe -enc..."',
    added: '"process.cmd_line": "dropped before the SIEM route"',
    rows: [
      ["TargetProcessCommandLine", "NULL (ASIM field not coalesced)", true],
      ["dns.qname", "Not renamed onto query", true],
    ],
  },
  snowflake: {
    lag: "Ingest lag follows CloudTrail / GitHub",
    auth: "OCSF collector key valid",
    removed: null,
    added: '"class_uid": 6003, "api.operation": "AssumeRole"',
    rows: [
      ["api.operation", "Mapped for healthy routes", false],
      ["eventTime", "CloudTrail rows arrive 4.5h late", true],
    ],
  },
  sentinel: {
    lag: "Analytics delay 1m",
    auth: "Workspace connected",
    removed: '"TargetProcessCommandLine": "expected"',
    added: '"TargetProcessCommandLine": null',
    rows: [
      ["TargetProcessCommandLine", "NULL on the PowerShell rule", true],
      ["DeviceId", "Projected, then dropped in the isolate KQL", true],
    ],
  },
  splunk: {
    lag: "Search head delay 40s",
    auth: "Splunk token valid",
    removed: '"query": "expected Zeek field"',
    added: '"dns.qname": "unmapped"',
    rows: [
      ["query", "NULL on the DNS tunnel search", true],
      ["src_ip lookup", "+340% FP after the WARP cutover", true],
    ],
  },
  torq: {
    lag: "Webhook timeout 2s",
    auth: "Torq workspace connected",
    removed: '"payload.entity.DeviceId": "string"',
    added: '"payload.entity.DeviceId": null',
    rows: [
      ["payload.entity.DeviceId", "NULL → HTTP 422 on isolate-host", true],
      ["payload.task.TaskName", "NULL → HTTP 422 on disable-task", true],
    ],
  },
}

export default function Lineage() {
  const { dispatch, patched } = usePulse()
  const canvasRef = useRef(null)
  const [wires, setWires] = useState([])
  const [fixIn, setFixIn] = useState("cribl")
  const [selectedId, setSelectedId] = useState("falcon")
  const lit = litNodeIds(selectedId)
  const stages = []
  for (const node of NODES) {
    if (!stages.some((stage) => stage === node.stage)) stages.push(node.stage)
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const measure = () => {
      const box = canvas.getBoundingClientRect()
      const localCards = [...canvas.querySelectorAll("[data-node]")].map((node) => {
        const rect = node.getBoundingClientRect()
        return { left: rect.left - box.left, right: rect.right - box.left, top: rect.top - box.top, bottom: rect.bottom - box.top }
      })
      setWires(
        EDGES.map(([fromId, toId]) => {
          const from = canvas.querySelector(`[data-node="${fromId}"]`)
          const to = canvas.querySelector(`[data-node="${toId}"]`)
          if (!from || !to) return null
          const start = from.getBoundingClientRect()
          const end = to.getBoundingClientRect()
          const sameColumn = Math.abs(start.left - end.left) < 8
          let d
          let x
          let y
          if (sameColumn) {
            const xLine = start.left + start.width / 2 - box.left
            const y1 = start.bottom - box.top
            const y2 = end.top - box.top
            d = `M ${xLine} ${y1} L ${xLine} ${y2}`
            x = xLine
            y = (y1 + y2) / 2
          } else {
            const x1 = start.right - box.left + 1
            const y1 = start.top + start.height / 2 - box.top
            const x2 = end.left - box.left - 1
            const y2 = end.top + end.height / 2 - box.top
            if (x2 - x1 > 220) {
              const blockers = localCards
                .filter((card) => card.right > x1 + 24 && card.left < x2 - 24)
                .sort((a, b) => a.top - b.top)
              const channels = []
              if (blockers.length) {
                channels.push(blockers[0].top - 14)
                for (let index = 0; index < blockers.length - 1; index += 1) channels.push((blockers[index].bottom + blockers[index + 1].top) / 2)
                channels.push(blockers[blockers.length - 1].bottom + 14)
              }
              const channel = channels.sort((a, b) => Math.abs(a - (y1 + y2) / 2) - Math.abs(b - (y1 + y2) / 2))[0] ?? (y1 + y2) / 2
              d = `M ${x1} ${y1} H ${x1 + 16} V ${channel} H ${x2 - 16} V ${y2} H ${x2}`
              x = (x1 + x2) / 2
              y = channel
            } else {
              const bend = Math.max(18, (x2 - x1) * 0.45)
              d = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`
              x = (x1 + x2) / 2
              y = (y1 + y2) / 2
            }
          }
          return { key: `${fromId}-${toId}`, fromId, toId, d, x, y }
        }).filter(Boolean),
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [selectedId])

  const selected = NODES.find((node) => node.id === selectedId) || NODES[0]
  const profile = PROFILES[selected.id]
  const metrics = METRICS[selected.id] || ["", ""]
  const touched = RULES.filter((rule) => rule.nodes.includes(selected.id))
  const openRule = touched.find((rule) => rule.degraded && !patched[rule.id])
  const playbooks = PLAYBOOKS.filter((playbook) => touched.some((rule) => rule.id === playbook.ruleId))

  return (
    <div className="space-y-4">
      <Card className="bg-[#F4F7FB]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <p className="text-[12px] text-slate-500">Select any telemetry source, pipeline worker, or SIEM hop to inspect live payload schemas, field normalization contracts, and downstream rule impact.</p>
        </div>
        <div className="overflow-x-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] p-4">
          <div ref={canvasRef} className="relative min-w-[960px]">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
              {wires.map((wire) => {
                const fault = FAULTS[wire.key]
                const hot = !lit || (lit.has(wire.fromId) && lit.has(wire.toId))
                return (
                  <path
                    key={wire.key}
                    d={wire.d}
                    fill="none"
                    stroke={fault ? fault.stroke : "#e2e8f0"}
                    strokeWidth={fault ? 2 : 1.5}
                    className={fault ? "detpulse-flow" : undefined}
                    opacity={hot ? 1 : 0.18}
                  />
                )
              })}
            </svg>
            {wires.map((wire) => {
              const fault = FAULTS[wire.key]
              const hot = !lit || (lit.has(wire.fromId) && lit.has(wire.toId))
              if (!fault?.pill || !hot) return null
              return (
                <span
                  key={`${wire.key}-pill`}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600 shadow-sm ring-1 ring-rose-200"
                  style={{ left: wire.x, top: wire.y }}
                >
                  {fault.pill}
                </span>
              )
            })}
            <div className="relative grid grid-cols-4 gap-x-10">
              {stages.map((stage, index) => {
                const nodes = NODES.filter((node) => node.stage === stage)
                return (
                  <div key={stage} className={index === 0 ? "" : "flex flex-col"}>
                    <p className="mb-2 h-4 text-[11px] font-semibold text-slate-400">{stage}</p>
                    <div className={index === 0 ? "space-y-2" : "flex flex-1 flex-col justify-center gap-8"}>
                      {nodes.map((node) => (
                        <NodeCard
                          key={node.id}
                          node={node}
                          patched={patched}
                          selected={selectedId === node.id}
                          dim={lit && !lit.has(node.id)}
                          onSelect={() => setSelectedId(node.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-5 lg:grid-cols-3">
        <div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400">Upstream Payload & Schema State</p>
          <p className="mt-1 text-[13px] font-semibold text-slate-900">{selected.title}</p>
          <div className="mt-2 rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-slate-100">
            {profile.removed ? <p className="text-red-300">- {profile.removed}</p> : null}
            <p className="text-emerald-300">+ {profile.added}</p>
            <p className="mt-3 text-slate-400">{metrics[0]}</p>
            <p className="text-slate-400">{profile.lag}</p>
            <p className="text-slate-400">{profile.auth}</p>
          </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400">Pipeline Normalization & Field Contract</p>
          <p className="mt-1 text-[13px] font-semibold text-slate-900">ASIM / OCSF Mapping</p>
          <div className="mt-2 space-y-2">
            {profile.rows.map(([expected, status, bad]) => (
              <div key={expected} className="rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Expected SIEM Field</p>
                <p className="font-mono text-[12px] text-slate-900">{expected}</p>
                <p className={`mt-1 text-[12px] ${bad ? "text-red-600" : "text-emerald-700"}`}>➔ Status: {status}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">Fix Location</span>
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
            <button
              type="button"
              aria-pressed={fixIn === "siem"}
              onClick={() => setFixIn("siem")}
              className={fixIn === "siem" ? "rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm" : "rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"}
            >
              Patch in SIEM KQL
            </button>
            <button
              type="button"
              aria-pressed={fixIn === "cribl"}
              onClick={() => setFixIn("cribl")}
              className={fixIn === "cribl" ? "rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm" : "rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"}
            >
              Push Coalesce to Cribl Pack
            </button>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400">Downstream Blast Radius & Direct Remediation</p>
          <ul className="mt-2 space-y-2">
            {touched.filter((rule) => rule.degraded && !patched[rule.id]).map((rule) => (
              <li key={rule.id} className="rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-[12px]">
                <span className="font-mono text-[11px] text-slate-500">{rule.technique}</span>
                <span className="ml-1.5 font-semibold text-slate-900">{rule.title}</span>
                <span className="mt-0.5 block text-red-600">{rule.volume}</span>
              </li>
            ))}
            {playbooks.filter((playbook) => playbook.error && touched.some((rule) => rule.id === playbook.ruleId && rule.degraded && !patched[rule.id])).map((playbook) => (
              <li key={playbook.id} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
                {playbook.name} [HTTP 422]
              </li>
            ))}
            <li className="text-[12px] text-slate-500">{touched.filter((rule) => !rule.degraded || patched[rule.id]).length} verified rules on this hop.</li>
          </ul>
          {openRule ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "open", id: openRule.id })}
              className="mt-3 inline-flex h-8 items-center rounded-xl bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-indigo-600"
            >
              Inspect & Remediate →
            </button>
          ) : (
            <p className="mt-3 text-[12px] text-emerald-700">No open contract break on this hop.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function NodeCard({ node, patched, selected, dim, onSelect }) {
  const live = liveNode(node, patched)
  const dot = live.tone === "critical" ? "bg-red-500" : live.tone === "degraded" ? "bg-amber-400" : "bg-emerald-500"
  const ink = live.tone === "critical" ? "text-red-600" : live.tone === "degraded" ? "text-amber-700" : "text-emerald-700"
  const [left, right] = METRICS[node.id] || ["—", "—"]
  return (
    <button
      type="button"
      data-node={node.id}
      aria-pressed={selected}
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white px-3.5 py-2.5 text-left shadow-sm transition ${selected ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200/80 hover:border-slate-300"} ${dim ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold leading-snug text-slate-900">{node.title}</p>
        <span className={`mt-1 size-2 shrink-0 rounded-full ${dot}`} />
      </div>
      <p className={`text-[11px] font-semibold ${ink}`}>{live.badge}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5 font-mono text-[11px] leading-tight text-slate-500">
        <span>{left}</span>
        <span className="text-right">{right}</span>
      </div>
    </button>
  )
}

function liveNode(node, patched) {
  const open = RULES.filter((rule) => rule.degraded && !patched[rule.id] && rule.nodes.includes(node.id))
  if (open.length === 0) return { tone: "healthy", badge: "Healthy" }
  return { tone: node.tone, badge: node.badge }
}
