import CopyQueryButton from "./CopyQueryButton"

export default function SchemaDiff({ panels, branch = "fix/schema-coalesce-t1059" }) {
  if (!panels?.length) return null
  return (
    <div className="mt-2">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-100">{branch}</span>
        <span className="rounded-full bg-[#f3f1ff] px-2 py-1 text-[11px] font-semibold text-[#4c3fd4]">
          Required Reviewer: Detection Engineering Lead
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {panels.map((panel) => {
          const repaired = /repaired/i.test(panel.title)
          return (
            <section key={panel.title} className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{panel.title}</h3>
                <CopyQueryButton text={panel.code} />
              </div>
              <pre
                className={`mt-2 max-h-80 overflow-auto rounded-xl bg-slate-900 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-slate-100 ${
                  repaired ? "ring-1 ring-emerald-400/40" : "ring-1 ring-rose-400/30"
                }`}
              >
                {panel.code}
              </pre>
            </section>
          )
        })}
      </div>
    </div>
  )
}
