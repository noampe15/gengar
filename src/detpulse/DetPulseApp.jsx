import AutomationsView from "./AutomationsView"
import DetectionsView from "./DetectionsView"
import Drawer from "./Drawer"
import Overview from "./Overview"
import ParsersView from "./ParsersView"
import { PulseProvider, usePulse } from "./PulseContext"
import TopBar, { SideNav } from "./TopBar"

function Shell() {
  const { view } = usePulse()
  return (
    <div className="flex h-svh overflow-hidden bg-[#F8FAFC] text-slate-900">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          {view === "overview" ? <Overview /> : null}
          {view === "detections" ? <DetectionsView /> : null}
          {view === "parsers" ? <ParsersView /> : null}
          {view === "automations" ? <AutomationsView /> : null}
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
