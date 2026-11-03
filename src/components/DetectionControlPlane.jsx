import { useState } from "react"
import { CONTROL_METRICS, PIPELINE_LAYERS, issuesForNode, pipelineNode } from "../detection"
import BacktestPanel from "./BacktestPanel"
import SchemaDiff from "./SchemaDiff"

const TABS = [
  { id: "pipeline", label: "Parser & Pipeline Health" },
  { id: "rules", label: "Detection Rule Drift" },
  { id: "backtest", label: "Agent Backtesting & Guardrails" },
]

const PRIORITY_TONE = {
  Critical: "bg-rose-50 text-rose-800",
  High: "bg-amber-50 text-amber-800",
  Medium: "bg-slate-100 text-slate-700",
}

export default function DetectionControlPlane({ onOpenIssue }) {
  const [tab, setTab] = useState("pipeline")
  const [nodeId, setNodeId] = useState("")
  const issues = issuesForNode(nodeId)
  const focus = issues[0]
  const activeNode = pipelineNode(nodeId)

  function selectNode(id) {
    const next = nodeId === id ? "" : id
    setNodeId(next)
    if (!next) return
    const issue = issuesForNode(next)[0]
    if (issue) onOpenIssue(issue)
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CONTROL_METRICS.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <p className="text-[12px] font-medium leading-snug text-slate-500">{card.label}</p>
            <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-slate-900">{card.value}</p>
            <p className={`mt-2 text-[12px] font-medium ${card.tone === "bad" ? "text-rose-700" : "text-slate-600"}`}>
              {card.hint}
            </p>
            {card.detail ? <p className="mt-1 text-[12px] text-slate-500">{card.detail}</p> : null}
          </article>
        ))}
      </section>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div role="tablist" aria-label="Detection engineering sections" className="flex flex-wrap gap-1">
            {TABS.map((item) => {
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(item.id)}
                  className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                    selected ? "bg-[#6d5cff] text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {activeNode ? (
            <button
              type="button"
              onClick={() => setNodeId("")}
              className="text-[12px] font-semibold text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              Clear {activeNode.label}
            </button>
          ) : (
            <p className="text-[12px] text-slate-500">Scope: Enterprise Production // US-East</p>
          )}
        </div>

        {tab === "pipeline" ? (
          <div className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-4">
              {PIPELINE_LAYERS.map((layer) => (
                <div key={layer.id}>
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{layer.label}</p>
                  <div className="mt-2 space-y-2">
                    {layer.nodes.map((node) => {
                      const selected = nodeId === node.id
                      const count = issuesForNode(node.id).length
                      return (
                        <button
                          key={node.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectNode(node.id)}
                          className={`w-full rounded-xl border px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                            selected
                              ? "border-[#6d5cff] bg-[#f3f1ff]"
                              : "border-slate-200 bg-white hover:border-[#6d5cff]/40 hover:bg-slate-50"
                          }`}
                        >
                          <span className="block text-[13px] font-semibold text-slate-900">{node.label}</span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            {node.detail} · {count} {count === 1 ? "rule" : "rules"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            {focus ? (
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Schema mutation</p>
                    <p className="mt-1 text-[14px] font-semibold text-slate-900">{focus.failureClass}</p>
                    <p className="mt-0.5 text-[12px] text-slate-600">{focus.lineage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenIssue(focus)}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                  >
                    Open AI agent
                  </button>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{focus.rootCause}</p>
                <SchemaDiff panels={focus.panels} branch={focus.branch} />
              </div>
            ) : (
              <p className="text-[13px] text-slate-500">No detection rules are bound to this pipeline node.</p>
            )}
          </div>
        ) : null}

        {tab === "rules" ? (
          <div className="space-y-3 p-4">
            {issues.map((issue) => (
              <article key={issue.id} className="rounded-xl border border-slate-200 p-3">
                <button
                  type="button"
                  onClick={() => onOpenIssue(issue)}
                  className="w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_TONE[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <span className="text-[12px] font-semibold text-[#4c3fd4]">{issue.failureClass}</span>
                    <span className="text-[12px] text-slate-500">{issue.technique}</span>
                  </div>
                  <h3 className="mt-1 text-[14px] font-semibold text-slate-900">{issue.title}</h3>
                  <p className="mt-1 text-[12px] text-slate-600">{issue.lineage}</p>
                  <p className="mt-1 text-[12px] text-slate-700">{issue.impact}</p>
                  <p className="mt-1 text-[12px] font-medium text-slate-800">Hotfix: {issue.fixSummary}</p>
                </button>
                <SchemaDiff panels={issue.panels} branch={issue.branch} />
              </article>
            ))}
            {issues.length === 0 ? (
              <p className="text-[13px] text-slate-500">No detection rules are bound to this pipeline node.</p>
            ) : null}
          </div>
        ) : null}

        {tab === "backtest" ? (
          <div className="space-y-3 p-4">
            <p className="text-[13px] text-slate-600">
              Replay each hotfix against the last 30 days before a Detection-as-Code pull request is opened.
            </p>
            {issues.map((issue) => (
              <div key={issue.id}>
                <button
                  type="button"
                  onClick={() => onOpenIssue(issue)}
                  className="mb-2 text-left text-[13px] font-semibold text-[#4c3fd4] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                >
                  {issue.failureClass}
                </button>
                <BacktestPanel metrics={issue.backtest} title={issue.technique} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
