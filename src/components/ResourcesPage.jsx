import {
  Box,
  Database,
  HardDrive,
  Network,
  Server,
} from "lucide-react"
import { ProviderBadge, ScoreRing, SeverityBadge } from "./Badges"
import IssueHoverPopup from "./IssueHoverPopup"
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

export default function ResourcesPage({
  rows,
  selectedId,
  issuesByResource,
  onInvestigate,
  onRemediate,
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-slate-900">Resources</h2>
        <span className="text-[12px] text-slate-400">Showing {rows.length}</span>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="text-[11.5px] font-medium text-slate-400">
              <th className="pb-3 font-medium">Resource</th>
              <th className="pb-3 font-medium">Issue</th>
              <th className="pb-3 font-medium">Provider</th>
              <th className="pb-3 font-medium">Business Unit</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 font-medium">Score</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = typeIcons[row.icon] ?? Database
              const healthy = Boolean(row.healthy)
              const issues = issuesByResource?.[row.name] ?? []
              return (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 ${
                    selectedId === row.id ? "bg-[#f7f6ff]" : "hover:bg-slate-50/80"
                  }`}
                >
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
                    <IssueHoverPopup row={row} issues={issues} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <ProviderBadge provider={row.provider} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-[13px] font-medium text-slate-700">{row.businessUnit}</p>
                    <p className="text-[11px] text-slate-400">{row.tier}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <SeverityBadge severity={row.priority} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <ScoreRing score={row.score} healthy={healthy} />
                  </td>
                  <td className="py-3.5 text-right">
                    {healthy ? (
                      <span className="text-[12.5px] text-slate-400">—</span>
                    ) : (
                      <RowActionMenu
                        row={row}
                        onInvestigate={onInvestigate}
                        onRemediate={onRemediate}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {rows.map((row) => {
          const Icon = typeIcons[row.icon] ?? Database
          const healthy = Boolean(row.healthy)
          const issues = issuesByResource?.[row.name] ?? []
          return (
            <div key={row.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-2">
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
                <ScoreRing score={row.score} size={36} healthy={healthy} />
              </div>
              <div className="mt-2">
                <IssueHoverPopup row={row} issues={issues} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={row.priority} />
                {!healthy && (
                  <div className="ml-auto">
                    <RowActionMenu
                      row={row}
                      onInvestigate={onInvestigate}
                      onRemediate={onRemediate}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">No resources match the current filters.</p>
      )}
    </section>
  )
}
