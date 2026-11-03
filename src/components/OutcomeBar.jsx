const PARTS = [
  { key: "Succeeded", field: "succeeded", fill: "#6d5cff" },
  { key: "Rolled back", field: "rolledBack", fill: "#A99BFF" },
  { key: "Escalated", field: "escalated", fill: "#94A3B8" },
]

export default function OutcomeBar({ succeeded = 0, rolledBack = 0, escalated = 0 }) {
  const values = { succeeded, rolledBack, escalated }
  const total = succeeded + rolledBack + escalated
  const parts = PARTS.map((part) => ({ ...part, n: values[part.field] })).filter((part) => part.n > 0)

  return (
    <div>
      <div
        className="flex h-2.5 gap-1"
        role="img"
        aria-label={`${succeeded} succeeded, ${rolledBack} rolled back, ${escalated} escalated`}
      >
        {total === 0 ? (
          <span className="h-full w-full rounded-full bg-[#EEF0F6]" />
        ) : (
          parts.map((part) => (
            <span
              key={part.key}
              className="h-full min-w-1 rounded-full"
              style={{ width: `${(part.n / total) * 100}%`, background: part.fill }}
              title={`${part.key}: ${part.n}`}
            />
          ))
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        {PARTS.map((part) => {
          const n = values[part.field]
          const pct = total ? Math.round((n / total) * 100) : 0
          return (
            <li key={part.key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: part.fill }} aria-hidden="true" />
              <span>{part.key}</span>
              <span className="font-semibold tabular-nums text-slate-700">
                {n}
                {total ? ` · ${pct}%` : ""}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
