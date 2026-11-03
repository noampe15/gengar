export default function MetricTile({ label, value, hint, hintClass = "text-slate-600", children, valueAddon }) {
  const showValue = value !== "" && value != null
  return (
    <div className="grid min-w-0 grid-rows-[auto_minmax(2.25rem,auto)_minmax(2.5rem,auto)] gap-1.5 px-3.5 py-3.5 lg:px-4">
      <p className="min-h-[2.4rem] text-[12px] font-medium leading-snug text-slate-600">{label}</p>
      <div className="flex min-h-[2.25rem] items-end gap-2">
        {showValue ? (
          <p className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
        ) : null}
        {valueAddon}
      </div>
      <div className="flex min-h-[2.5rem] flex-col justify-start gap-0.5">
        {hint ? <p className={`text-[12px] font-medium leading-snug ${hintClass}`}>{hint}</p> : null}
        {children}
      </div>
    </div>
  )
}
