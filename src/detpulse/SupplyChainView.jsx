import Lineage from "./Lineage"

export default function SupplyChainView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Live Data-to-Detection Supply Chain</h1>
        <p className="text-[13px] text-slate-600">Telemetry through the pipeline, the detection engine, and response.</p>
      </div>
      <Lineage />
    </div>
  )
}
