import { PLAYBOOKS } from "./model"

function highlightNull(text) {
  return text.split("null").flatMap((part, index) => (index === 0 ? [part] : [<span key={index} className="text-red-300">null</span>, part]))
}
import { usePulse } from "./PulseContext"
import { Card, CodeBlock, StatusPill } from "./ui"

export default function AutomationsView() {
  const pulse = usePulse()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Automations & SOAR</h1>
        <p className="text-[13px] text-slate-600">The contract between a SIEM projection and the playbook that consumes it.</p>
      </div>
      <div className="grid gap-3">
        {PLAYBOOKS.map((playbook) => {
          const healed = Boolean(playbook.error && playbook.ruleId && pulse.patched[playbook.ruleId])
          const broken = Boolean(playbook.error) && !healed
          return (
            <Card key={playbook.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <StatusPill tone={broken ? "critical" : "healthy"} pulse={broken}>
                    {broken ? "BROKEN" : "HEALTHY"}
                  </StatusPill>
                  <h2 className="mt-2 text-[14px] font-semibold text-slate-900">{playbook.name}</h2>
                  <p className="mt-1 text-[12.5px] text-slate-600">Triggered by: {playbook.trigger}</p>
                </div>
                {broken ? (
                  <button
                    type="button"
                    onClick={() => pulse.dispatch({ type: "open", id: playbook.ruleId })}
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-slate-800"
                  >
                    Patch KQL projection (HITL) →
                  </button>
                ) : null}
              </div>
              {broken ? (
                <div className="mt-3">
                  <p className="text-[12.5px] text-red-700">{playbook.error}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium text-slate-400">Expected webhook schema</p>
                      <CodeBlock>{playbook.expected}</CodeBlock>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium text-slate-400">Actual Sentinel alert output</p>
                      <CodeBlock>{highlightNull(playbook.actual)}</CodeBlock>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] text-slate-600">{healed ? playbook.healed : playbook.note}</p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
