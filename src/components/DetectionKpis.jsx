import MetricDelta from "./MetricDelta"

const cards = [
  {
    label: "Detection Resilience Score (DRS)",
    value: "76",
    suffix: "/100",
    delta: -14,
    hint: "in 24h due to silent schema drift",
  },
  {
    label: "Mean Time to Detect Drift (MTTD-D)",
    value: "4m",
    suffix: "",
    hint: "vs. 18d industry baseline",
  },
  {
    label: "Silent MITRE Coverage Gaps",
    value: "4",
    suffix: "",
    hint: "Critical Techniques Blind",
    detail: "T1059.001, T1003.001, T1078, T1078.004",
  },
]

export default function DetectionKpis() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <p className="text-[12px] font-medium leading-snug text-slate-500">{card.label}</p>
          <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-slate-900">
            {card.value}
            {card.suffix ? <span className="text-[16px] font-medium text-slate-400">{card.suffix}</span> : null}
          </p>
          <div className="mt-2">
            {card.delta != null ? (
              <MetricDelta pts={card.delta} label={card.hint} />
            ) : (
              <p className="text-[12px] font-medium text-slate-600">{card.hint}</p>
            )}
          </div>
          {card.detail ? <p className="mt-1 text-[12px] text-slate-500">{card.detail}</p> : null}
        </article>
      ))}
    </section>
  )
}
