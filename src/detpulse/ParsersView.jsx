import { useState } from "react"
import { SOURCES } from "./model"
import { Card, CodeBlock, StatusPill } from "./ui"

const ROW = {
  broken: "bg-red-50/80",
  drift: "bg-amber-50/40",
  ok: "",
}

export default function ParsersView() {
  const [sourceId, setSourceId] = useState("falcon")
  const [preview, setPreview] = useState(false)
  const source = SOURCES.find((item) => item.id === sourceId) || SOURCES[0]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Parsers & Schema Lineage</h1>
        <p className="text-[13px] text-slate-600">Raw vendor keys, the Cribl transform, and the schema the detection was written against.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="p-2">
          <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-slate-400 uppercase">Log sources & Cribl packs</p>
          <ul className="divide-y divide-slate-100">
            {SOURCES.map((item) => {
              const selected = item.id === source.id
              const broken = item.rows.some((row) => row.state === "broken")
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSourceId(item.id)
                      setPreview(false)
                    }}
                    className={`w-full rounded-lg px-2 py-2.5 text-left ${selected ? "bg-slate-50" : "hover:bg-slate-50"}`}
                  >
                    <span className="block text-[13px] font-semibold text-slate-900">{item.name}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{item.pack}</span>
                    <span className="mt-1.5 inline-flex">
                      <StatusPill tone={broken ? "critical" : item.rows.some((row) => row.state === "drift") ? "degraded" : "healthy"} pulse={broken}>
                        {broken ? "Contract broken" : item.rows.some((row) => row.state === "drift") ? "Drift" : "Mapped"}
                      </StatusPill>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Live Schema Contract Inspector</h2>
              <p className="font-mono text-[11px] text-slate-400">{source.pack}</p>
            </div>
            <button
              type="button"
              onClick={() => setPreview((current) => !current)}
              className="inline-flex h-8 items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-semibold text-indigo-700"
            >
              Generate Cribl Regex / Coalesce Function
            </button>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Raw incoming JSON <span className="text-slate-500">· {source.rawNote}</span></p>
              <CodeBlock className="mt-1.5">{source.rawPreview}</CodeBlock>
            </div>
            {source.impact ? <p className="text-[12.5px] text-slate-600">Downstream impact: {source.impact}</p> : null}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    <th className="px-3 py-2 font-medium">Raw vendor payload key</th>
                    <th className="px-3 py-2 font-medium">Cribl parser transformation</th>
                    <th className="px-3 py-2 font-medium">Target SIEM schema (ASIM / OCSF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {source.rows.map((row) => (
                    <tr key={row.raw} className={ROW[row.state]}>
                      <td className="px-3 py-2.5 font-mono text-[12px] text-slate-900">{row.raw}</td>
                      <td className="px-3 py-2.5 font-mono text-[12px] text-slate-700">
                        {row.transform}
                        {row.note ? <span className="ml-2 text-red-700">{row.note}</span> : null}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] text-slate-900">{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview ? (
              <div>
                <p className="text-[11px] font-medium text-slate-400">Cribl pipeline expression</p>
                <CodeBlock className="mt-1.5">{source.expression}</CodeBlock>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
