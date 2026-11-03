import { useState } from "react"

const DAYS = ["Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 1", "Nov 2", "Nov 3"]

const SERIES = {
  "schema-drift": {
    unit: "matches/hr",
    expected: [1820, 1760, 1790, 1810, 1770, 1800, 1780],
    actual: [1790, 1810, 1740, 1800, 1760, 1680, 0],
    note: "Expected baseline held near 1.8k/hr. Production match volume fell to zero after Falcon v7.14. The rule is still deployed.",
  },
  "lookup-drift": {
    unit: "alerts/hr",
    expected: [40, 42, 38, 44, 41, 43, 42],
    actual: [44, 48, 51, 62, 88, 120, 142],
    note: "Baseline is about 42 alerts/hr. Production climbed to 142/hr after the Cloudflare WARP egress was left out of the lookup.",
  },
  "payload-mismatch": {
    unit: "matches/hr",
    expected: [26, 24, 28, 25, 27, 24, 26],
    actual: [25, 27, 24, 26, 28, 23, 25],
    note: "The rule still matches. The blind spot is downstream: isolate-host rejects the payload because DeviceId was dropped.",
  },
  "ingestion-lag": {
    unit: "events/hr",
    expected: [110, 108, 112, 109, 111, 107, 110],
    actual: [108, 104, 96, 70, 40, 18, 12],
    note: "CloudTrail is still produced. What lands in Snowflake is hours late, so the rule evaluates a stale stream.",
  },
}

const W = 640
const H = 228
const PAD = { l: 46, r: 16, t: 18, b: 32 }

function formatCount(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

export default function MatchVolumeChart({ issue }) {
  const [hover, setHover] = useState(null)
  const series = issue ? SERIES[issue.id] : null

  if (!issue || !series) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-[13px] text-slate-500">
        Select a detection to compare baseline and production match volume.
      </div>
    )
  }

  const max = Math.max(...series.expected, ...series.actual, 1)
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const xAt = (index) => PAD.l + (index / (DAYS.length - 1)) * innerW
  const yAt = (value) => PAD.t + (1 - value / max) * innerH
  const expectedLine = series.expected.map((value, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`).join(" ")
  const actualLine = series.actual.map((value, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`).join(" ")
  const actualArea = `${actualLine} L ${xAt(DAYS.length - 1).toFixed(1)} ${yAt(0).toFixed(1)} L ${xAt(0).toFixed(1)} ${yAt(0).toFixed(1)} Z`
  const silent = series.actual.map((value, index) => (value === 0 ? index : -1)).filter((index) => index >= 0)
  const ticks = [0, Math.round(max / 2), max]

  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * W
    let nearest = 0
    let best = Infinity
    for (let index = 0; index < DAYS.length; index += 1) {
      const distance = Math.abs(xAt(index) - px)
      if (distance < best) {
        best = distance
        nearest = index
      }
    }
    setHover(nearest)
  }

  return (
    <figure className="rounded-xl border border-slate-200 bg-white">
      <figcaption className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">Match volume · 7 days</p>
          <p className="mt-0.5 text-[13px] font-semibold text-slate-900">{issue.title}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-slate-400" /> Expected baseline</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-indigo-500/80" /> Actual production</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Silent</span>
        </div>
      </figcaption>
      <div className="px-2 pt-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${issue.title} expected versus actual ${series.unit} for seven days`}
          onMouseMove={move}
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yAt(tick)} y2={yAt(tick)} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={PAD.l - 8} y={yAt(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize="10">
                {formatCount(tick)}
              </text>
            </g>
          ))}
          {silent.map((index) => (
            <rect
              key={DAYS[index]}
              x={xAt(index) - innerW / (DAYS.length - 1) / 2}
              y={PAD.t}
              width={innerW / (DAYS.length - 1)}
              height={innerH}
              fill="#fecaca"
              opacity="0.45"
            />
          ))}
          <path d={expectedLine} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d={actualArea} fill="#6366f1" opacity="0.16" />
          <path d={actualLine} fill="none" stroke="#4f46e5" strokeWidth="2" />
          {series.actual.map((value, index) => (
            <circle
              key={DAYS[index]}
              cx={xAt(index)}
              cy={yAt(value)}
              r={value === 0 ? 4.5 : 2.5}
              fill={value === 0 ? "#dc2626" : "#4f46e5"}
            />
          ))}
          {hover !== null ? (
            <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.t} y2={PAD.t + innerH} stroke="#6366f1" strokeDasharray="2 2" />
          ) : null}
          {DAYS.map((day, index) => (
            <text key={day} x={xAt(index)} y={H - 10} textAnchor="middle" fill="#94a3b8" fontSize="10">
              {day}
            </text>
          ))}
        </svg>
      </div>
      {hover !== null ? (
        <p className="px-4 pb-1 font-mono text-[12px] text-slate-700">
          {DAYS[hover]} · expected {formatCount(series.expected[hover])} · actual {formatCount(series.actual[hover])} {series.unit}
        </p>
      ) : null}
      <p className="px-4 pb-3 text-[12.5px] leading-relaxed text-slate-600">{series.note}</p>
      <table className="sr-only">
        <caption>{issue.title} match volume</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Expected</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, index) => (
            <tr key={day}>
              <td>{day}</td>
              <td>{series.expected[index]}</td>
              <td>{series.actual[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
