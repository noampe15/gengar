import StackedBarChart from "./StackedBarChart"

export default function TimeInQueue({ buckets, onSegmentClick }) {
  return (
    <section
      className="relative flex h-full min-h-[22rem] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div>
        <h2 className="text-[16px] font-semibold text-slate-900">Time in queue</h2>
        <p className="mt-0.5 text-[12px] text-slate-600">How long open issues have waited, by AI status</p>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <StackedBarChart buckets={buckets} onSegmentClick={onSegmentClick} />
      </div>
    </section>
  )
}
