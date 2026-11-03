import MetricDelta from "./MetricDelta"

function Cell({ label, children, footer, className = "" }) {
  return (
    <div className={`col-span-1 row-span-3 grid min-w-0 grid-rows-subgrid border-l border-slate-100 px-3.5 py-3.5 first:border-l-0 lg:px-4 ${className}`}>
      <p className="text-[12px] font-medium leading-snug text-slate-600">{label}</p>
      <div className="flex min-w-0 items-start gap-2">{children}</div>
      <div className="flex min-h-[1.25rem] items-start">{footer}</div>
    </div>
  )
}

export default function TenantSummaryStrip({ summary }) {
  const empty = summary.open === 0
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="grid grid-cols-5 grid-rows-[auto_auto_auto]">
        <Cell
          label="Open issues"
          footer={<p className="text-[12px] font-medium leading-snug text-slate-600">{empty ? "All clear" : `${summary.critical} Critical · ${summary.high} High · ${summary.medium} Medium`}</p>}
        >
          <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.open}</p>
        </Cell>
        <Cell
          label="Waiting on human"
          footer={<p className="text-[12px] font-medium leading-snug text-amber-800">{empty ? "None waiting" : `Oldest waiting ${summary.oldestWait}`}</p>}
        >
          <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.waiting}</p>
        </Cell>
        <Cell
          label="AI fixing now"
          footer={<p className="text-[12px] font-medium leading-snug text-[#5b4cf0]">{empty ? "Idle" : `${summary.blocked} Blocked, needs access`}</p>}
        >
          <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.aiFixing}</p>
        </Cell>
        <Cell
          label="Mean time to acknowledge"
          footer={summary.mttaDeltaMin ? <MetricDelta pts={summary.mttaDeltaMin} unit="m" label={summary.priorLabel} improveOnDown /> : null}
        >
          <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.mtta}</p>
        </Cell>
        <Cell
          label="Mean time to resolve"
          footer={summary.mttrDeltaMin ? <MetricDelta pts={summary.mttrDeltaMin} unit="m" label={summary.priorLabel} improveOnDown /> : null}
        >
          {empty ? (
            <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">—</p>
          ) : (
            <div className="grid w-full min-w-0 grid-cols-2 gap-x-2">
              <div>
                <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.mttrAi}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-600">AI</p>
              </div>
              <div>
                <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{summary.mttrHuman}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-600">Human</p>
              </div>
            </div>
          )}
        </Cell>
      </div>
    </section>
  )
}
