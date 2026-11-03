import { useState } from "react"
import { DETECTION_ISSUES, issuesForTopology } from "../detection"
import BacktestPanel from "./BacktestPanel"
import MatchVolumeChart from "./MatchVolumeChart"
import PipelineFlow from "./PipelineFlow"
import SchemaDiff from "./SchemaDiff"

const VIEWS = [
  { id: "schema", label: "Parser & Schema Drift" },
  { id: "rules", label: "Detection Rule Health" },
  { id: "backtest", label: "AI Agent Backtesting" },
]

const SEVERITY = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-amber-50 text-amber-800 border-amber-200",
  Medium: "bg-slate-50 text-slate-700 border-slate-200",
}

const VOLUME = {
  Critical: "text-red-700",
  High: "text-amber-800",
  Medium: "text-slate-800",
}

const NODE_LABEL = {
  telemetry: "Telemetry Sources",
  pipeline: "Cribl Stream v2.4",
  siem: "Microsoft Sentinel / Snowflake",
  soar: "Torq SOAR",
}

export default function DetectionControlPlane({ onOpenIssue }) {
  const [view, setView] = useState("schema")
  const [nodeId, setNodeId] = useState("")
  const [selectedId, setSelectedId] = useState("schema-drift")
  const issues = DETECTION_ISSUES
  const downstream = nodeId ? new Set(issuesForTopology(nodeId).map((issue) => issue.id)) : null
  const selected = issues.find((issue) => issue.id === selectedId) ?? issues[0]
  const silent = issues.filter((issue) => issue.volume === "0%")

  return (
    <div className="space-y-3">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-slate-400">Since Falcon v7.14 · 14:10 UTC</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">
            Coverage is 84.2
            <span className="ml-2 font-mono text-[15px] font-medium text-red-700">−3.4</span>
          </h2>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-slate-600">
            {silent.length === 0
              ? "No rule is at zero match volume. "
              : silent.length === 1
                ? "One rule matches nothing. "
                : `${silent.length} rules match nothing. `}
            Two hotfixes are blocked on Detection Engineering Lead. Ship nothing that has not held a 30-day replay.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200/80 shadow-sm">
          {[
            ["Parsers", "3", "degraded"],
            ["Blind", "4", "techniques"],
            ["PRs", "2", "waiting"],
          ].map(([label, value, note]) => (
            <div key={label} className="bg-white px-4 py-2.5">
              <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
              <dd className="font-mono text-[18px] font-semibold leading-none text-slate-900">{value}</dd>
              <dd className="mt-1 text-[11px] text-slate-500">{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{VIEWS.find((item) => item.id === view)?.label}</h3>
            <p className="text-[12px] text-slate-500">
              {nodeId
                ? `${downstream?.size ?? 0} ${(downstream?.size ?? 0) === 1 ? "rule" : "rules"} downstream of ${NODE_LABEL[nodeId] ?? "this hop"}`
                : `${issues.length} rules on the production data plane`}
            </p>
          </div>
          <div role="tablist" aria-label="Contract views" className="flex gap-4">
            {VIEWS.map((item) => {
              const selected = view === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setView(item.id)}
                  className={`border-b-2 pb-1 text-[12.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    selected ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        {view === "schema" ? (
          <div className="space-y-4 p-4">
            <PipelineFlow nodeId={nodeId} onSelect={(id) => setNodeId((current) => idSafe(current, id))} />
            <IssueTable
              issues={issues}
              downstream={downstream}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpenIssue={onOpenIssue}
            />
            {issues.map((issue) => {
              const marked = downstream?.has(issue.id)
              return (
                <article
                  key={issue.id}
                  className={`rounded-xl border ${marked ? "border-amber-300 bg-amber-50/40" : "border-slate-200"} ${downstream && !marked ? "opacity-40" : ""}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-3 py-3">
                    <div>
                      <p className="font-mono text-[11px] text-slate-400">{issue.technique}</p>
                      <h4 className="mt-0.5 text-[14px] font-semibold text-slate-900">{issue.contract}</h4>
                      <p className="mt-1 text-[13px] text-slate-600">{issue.rootCause}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenIssue(issue)}
                      className="text-[12px] font-semibold text-indigo-700 outline-none hover:underline"
                    >
                      Open in agent
                    </button>
                  </div>
                  <div className="p-3">
                    <SchemaDiff panels={issue.panels} branch={issue.branch} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}

        {view === "rules" ? (
          <div className="space-y-4 p-4">
            <MatchVolumeChart issue={selected} />
            <IssueTable
              issues={issues}
              downstream={downstream}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpenIssue={onOpenIssue}
            />
          </div>
        ) : null}

        {view === "backtest" ? (
          <div className="space-y-4 p-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[13px] font-semibold text-slate-900">Ship gate</p>
              <ul className="mt-2 space-y-1 text-[12.5px] text-slate-600">
                <li>Replay the repaired query on the last 30 days before a pull request opens.</li>
                <li>True positive recall must hold. Noise must fall.</li>
                <li>Detection Engineering Lead is a required reviewer. Auto-merge stays off.</li>
              </ul>
            </div>
            {issues.map((issue) => (
              <div key={issue.id}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenIssue(issue)}
                    className="text-left text-[13px] font-semibold text-slate-900 outline-none hover:text-indigo-700"
                  >
                    {issue.title}
                  </button>
                  <span className="font-mono text-[11px] text-slate-400">{issue.branch}</span>
                </div>
                <BacktestPanel title={`${issue.owner} · ${issue.age}`} />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function IssueTable({ issues, downstream, selectedId, onSelect, onOpenIssue }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[980px] text-left">
        <thead>
          <tr className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2 font-medium">Detection</th>
            <th className="px-4 py-2 font-medium">Volume</th>
            <th className="px-4 py-2 font-medium">Broken contract</th>
            <th className="px-4 py-2 font-medium">Age</th>
            <th className="px-4 py-2 font-medium">Owner</th>
            <th className="px-4 py-2 text-right font-medium"> </th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const marked = downstream?.has(issue.id)
            const picked = issue.id === selectedId
            return (
              <tr
                key={issue.id}
                onClick={() => onSelect(issue.id)}
                aria-selected={picked}
                className={`cursor-pointer border-t border-slate-100 ${
                  picked ? "bg-indigo-50/70" : marked ? "bg-amber-50/80" : "hover:bg-slate-50/80"
                } ${downstream && !marked ? "opacity-40" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITY[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{issue.technique}</span>
                    {marked ? (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Downstream
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">{issue.title}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">{issue.failureClass}</p>
                </td>
                <td className="px-4 py-3">
                  <p className={`font-mono text-[16px] font-semibold leading-none ${VOLUME[issue.priority]}`}>{issue.volume}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{issue.volumeNote}</p>
                </td>
                <td className="max-w-[280px] px-4 py-3">
                  <p className="font-mono text-[12px] text-slate-800">{issue.contract}</p>
                  <p className="mt-1 text-[12px] leading-snug text-slate-500">{issue.rootCause}</p>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-slate-700">{issue.age}</td>
                <td className="px-4 py-3 text-[12.5px] text-slate-700">{issue.owner}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenIssue(issue)
                    }}
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-[12px] font-semibold text-white outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    Review hotfix
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {issues.length === 0 ? (
        <p className="px-4 py-8 text-[13px] text-slate-500">Nothing on this hop is breaking a detection.</p>
      ) : null}
    </div>
  )
}

function idSafe(current, id) {
  return current === id ? "" : id
}
