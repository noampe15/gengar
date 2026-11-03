import TenantSummaryStrip from "./TenantSummaryStrip"
import LatestAiActivity from "./LatestAiActivity"
import TenantAutonomy from "./TenantAutonomy"
import TimeInQueue from "./TimeInQueue"
import ActionQueueRail from "./ActionQueueRail"

export default function TenantOverview({
  overview,
  queueItems,
  selectedId,
  onHistory,
  onActivityAction,
  onViewAll,
  onQueueFilter,
  queueHandlers,
}) {
  return (
    <div className="relative space-y-4">
      <TenantSummaryStrip summary={overview.summary} />
      <div className="relative grid items-stretch gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="order-2 flex min-h-0 min-w-0 lg:order-1">
          <LatestAiActivity
            totals={overview.activityTotals}
            entries={overview.activity}
            onHistory={onHistory}
            onAction={onActivityAction}
          />
        </div>
        <div className="order-1 flex min-h-0 min-w-0 lg:order-2">
          <ActionQueueRail
            compact
            scope="tenant"
            items={queueItems}
            filterChips={[]}
            onClearFilters={() => {}}
            selectedId={selectedId}
            onViewAll={onViewAll}
            {...queueHandlers}
          />
        </div>
      </div>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <TenantAutonomy autonomy={overview.autonomy} onOpenHistory={onHistory} />
        <TimeInQueue
          buckets={overview.timeInQueue}
          onSegmentClick={onQueueFilter}
        />
      </div>
    </div>
  )
}
