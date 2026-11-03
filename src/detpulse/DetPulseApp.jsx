import AutomationsView from "./AutomationsView"
import DetectionsView from "./DetectionsView"
import Drawer from "./Drawer"
import Overview from "./Overview"
import ParsersView from "./ParsersView"
import SupplyChainView from "./SupplyChainView"
import { PulseProvider, usePulse } from "./PulseContext"
import TopBar, { SideNav } from "./TopBar"

function Shell() {
  const { view } = usePulse()
  return (
    <div className="flex h-svh overflow-hidden bg-[#F8FAFC] text-slate-900">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 md:px-5">
          {view === "overview" ? (
            <Overview />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {view === "supply" ? <SupplyChainView /> : null}
              {view === "detections" ? <DetectionsView /> : null}
              {view === "parsers" ? <ParsersView /> : null}
              {view === "automations" ? <AutomationsView /> : null}
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
