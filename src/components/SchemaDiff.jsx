export default function SchemaDiff({ panels }) {
  if (!panels?.length) return null
  return (
    <div className="mt-2 grid gap-3 lg:grid-cols-2">
      {panels.map((panel) => {
        const repaired = /repaired/i.test(panel.title)
        return (
          <section key={panel.title} className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{panel.title}</h3>
            <pre
              className={`mt-2 max-h-80 overflow-auto rounded-xl px-3 py-2.5 font-mono text-[11px] leading-relaxed ${
                repaired ? "bg-[#052e16] text-emerald-100" : "bg-[#0f172a] text-rose-100"
              }`}
            >
              {panel.code}
            </pre>
          </section>
        )
      })}
    </div>
  )
}
