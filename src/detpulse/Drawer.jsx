import { COACH_PRESETS, JUSTIFICATIONS, MERGE_A_ONLY, RULES, canMerge, patchedQuery } from "./model"
import { usePulse } from "./PulseContext"
import { CodeBlock, StatusPill, ruleView } from "./ui"

export default function Drawer() {
  const pulse = usePulse()
  const drawer = pulse.drawer
  if (!drawer) return null
  const rule = ruleView(RULES.find((item) => item.id === drawer.ruleId), pulse.patched)
  const locked = !rule.patched && !canMerge(drawer)
  const reason = lockReason(drawer, rule.patched)

  async function copyQuery() {
    const text = patchedQuery(rule, drawer)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const field = document.createElement("textarea")
      field.value = text
      document.body.appendChild(field)
      field.select()
      document.execCommand("copy")
      field.remove()
    }
    pulse.dispatch({ type: "copied", value: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close review drawer" className="absolute inset-0 bg-slate-900/30" onClick={() => pulse.dispatch({ type: "close" })} />
      <aside role="dialog" aria-modal="true" aria-labelledby="hitl-title" className="drawer-in relative flex h-full w-full max-w-3xl flex-col border-l border-slate-200 bg-[#F8FAFC] shadow-xl">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">SecOps Detection Agent & HITL Governance</p>
              <h2 id="hitl-title" className="mt-1 text-[16px] font-semibold text-slate-900">{rule.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">{rule.technique}</span>
                <StatusPill tone={rule.tone} pulse={rule.tone === "critical" && !rule.patched}>
                  {rule.patched ? "HEALTHY / PATCHED" : `${rule.severity} · ${rule.pill}`}
                </StatusPill>
              </div>
              <p className="mt-2 text-[12px] text-slate-600">{rule.lineage.join(" ➔ ")}</p>
            </div>
            <button type="button" onClick={() => pulse.dispatch({ type: "close" })} className="rounded-md border border-slate-200 px-2 py-1 text-[12px] font-semibold text-slate-600">
              Close
            </button>
          </div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-slate-400">Broken production query</p>
              <CodeBlock>{rule.broken}</CodeBlock>
            </div>
            <div className="space-y-3">
              <article className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-slate-900">Hunk A · Schema normalization</p>
                  <StatusPill tone="healthy">AST Contract Verified — Safe to Merge</StatusPill>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Tier-1 · auto-validated. Included in the patched query.</p>
                <CodeBlock className="mt-2">{rule.hunkA}</CodeBlock>
              </article>
              <article className={`rounded-xl border bg-white p-3 ${drawer.hunkBApproved ? "border-amber-300" : "border-amber-200"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-slate-900">Hunk B · Detection logic & noise exclusion</p>
                  <StatusPill tone="degraded">Modifies Detection Scope — Explicit Lead Sign-Off Required</StatusPill>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Tier-3 · HITL required.</p>
                <CodeBlock className="mt-2">{drawer.hunkBCode}</CodeBlock>
                <label className="mt-3 flex items-center gap-2 text-[12.5px] text-slate-800">
                  <input
                    type="checkbox"
                    checked={drawer.hunkBApproved}
                    onChange={() => pulse.dispatch({ type: "hunk" })}
                    className="size-3.5 accent-indigo-600"
                  />
                  Approve exclusion filter
                </label>
                <label className="mt-2 block text-[11px] font-medium text-slate-500">
                  Approval justification
                  <select
                    value={drawer.justification}
                    onChange={(event) => pulse.dispatch({ type: "justify", value: event.target.value })}
                    className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[12.5px] font-normal text-slate-800"
                  >
                    <option value="">Select approval justification...</option>
                    {JUSTIFICATIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyQuery} className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800">
              {drawer.copied ? "Copied ✓" : "Copy Patched Query"}
            </button>
            <button
              type="button"
              aria-expanded={drawer.coachOpen}
              onClick={() => pulse.dispatch({ type: "coach-toggle" })}
              className={`inline-flex h-8 items-center rounded-lg border px-3 text-[12px] font-semibold ${drawer.coachOpen ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-800"}`}
            >
              Reject / Coach Agent
            </button>
            {drawer.constraintSaved ? <StatusPill tone="ai">Constraint Saved to Agent Memory</StatusPill> : null}
          </div>

          {drawer.coachOpen ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[12px] font-semibold text-slate-900">Human Feedback & Constraint Loop</p>
              <div className="mt-2 space-y-1.5">
                {COACH_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={drawer.resynth}
                    onClick={() => pulse.dispatch({ type: "coach-pick", code: rule.coach[preset.id] })}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-[12.5px] text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-60"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {drawer.resynth ? (
                <p className="mt-3 text-[12px] font-medium text-indigo-700" role="status">
                  Re-synthesizing patch with human constraints...
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">Ground-truth backtesting sandbox</p>
                <p className="text-[12px] text-slate-500">Snowflake lake · 30-day partition · purple-team atomics included.</p>
              </div>
              <button
                type="button"
                disabled={drawer.replay === "running" || rule.patched}
                onClick={() => pulse.dispatch({ type: "replay-start" })}
                className="inline-flex h-8 items-center rounded-lg bg-indigo-600 px-3 text-[12px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {drawer.replay === "running" ? "Replaying…" : "▶ Run 30-Day Historical Replay (Snowflake Lake)"}
              </button>
            </div>
            {drawer.replay === "running" ? (
              <div className="mt-3" role="status">
                <p className="text-[12px] text-slate-600">Scanning 14.2M historical events across 30-day partition...</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="detpulse-load h-full rounded-full bg-indigo-600" />
                </div>
              </div>
            ) : null}
            {drawer.replay === "done" ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Metric label="True Positive Recall" value="100%" note="14/14 Purple Team atomic tests detected" tone="text-emerald-700" />
                <Metric label="False Positive Delta" value="-74%" note="Filtered 118 signed SCCM executions" tone="text-indigo-700" />
                <Metric label="SIEM Compute Impact" value="-8.2%" note="Query scan cost reduction" tone="text-amber-800" />
              </div>
            ) : null}
          </div>
          {rule.audit ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">
              {rule.audit}. Detection Resilience Score is now <span className="font-mono font-semibold">{pulse.drs.toFixed(1)}</span>.
            </p>
          ) : null}
        </div>
        <footer className="border-t border-slate-200 bg-white px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-[11px] leading-snug text-slate-500">{rule.patched ? rule.prLabel : reason}</p>
            <span title={locked ? reason : undefined} className="inline-flex">
              <button
                type="button"
                disabled={locked || rule.patched}
                onClick={() => pulse.dispatch({ type: "merge" })}
                className={`inline-flex h-9 items-center rounded-lg px-3 text-[12px] font-semibold text-white ${
                  locked || rule.patched ? "cursor-not-allowed bg-slate-900 opacity-50" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {rule.patched ? rule.prLabel : "Approve & Open Detection-as-Code PR (GitHub)"}
              </button>
            </span>
          </div>
        </footer>
      </aside>
    </div>
  )
}

function Metric({ label, value, note, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-[18px] font-semibold ${tone}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">{note}</p>
    </div>
  )
}

function lockReason(drawer, patched) {
  if (patched) return ""
  if (drawer.replay !== "done") return "Run the 30-day historical replay before a pull request can open."
  if (!drawer.justification) return "Choose an approval justification."
  if (drawer.justification !== MERGE_A_ONLY && !drawer.hunkBApproved) return "Approve the exclusion filter, or choose Merge Hunk A only."
  return "Replay held and the lead sign-off is recorded. The pull request can open."
}
