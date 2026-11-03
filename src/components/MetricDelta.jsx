export default function MetricDelta({ pts, unit = "pts", label = "vs. prior 7 days", improveOnDown = false }) {
  const up = pts >= 0
  const good = improveOnDown ? pts <= 0 : pts >= 0
  const amount =
    unit === "m" ? `${Math.abs(pts)}m` : `${Math.abs(pts)} ${Math.abs(pts) === 1 ? "pt" : "pts"}`
  return (
    <span className={`inline-flex items-center text-[12px] font-semibold ${good ? "text-emerald-700" : "text-rose-700"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="ml-1">
        {amount} {label}
      </span>
    </span>
  )
}
