import { useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"

export default function BacktestPanel({ title, buttonLabel = "Run 30-Day Historical Replay" }) {
  const [phase, setPhase] = useState("idle")
  const timer = useRef(null)

  useEffect(() => {
    setPhase("idle")
    return () => window.clearTimeout(timer.current)
  }, [title])

  function run() {
    window.clearTimeout(timer.current)
    setPhase("running")
    timer.current = window.setTimeout(() => setPhase("done"), 1100)
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">30-day historical replay</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {title ? `${title} · ` : ""}30-day historical replay
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={phase === "running"}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#6d5cff] px-3 text-[12px] font-semibold text-white outline-none hover:bg-[#5b4cf0] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {phase === "running" ? "Replaying…" : buttonLabel}
        </button>
      </div>
      {phase === "idle" ? (
        <p className="mt-3 text-[12px] text-slate-500">
          Replay the repaired query against 30 days of historical telemetry before opening the hotfix.
        </p>
      ) : null}
      {phase === "running" ? (
        <div className="mt-3 space-y-2" role="status" aria-live="polite">
          <p className="text-[12px] font-medium text-slate-600">Replaying query against 30 days of historical telemetry…</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#6d5cff]" />
          </div>
        </div>
      ) : null}
      {phase === "done" ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["True Positive Recall", "100%"],
            ["Noise Reduction", "−74%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
              <dd className="mt-1 text-[18px] font-semibold tracking-tight text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
