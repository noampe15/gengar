import { useId } from "react"
import { areaPath, seriesPoints, smoothPath } from "./ui"

const DRIFT_DAYS = ["Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 1", "Nov 2", "Nov 3"]
const DRIFT_NOTES = [null, null, null, null, "Nov 1 · WARP Cutover", "Nov 2 · AWS IAM", "Nov 3 · Falcon v7.14"]

const EVENTS = [
  { id: "falcon", name: "Falcon v7.14 Upgrade", domain: "Endpoint", impact: "4 Rules Blind", impactClass: "text-red-600" },
  { id: "warp", name: "Cloudflare WARP Cutover", domain: "Identity", impact: "+340% Noise", impactClass: "text-amber-600" },
  { id: "iam", name: "AWS IAM Role Rotation", domain: "Cloud", impact: "4.5h Ingestion Lag", impactClass: "text-orange-600" },
]

const NOISE_DAYS = [
  { day: "Oct 30", raw: 1680, suppressed: 1180 },
  { day: "Oct 31", raw: 2140, suppressed: 1620 },
  { day: "Nov 1", raw: 1920, suppressed: 1420 },
  { day: "Nov 2", raw: 2280, suppressed: 1680 },
  { day: "Nov 3", raw: 1580, suppressed: 1200 },
]

const RAIL = [
  ...Array.from({ length: 11 }, () => "bg-indigo-600"),
  ...Array.from({ length: 3 }, () => "bg-amber-400"),
  ...Array.from({ length: 2 }, () => "bg-red-500"),
]

export default function Overview() {
  return (
    <div className="@container flex h-full min-h-0 flex-col overflow-y-auto bg-white px-8 pt-6 pb-5">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[#0B132B]">Command Center</h1>
        <p className="mt-1 text-sm text-slate-500">Environment posture, signal fidelity, and governance at a glance.</p>
      </div>
      <div className="mt-4 grid min-h-[176px] flex-[2] grid-cols-1 gap-5 @min-[980px]:grid-cols-4">
        <article className="flex h-full min-h-[176px] min-w-0 flex-col justify-between rounded-2xl border border-slate-200/50 bg-[#F4F7FB] p-5">
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <h2 className="text-xs font-bold whitespace-nowrap text-slate-700">Environment Resilience</h2>
            <span className="shrink-0 rounded-full border border-red-200/60 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">↓ 9.4 pts</span>
          </div>
          <div className="my-auto flex flex-col justify-center py-3">
            <p>
              <span className="inline-block font-mono text-3xl font-bold text-[#0B132B]">81.2</span>
              <span className="ml-1.5 font-mono text-sm text-slate-400">/ 100</span>
            </p>
            <div className="mt-2 flex h-2 gap-1" role="img" aria-label="11 healthy, 3 degraded, 2 blind segments">
              {RAIL.map((tone, index) => (
                <span key={index} className={`h-full min-w-0 flex-1 rounded-sm ${tone}`} />
              ))}
            </div>
          </div>
          <p className="truncate border-t border-slate-200/50 pt-2 text-[11px] whitespace-nowrap text-slate-500">168 Verified • 7 Deg • 5 Zero</p>
        </article>

        <RibbonCard
          label="Telemetry Estate"
          pill="2.8 TB / day"
          pillClass="border-slate-200/60 bg-white font-mono text-slate-600"
          value="87%"
          note="Healthy"
          noteClass="text-emerald-600"
          bar="87%"
          barClass="bg-emerald-500"
          footer="17 of 20 enterprise streams active"
        />
        <RibbonCard
          label="Threat Surface"
          pill="+3 Ready (AI)"
          pillClass="border-indigo-200/60 bg-indigo-50 font-semibold text-indigo-700"
          value="69%"
          note="Covered"
          noteClass="text-slate-500"
          bar="69%"
          barClass="bg-indigo-600"
          footer="198 active rules • 89 uncovered gaps"
        />
        <RibbonCard
          label="Signal-to-Noise"
          pill="-68% Noise"
          pillClass="border-emerald-200/60 bg-emerald-50 font-bold text-emerald-700"
          value="83%"
          note="Precision"
          noteClass="text-amber-600"
          bar="83%"
          barClass="bg-amber-400"
          footer="1,310 noisy alerts suppressed/day"
        />
      </div>

      <div className="mt-5 grid min-h-0 flex-[5] grid-cols-1 items-stretch gap-6 @min-[980px]:grid-cols-3">
        <article className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#0B132B]">Environment Shifts (7d)</h2>
            <span className="shrink-0 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">18/20 Streams Stable • 12% Drifted</span>
          </div>
          <DriftChart />
          <div className="mt-2 space-y-2">
            {EVENTS.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white p-2.5 text-xs">
                <span className="min-w-0 truncate font-medium text-slate-800">{event.name} <span className="font-normal text-slate-400">• {event.domain}</span></span>
                <span className={`shrink-0 font-semibold ${event.impactClass}`}>{event.impact}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#0B132B]">Signal Fidelity & Noise</h2>
            <span className="shrink-0 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">-74% Noise</span>
          </div>
          <NoiseHistogram />
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-2">
            <div className="rounded-xl border border-slate-200/60 bg-white p-2 text-center">
              <span className="font-mono text-sm font-bold text-emerald-600">-1,420</span>
              <span className="block text-[10px] text-slate-400">Alerts Cut/d</span>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-2 text-center">
              <span className="font-mono text-sm font-bold text-indigo-600">100%</span>
              <span className="block text-[10px] text-slate-400">TP Recall</span>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-2 text-center">
              <span className="font-mono text-sm font-bold text-slate-800">98.4%</span>
              <span className="block text-[10px] text-slate-400">Precision</span>
            </div>
          </div>
        </article>

        <article className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200/50 bg-[#F4F7FB] p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="min-w-0 text-sm font-bold text-[#0B132B]">Human-in-the-Loop Governance</h2>
            <span className="shrink-0 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-emerald-700">▲ 3.4 pts (7d)</span>
          </div>
          <ReplayRing />
          <div className="my-2.5 rounded-2xl border border-slate-200/60 bg-white p-3.5">
            <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-3 text-left">
              {[
                ["Attempted", "142"],
                ["Succeeded", "130"],
                ["Escalated", "12"],
                ["Failed", "0"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[#0B132B]">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3">
              <p className="text-[11px] text-slate-500">Analyst hours saved (7d)</p>
              <p className="font-mono text-sm font-bold text-emerald-700">41.6 hrs</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

const DRIFT_MARKS = {
  4: { fill: "#f59e0b", ring: "#fffbeb" },
  5: { fill: "#f97316", ring: "#fff7ed" },
  6: { fill: "#ef4444", ring: "#fef2f2" },
}

function DriftChart() {
  const rawId = useId().replace(/:/g, "")
  const width = 320
  const height = 120
  const values = [8, 10, 12, 16, 42, 68, 96]
  const points = seriesPoints(values, width, height, { t: 16, r: 16, b: 10, l: 16 }, { min: 0, max: 100 })
  const line = smoothPath(points)
  const fill = areaPath(points, height - 6)
  return (
    <div className="my-2 flex min-h-[90px] flex-1 flex-col rounded-2xl border border-slate-200/60 bg-white px-3 pt-3 pb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="relative min-h-0 flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="7-day drift curve, low through Oct 30, rising on Nov 1 and peaking on Nov 3">
          <defs>
            <linearGradient id={`drift-fill-${rawId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.28, 0.56, 0.84].map((step) => {
            const y = 16 + step * (height - 26)
            return <line key={step} x1="12" x2={width - 12} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
          })}
          <path d={fill} fill={`url(#drift-fill-${rawId})`} />
          <path d={line} fill="none" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
          <path d={line} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {points.map((point, index) => {
          const mark = DRIFT_MARKS[index]
          if (!mark) return null
          return (
            <span
              key={DRIFT_DAYS[index]}
              title={DRIFT_NOTES[index]}
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
              style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%`, background: mark.fill, boxShadow: `0 0 0 4px ${mark.ring}` }}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
        {DRIFT_DAYS.map((label, index) => (
          <span key={label} className={DRIFT_MARKS[index] ? "font-semibold text-slate-600" : ""}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function NoiseHistogram() {
  const scale = Math.max(...NOISE_DAYS.map((entry) => entry.raw))
  return (
    <div className="my-2 flex min-h-[130px] flex-1 flex-col rounded-2xl border border-slate-200/60 bg-white px-3 pt-3 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500" /> Raw SIEM Alert Storm</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500" /> AI-Suppressed Volume</span>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 gap-1.5">
          <div className="relative w-9 shrink-0 font-mono text-[9px] text-slate-400">
            <span className="absolute top-0 right-0">{scale.toLocaleString()}</span>
            <span className="absolute right-0 bottom-0">0</span>
          </div>
          <div className="flex min-h-0 flex-1 items-end justify-between gap-1">
            {NOISE_DAYS.map((entry, index) => {
              const share = Math.round((entry.suppressed / entry.raw) * 100)
              return (
                <div key={entry.day} className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-1 rounded-xl bg-slate-50/80 px-0.5">
                  <span className={`pointer-events-none absolute bottom-[calc(100%-8px)] z-10 hidden rounded-lg bg-[#0B132B] px-2.5 py-1.5 text-[10px] leading-snug whitespace-nowrap text-white shadow-lg group-hover:block ${index === 0 ? "left-0" : index === NOISE_DAYS.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
                    <span className="block font-semibold">{entry.day}</span>
                    <span className="block text-amber-200">Raw {entry.raw.toLocaleString()}</span>
                    <span className="block text-emerald-200">Suppressed {entry.suppressed.toLocaleString()}</span>
                    <span className="block text-white/70">{share}% of raw volume</span>
                  </span>
                  <div className="w-2.5 rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_6px_12px_-6px_rgba(245,158,11,0.8)] sm:w-3" style={{ height: `${(entry.raw / scale) * 100}%` }} />
                  <div className="w-2.5 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_6px_12px_-6px_rgba(16,185,129,0.8)] sm:w-3" style={{ height: `${(entry.suppressed / scale) * 100}%` }} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-1.5 ml-10 flex justify-between gap-1 font-mono text-[10px] text-slate-400">
          {NOISE_DAYS.map((entry) => <span key={entry.day} className="flex-1 text-center">{entry.day}</span>)}
        </div>
      </div>
    </div>
  )
}

function ReplayRing() {
  const radius = 34
  const length = 2 * Math.PI * radius
  const gap = 10
  const succeeded = length * (130 / 142) - gap
  const escalated = length * (12 / 142) - gap
  return (
    <div className="my-1 flex min-h-[110px] flex-1 flex-col items-center justify-center">
      <div className="relative aspect-square h-full max-h-64">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-sm" role="img" aria-label="91.5 percent auto-closed. 130 succeeded, 12 escalated for human-in-the-loop review">
          <circle cx="50" cy="50" r={radius} fill="white" stroke="#e8eef5" strokeWidth="11" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#10b981" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${succeeded} ${length}`} />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#4f46e5" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${escalated} ${length}`} strokeDashoffset={-(succeeded + gap)} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <span className="block font-mono text-2xl font-bold text-[#0B132B]">91.5%</span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-wider text-slate-400">AUTO-CLOSED</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />130 Succeeded</span>
        <span className="inline-flex items-center gap-1.5 text-indigo-700"><span className="size-1.5 rounded-full bg-indigo-600" />12 Escalated (HITL)</span>
      </div>
    </div>
  )
}

function RibbonCard({ label, pill, pillClass, value, note, noteClass, bar, barClass, footer }) {
  return (
    <article className="flex h-full min-h-[176px] min-w-0 flex-col justify-between rounded-2xl border border-slate-200/50 bg-[#F4F7FB] p-5">
      <div className="flex items-center justify-between gap-2 whitespace-nowrap">
        <h2 className="text-xs font-bold whitespace-nowrap text-slate-700">{label}</h2>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${pillClass}`}>{pill}</span>
      </div>
      <div className="my-auto flex flex-col justify-center py-3">
        <p>
          <span className="font-mono text-3xl font-bold text-[#0B132B]">{value}</span>
          <span className={`ml-2 text-xs font-medium ${noteClass}`}>{note}</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full ${barClass}`} style={{ width: bar }} />
        </div>
      </div>
      <p className="truncate border-t border-slate-200/50 pt-2 text-[11px] whitespace-nowrap text-slate-500">{footer}</p>
    </article>
  )
}
