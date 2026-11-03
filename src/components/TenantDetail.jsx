import { ArrowLeft, Box, Database, Fingerprint, HardDrive } from "lucide-react"
import { SeverityBadge, TenantStatusBadge } from "./Badges"
import { formatSlaRemain, slaUrgency, rangeMeta, tenantActivityInRange } from "../mspDashboard"
import AssignMenu from "./AssignMenu"

const GROUP_ICONS = {
  Databases: Database,
  Containers: Box,
  Identity: Fingerprint,
  Storage: HardDrive,
}

const AI_STATUS = {
  "AI fixing": "bg-emerald-50 text-emerald-800",
  "Waiting on human": "bg-amber-50 text-amber-900",
  Blocked: "bg-rose-50 text-rose-800",
}

const OUTCOME = {
  Fixed: "bg-emerald-50 text-emerald-800",
  "Rolled back": "bg-rose-50 text-rose-800",
  Escalated: "bg-amber-50 text-amber-900",
}

function slaCopy(tenant) {
  if (tenant.nextBreachAt == null) return "None"
  const ms = tenant.nextBreachAt - Date.now()
  const remain = formatSlaRemain(ms)
  const u = slaUrgency(ms)
  if (u === "red") return `${remain} remaining (under 1h)`
  if (u === "amber") return `${remain} remaining (under 2h)`
  return `${remain} remaining`
}

export default function TenantDetail({ tenant, range = "Last 7 days", onBack, onAssign, onOpenQueue }) {
  const sla = slaCopy(tenant)
  const slaMs = tenant.nextBreachAt == null ? null : tenant.nextBreachAt - Date.now()
  const slaClass =
    slaUrgency(slaMs) === "red" ? "text-rose-700" : slaUrgency(slaMs) === "amber" ? "text-amber-800" : "text-slate-800"
  const period = rangeMeta(range).shortLabel
  const activity = tenantActivityInRange(tenant, range)

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-2 text-[13px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-medium text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Tenants
        </button>
        <span className="text-slate-400" aria-hidden="true">
          /
        </span>
        <span className="font-medium text-slate-800">{tenant.name}</span>
        <span className="text-slate-400" aria-hidden="true">
          /
        </span>
        <span className="font-medium text-slate-700">Summary</span>
      </nav>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f1ff] text-[12px] font-semibold text-[#6d5cff]">
              {tenant.initials}
            </span>
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900">{tenant.name}</h2>
              <p className="mt-0.5 text-[13px] text-slate-500">{tenant.industry}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TenantStatusBadge health={tenant.health} />
                {tenant.owner ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">
                      {tenant.owner.initials}
                    </span>
                    {tenant.owner.name}
                  </span>
                ) : (
                  <span className="text-[12px] text-slate-500">Unassigned</span>
                )}
              </div>
            </div>
          </div>
          <AssignMenu
            align="right"
            label="Assign owner"
            ariaLabel={`Assign owner for ${tenant.name}`}
            onSelect={(person) => onAssign(tenant.id, person)}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-[13px] font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
          />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Open issues", String(tenant.openIssues.length), "text-slate-900"],
            ["Next SLA breach", sla, slaClass],
            ["AI auto-fixed (" + period + ")", String(activity.fixed), "text-slate-900"],
            ["Rolled back (" + period + ")", String(activity.rolledBack), "text-slate-900"],
            ["Escalated (" + period + ")", String(activity.escalated), "text-slate-900"],
          ].map(([k, v, tone]) => (
            <div key={k} className="rounded-xl bg-slate-50 px-3 py-2.5">
              <dt className="text-[11px] text-slate-500">{k}</dt>
              <dd className={`mt-0.5 text-[14px] font-semibold ${tone}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h3 className="text-[15px] font-semibold text-slate-900">Open issues</h3>
        {tenant.openIssues.length === 0 ? (
          <p className="mt-2 text-[13px] text-slate-500">No open issues in this tenant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {tenant.openIssues.map((row) => (
              <li key={`${row.title}-${row.queueItemId}`} className="flex flex-wrap items-center gap-2 py-2.5">
                <SeverityBadge severity={row.severity} />
                <span className="min-w-0 flex-1 text-[13px] font-medium text-slate-800">{row.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${AI_STATUS[row.aiStatus] ?? "bg-slate-100 text-slate-600"}`}>
                  {row.aiStatus}
                </span>
                {row.queueItemId && (
                  <button
                    type="button"
                    onClick={() => onOpenQueue(row.queueItemId)}
                    className="text-[12px] font-medium text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
                  >
                    View in Action queue
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h3 className="text-[15px] font-semibold text-slate-900">Resources in this tenant</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {tenant.resources.map((g) => {
            const Icon = GROUP_ICONS[g.group] ?? Database
            return (
              <li key={g.group} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-800">
                  <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {g.group}
                  <span className="font-normal text-slate-500">{g.count}</span>
                </span>
                <span className="rounded-full bg-[#f3f1ff] px-2 py-0.5 text-[11px] font-medium text-[#5b4cf0]">
                  {g.withIssues} with issues
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h3 className="text-[15px] font-semibold text-slate-900">Recent AI activity</h3>
        <ul className="mt-3 space-y-2">
          {tenant.recentAi.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
              <span className="text-slate-800">{row.action}</span>
              <span className="inline-flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${OUTCOME[row.outcome]}`}>{row.outcome}</span>
                <span className="text-[12px] text-slate-500">{row.at}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onBack}
        className="text-[13px] font-medium text-[#6d5cff] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
      >
        Back to roster
      </button>
    </div>
  )
}
