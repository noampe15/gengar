import { useState } from "react"

export default function SettingsPage() {
  const [alerts, setAlerts] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [threshold, setThreshold] = useState(80)

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6">
      <h2 className="text-[16px] font-semibold">Settings</h2>
      <p className="mt-1 text-sm text-slate-400">
        Local prototype preferences — nothing is saved to a server.
      </p>

      <label className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 p-4">
        <span className="text-sm font-medium">Critical score alerts</span>
        <input
          type="checkbox"
          checked={alerts}
          onChange={(e) => setAlerts(e.target.checked)}
          className="h-4 w-4 accent-[#6d5cff]"
        />
      </label>
      <label className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 p-4">
        <span className="text-sm font-medium">Auto-refresh every 60s</span>
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="h-4 w-4 accent-[#6d5cff]"
        />
      </label>
      <label className="mt-3 block rounded-xl border border-slate-100 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Escalate when score ≥ {threshold}</span>
        </div>
        <input
          type="range"
          min="50"
          max="99"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-[#6d5cff]"
        />
      </label>
    </section>
  )
}
