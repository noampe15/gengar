import { issuesForTopology } from "../detection"

const FLOW = [
  { id: "telemetry", title: "Telemetry Sources", detail: "EDR / IdP / Cloud" },
  { id: "pipeline", title: "Cribl Stream v2.4", detail: "Parser pack" },
  { id: "siem", title: "Microsoft Sentinel / Snowflake", detail: "Detection engine" },
  { id: "soar", title: "Torq SOAR", detail: "Response" },
]

const TONE = {
  healthy: "border-emerald-300 bg-emerald-50 text-emerald-800",
  degraded: "border-amber-300 bg-amber-50 text-amber-900",
  blind: "border-red-300 bg-red-50 text-red-800",
}

const CHIP = { healthy: "Healthy", degraded: "Degraded", blind: "Blind" }

function toneFor(id) {
  const rows = issuesForTopology(id)
  if (rows.length === 0) return "healthy"
  if (rows.some((row) => row.volume === "0%")) return "blind"
  return "degraded"
}

export default function PipelineFlow({ nodeId, onSelect }) {
  const selectedIndex = FLOW.findIndex((node) => node.id === nodeId)

  return (
    <figure className="rounded-xl border border-slate-200 bg-slate-50">
      <figcaption className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        <span className="font-semibold tracking-wide text-slate-400 uppercase">Pipeline lineage</span>
        <Legend swatch="bg-emerald-500" label="Healthy" />
        <Legend swatch="bg-amber-500" label="Degraded" />
        <Legend swatch="bg-red-500" label="Blind" />
      </figcaption>
      <div className="flex flex-wrap items-center gap-2 p-3" role="group" aria-label="Telemetry pipeline from sources through Cribl, Sentinel, and Torq">
        {FLOW.map((node, index) => {
          const tone = toneFor(node.id)
          const count = issuesForTopology(node.id).length
          const selected = nodeId === node.id
          const hot = selectedIndex >= 0 && index > selectedIndex
          return (
            <div key={node.id} className="flex min-w-[180px] flex-1 items-center gap-2">
              {index > 0 ? (
                <svg viewBox="0 0 28 12" className="h-3 w-7 shrink-0" aria-hidden="true">
                  <line x1="0" y1="6" x2="18" y2="6" stroke={hot || selectedIndex === index - 1 ? "#4f46e5" : "#cbd5e1"} strokeWidth="1.5" />
                  <path d="M16 2 L24 6 L16 10" fill="none" stroke={hot || selectedIndex === index - 1 ? "#4f46e5" : "#94a3b8"} strokeWidth="1.5" />
                </svg>
              ) : null}
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(node.id)}
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${TONE[tone]} ${
                  selected ? "ring-2 ring-indigo-600" : ""
                }`}
              >
                <span className="block text-[13px] font-semibold leading-snug">{node.title}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">{node.detail}</span>
                <span className="mt-1.5 block text-[11px] font-semibold">
                  {CHIP[tone]} · {count} {count === 1 ? "rule" : "rules"}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

function Legend({ swatch, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block size-1.5 rounded-full ${swatch}`} />
      {label}
    </span>
  )
}
