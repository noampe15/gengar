import Lineage from "./Lineage"

export default function SupplyChainView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0B132B]">Topology Analysis</h1>
        <p className="mt-1 text-sm text-slate-500">Telemetry through the pipeline, the detection engine, and response.</p>
      </div>
      <Lineage />
    </div>
  )
}
