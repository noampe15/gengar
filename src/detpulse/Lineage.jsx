import { EDGES, NODE_H, NODE_W, NODES, RULES, litNodeIds } from "./model"
import { usePulse } from "./PulseContext"
import { Card } from "./ui"

const FILL = {
  healthy: { fill: "#f0fdf4", stroke: "#86efac", ink: "#166534" },
  degraded: { fill: "#fffbeb", stroke: "#fcd34d", ink: "#92400e" },
  critical: { fill: "#fef2f2", stroke: "#fca5a5", ink: "#991b1b" },
}

function center(node, side) {
  const y = node.y + NODE_H / 2
  return side === "right" ? { x: node.x + NODE_W, y } : { x: node.x, y }
}

export default function Lineage() {
  const { nodeId, dispatch, patched } = usePulse()
  const lit = litNodeIds(nodeId)
  const byId = Object.fromEntries(NODES.map((node) => [node.id, node]))
  const stages = []
  for (const node of NODES) {
    if (!stages.some((stage) => stage === node.stage)) stages.push(node.stage)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold text-slate-900">Live Data-to-Detection Supply Chain</h2>
          <p className="text-[12px] text-slate-500">Click a hop to trace the path and filter the urgent queue.</p>
        </div>
        {nodeId ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "clear-node" })}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
          >
            Clear Filter
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
        <svg viewBox="0 0 1020 348" className="h-auto min-w-[960px] w-full" role="group" aria-label="Telemetry supply chain">
          {stages.map((stage) => {
            const first = NODES.find((node) => node.stage === stage)
            return (
              <text key={stage} x={first.x} y={28} fill="#94a3b8" fontSize="11" fontWeight="600">
                {stage.toUpperCase()}
              </text>
            )
          })}
          {EDGES.map(([fromId, toId]) => {
            const from = byId[fromId]
            const to = byId[toId]
            const start = center(from, "right")
            const end = center(to, "left")
            const hot = !lit || (lit.has(fromId) && lit.has(toId))
            const bend = (end.x - start.x) / 2
            return (
              <path
                key={`${fromId}-${toId}`}
                d={`M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`}
                fill="none"
                stroke={hot && lit ? "#4f46e5" : "#cbd5e1"}
                strokeWidth={hot && lit ? 2 : 1.4}
                opacity={hot ? 1 : 0.25}
              />
            )
          })}
          {NODES.map((node) => {
            const live = liveNode(node, patched)
            const palette = FILL[live.tone]
            const selected = nodeId === node.id
            const hot = !lit || lit.has(node.id)
            const badge = live.badge
            return (
              <g key={node.id} opacity={hot ? 1 : 0.28} className="cursor-pointer" onClick={() => dispatch({ type: "node", id: node.id })}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="12"
                  fill={palette.fill}
                  stroke={selected ? "#4f46e5" : palette.stroke}
                  strokeWidth={selected ? 2.4 : 1.4}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={`${node.title}, ${badge}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      dispatch({ type: "node", id: node.id })
                    }
                  }}
                />
                <text x={node.x + 12} y={node.y + 26} fill="#0f172a" fontSize={node.title.length > 28 ? 10 : 11} fontWeight="600">
                  {node.title}
                </text>
                <text x={node.x + 12} y={node.y + 46} fill={palette.ink} fontSize="10.5" fontWeight="600">
                  {badge}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}

function liveNode(node, patched) {
  const open = RULES.filter((rule) => rule.degraded && !patched[rule.id] && rule.nodes.includes(node.id))
  if (open.length === 0) return { tone: "healthy", badge: "Healthy" }
  return { tone: node.tone, badge: node.badge }
}

