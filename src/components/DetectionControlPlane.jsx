import { useState } from "react"
import { DETECTION_ISSUES, TOPOLOGY_NODES, issuesForTopology } from "../detection"
import BacktestPanel from "./BacktestPanel"
import SchemaDiff from "./SchemaDiff"

const TABS = [
  { id: "schema", label: "Parser & Schema Drift" },
  { id: "rules", label: "Detection Rule Health" },
  { id: "backtest", label: "AI Agent Backtesting & Guardrails" },
]

const PRIORITY_BADGE = {
  Critical: "bg-red-50 text-red-700 border border-red-200",
  High: "bg-amber-50 text-amber-700 border border-amber-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
}

const KPIS = [
  {
    label: "Detection Coverage Index",
    value: "84.2%",
    pill: "−3.4% drift impact",
    pillClass: "bg-red-50 text-red-700 border border-red-200",
  },
  {
    label: "Active Pipeline Drift Events",
    value: "3 Parsers Degraded",
    pill: "Degraded",
    pillClass: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    label: "Silent Zero-Match Rules",
    value: "4 Critical Blind Spots",
    pill: "Critical",
    pillClass: "bg-red-50 text-red-700 border border-red-200",
  },
  {
    label: "Detection-as-Code Sync",
    value: "2 Hotfix PRs Pending",
    pill: "Pending",
    pillClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
]

function Lineage({ text }) {
  const parts = text.split(/\s*→\s*/)
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[12px] text-slate-600">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="text-slate-300">──&gt;</span> : null}
          <span>{part}</span>
        </span>
      ))}
    </span>
  )
}

export default function DetectionControlPlane({ onOpenIssue }) {
  const [tab, setTab] = useState("rules")
  const [nodeId, setNodeId] = useState("")
  const issues = issuesForTopology(nodeId)
  const active = TOPOLOGY_NODES.find((node) => node.id === nodeId)

  function selectNode(id) {
    setNodeId((current) => (current === id ? "" : id))
    setTab("rules")
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {TOPOLOGY_NODES.map((node, index) => {
            const selected = nodeId === node.id
            const count = issuesForTopology(node.id).length
            return (
              <div key={node.id} className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectNode(node.id)}
                  className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    selected
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block truncate text-[12.5px] font-semibold text-slate-900">{node.label}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-slate-400">
                    {count} {count === 1 ? "rule" : "rules"}
                  </span>
                </button>
                {index < TOPOLOGY_NODES.length - 1 ? (
                  <span className="hidden shrink-0 font-mono text-[12px] text-slate-300 lg:inline" aria-hidden="true">
                    ──&gt;
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[12px] text-slate-400">
          {active
            ? `Showing rules affected by ${active.label}.`
            : "Select a supply-chain node to filter the detection contract."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-[12px] font-medium text-slate-400">{card.label}</p>
            <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight text-slate-900">{card.value}</p>
            <span className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.pillClass}`}>
              {card.pill}
            </span>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div role="tablist" aria-label="Detection engineering views" className="flex flex-wrap gap-1">
            {TABS.map((item) => {
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {active ? (
            <button
              type="button"
              onClick={() => setNodeId("")}
              className="text-[12px] font-semibold text-indigo-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Clear filter
            </button>
          ) : (
            <p className="text-[12px] text-slate-400">{DETECTION_ISSUES.length} production rules</p>
          )}
        </div>

        {tab === "schema" ? (
          <div className="space-y-3 p-4">
            {issues.map((issue) => (
              <article key={issue.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <h3 className="mt-2 text-[14px] font-semibold text-slate-900">{issue.failureClass}</h3>
                    <p className="mt-1 text-[13px] text-slate-600">{issue.rootCause}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenIssue(issue)}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    Open agent
                  </button>
                </div>
                <SchemaDiff panels={issue.panels} branch={issue.branch} />
              </article>
            ))}
            {issues.length === 0 ? <p className="text-[13px] text-slate-500">No schema mutations on this node.</p> : null}
          </div>
        ) : null}

        {tab === "rules" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Rule</th>
                  <th className="px-4 py-3 font-medium">Lineage</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Root cause</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    onClick={() => onOpenIssue(issue)}
                  >
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_BADGE[issue.priority]}`}>
                        {issue.priority} · {issue.failureClass}
                      </span>
                      <p className="mt-1.5 text-[13px] font-semibold text-slate-900">{issue.title}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Lineage text={issue.lineage} />
                    </td>
                    <td className="px-4 py-3 align-top text-[13px] text-slate-700">{issue.impact}</td>
                    <td className="px-4 py-3 align-top text-[13px] text-slate-600">{issue.rootCause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 ? <p className="px-4 py-8 text-[13px] text-slate-500">No detection rules are bound to this node.</p> : null}
          </div>
        ) : null}

        {tab === "backtest" ? (
          <div className="space-y-3 p-4">
            <p className="text-[13px] text-slate-600">
              Replay each repaired query against 30 days of historical telemetry before a Detection-as-Code pull request is opened.
            </p>
            {issues.map((issue) => (
              <div key={issue.id}>
                <button
                  type="button"
                  onClick={() => onOpenIssue(issue)}
                  className="mb-2 text-left text-[13px] font-semibold text-slate-900 outline-none hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {issue.title}
                </button>
                <BacktestPanel title={issue.technique} />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
