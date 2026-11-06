import AutomationsView from "./AutomationsView"
import DetectionsView from "./DetectionsView"
import Drawer from "./Drawer"
import Overview from "./Overview"
import ParsersView from "./ParsersView"
import RemediationView from "./RemediationView"
import SupplyChainView from "./SupplyChainView"
import { PulseProvider, usePulse } from "./PulseContext"
import { SideNav } from "./TopBar"

function Shell() {
  const { view } = usePulse()
  return (
    <div className="flex h-svh overflow-hidden bg-[#E7EDF5] p-3 text-slate-900">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-[28px] border border-slate-200/60 bg-white shadow-sm">
        <SideNav />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {view === "overview" ? (
            <Overview />
          ) : (
            <div className="h-full overflow-y-auto px-8 pt-6 pb-5">
              {view === "supply" ? <SupplyChainView /> : null}
              {view === "detections" ? <DetectionsView /> : null}
              {view === "parsers" ? <ParsersView /> : null}
              {view === "automations" ? <AutomationsView /> : null}
              {view === "remediation" ? <RemediationView /> : null}
            </div>
          )}
        </main>
      </div>
      <Drawer />
    </div>
  )
}

export default function DetPulseApp() {
  return (
    <PulseProvider>
      <Shell />
    </PulseProvider>
  )
}
