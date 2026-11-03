export default function TenantHoverList({ tenants = [], label, onOpenTenant }) {
  const twoCol = tenants.length > 6
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400">
        {tenants.length} {tenants.length === 1 ? "tenant" : "tenants"}
        {label ? ` · ${label}` : ""}
      </p>
      <ul className={`mt-2 max-h-56 overflow-auto ${twoCol ? "grid grid-cols-2 gap-x-3 gap-y-1.5" : "space-y-1"}`}>
        {tenants.map((tenant) => (
          <li key={tenant.id}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenTenant?.(tenant.id)
              }}
              aria-label={`Open ${tenant.name} summary`}
              className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff] text-[8px] font-semibold text-[#6d5cff]">
                {tenant.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-[#4c3fd4]">{tenant.name}</span>
                <span className="block truncate text-[11px] text-slate-400">
                  {tenant.industry}
                  {tenant.openIssues?.length ? ` · ${tenant.openIssues.length} open` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
