import { STACK_STAGES } from "../detection"

export default function StackPipeline({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">SecOps stack</p>
      <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center">
        {STACK_STAGES.map((stage, index) => {
          const active = value === stage
          return (
            <div key={stage} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? "" : stage)}
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-left text-[12.5px] font-semibold leading-snug outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
                  active
                    ? "border-[#6d5cff] bg-[#f3f1ff] text-[#4c3fd4]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {stage}
              </button>
              {index < STACK_STAGES.length - 1 ? (
                <span className="hidden shrink-0 text-slate-300 lg:inline" aria-hidden="true">
                  →
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
