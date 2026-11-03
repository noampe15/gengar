import {
  Box,
  Clock3,
  Database,
  HardDrive,
  Network,
  Server,
  Wrench,
} from "lucide-react"
import { ProviderBadge, ScoreRing, SeverityBadge } from "./Badges"
import { ProviderClusterCell, TenantClusterCell } from "./ClusterHoverPopup"
import RowActionMenu from "./RowActionMenu"

const typeIcons = {
  db: Database,
  vm: Server,
  k8s: Box,
  storage: HardDrive,
  net: Network,
}

const iconColors = {
  db: "text-orange-500 bg-orange-50",
  vm: "text-blue-500 bg-blue-50",
  k8s: "text-emerald-600 bg-emerald-50",
  storage: "text-violet-500 bg-violet-50",
  net: "text-sky-600 bg-sky-50",
}

const tbrColor = {
  red: "text-[#e11d48]",
  amber: "text-[#ea580c]",
  muted: "text-slate-500",
}

export default function TopRisks({
  rows,
  total,
  selectedId,
  onInvestigate,
  onRemediate,
  mode = "tenant",
}) {
  const msp = mode === "msp"

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Remediation Queue</h2>
          {msp && (
            <p className="text-[12px] text-slate-400">Identical control gaps clustered across tenant environments</p>
          )}
        </div>
        <span className="text-[12px] text-slate-400">
          Showing {rows.length} of {total}
        </span>
      </div>

      <div className="hidden max-h-[800px] overflow-x-auto overflow-y-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="text-[11.5px] font-medium text-slate-400">
              <th className="pb-3 font-medium">Issue</th>
              {msp ? (
                <>
                  <th className="pb-3 font-medium">Tenant</th>
                  <th className="pb-3 font-medium">Provider</th>
                </>
              ) : (
                <>
                  <th className="pb-3 font-medium">Resource</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Business Unit</th>
                </>
              )}
              <th className="pb-3 font-medium">RTO Delta</th>
              <th className="pb-3 font-medium">TBR</th>
              <th className="pb-3 font-medium">Score</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = typeIcons[row.icon] ?? Database
              const tenantCount = row.tenantCount ?? row.affectedTenants?.length ?? 1
              return (
                <tr
                  key={row.id}
                  onClick={msp ? () => onInvestigate(row) : undefined}
                  className={`border-t border-slate-100 ${msp ? "cursor-pointer" : ""} ${
                    selectedId === row.id ? "bg-[#f7f6ff]" : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="py-3.5 pr-4">
                    <p className="text-[13px] font-medium text-slate-800">{row.issue}</p>
                    {msp && <p className="text-[11px] text-slate-400">Affects {tenantCount} Tenants</p>}
                  </td>
                  {msp ? (
                    <>
                      <td className="py-3.5 pr-4">
                        <TenantClusterCell tenants={row.affectedTenants} />
                      </td>
                      <td className="py-3.5 pr-4">
                        <ProviderClusterCell providers={row.affectedProviders} fallback={row.provider} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[row.icon]}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-[13.5px] font-semibold text-slate-800">{row.name}</p>
                            <p className="text-[11px] text-slate-400">{row.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <ProviderBadge provider={row.provider} />
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="text-[13px] font-medium text-slate-700">{row.businessUnit}</p>
                        <p className="text-[11px] text-slate-400">{row.tier}</p>
                      </td>
                    </>
                  )}
                  <td className="py-3.5 pr-4">
                    <p className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#ea580c]">
                      <Clock3 className="h-3.5 w-3.5" />+{row.rtoDelta}h
                    </p>
                    <p className="text-[11px] text-slate-400">{row.checkedAgo}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className={`text-[13px] font-semibold ${tbrColor[row.tbrTone]}`}>{row.tbr}</p>
                    <p className="text-[11px] text-slate-400">{row.tbrNote}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <ScoreRing score={row.score} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <SeverityBadge severity={row.priority} />
                  </td>
                  <td className="py-3.5 text-right">
                    {msp ? (
                      <button
                        type="button"
                        title="AI Global Auto-Remediate"
                        aria-label="AI Global Auto-Remediate"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemediate(row)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-[#6d5cff]/40 hover:bg-[#f3f1ff] hover:text-[#6d5cff]"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <RowActionMenu row={row} onInvestigate={onInvestigate} onRemediate={onRemediate} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="max-h-[800px] space-y-3 overflow-y-auto lg:hidden">
        {rows.map((row) => {
          const Icon = typeIcons[row.icon] ?? Database
          const tenantCount = row.tenantCount ?? 1
          return (
            <div key={row.id} className="rounded-xl border border-slate-100 p-3">
              <button
                type="button"
                onClick={msp ? () => onInvestigate(row) : undefined}
                className="w-full text-left"
              >
                <p className="text-[13px] font-medium text-slate-800">{row.issue}</p>
                {msp && <p className="text-[11px] text-slate-400">Affects {tenantCount} Tenants</p>}
                <div className="mt-2 flex items-start justify-between gap-2">
                  {msp ? (
                    <div className="flex flex-col gap-2">
                      <TenantClusterCell tenants={row.affectedTenants} />
                      <ProviderClusterCell providers={row.affectedProviders} fallback={row.provider} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[row.icon]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold">{row.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {row.type} · {row.provider}
                        </p>
                      </div>
                    </div>
                  )}
                  <ScoreRing score={row.score} size={36} />
                </div>
              </button>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={row.priority} />
                <span className="text-[12px] text-[#ea580c]">+{row.rtoDelta}h RTO</span>
                <span className="text-[12px] text-slate-400">{row.tbr}</span>
                <div className="ml-auto">
                  {msp ? (
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600"
                      onClick={() => onRemediate(row)}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <RowActionMenu row={row} onInvestigate={onInvestigate} onRemediate={onRemediate} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">
          No risks match the current filters.
        </p>
      )}
    </section>
  )
}
