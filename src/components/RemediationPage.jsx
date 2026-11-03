import ActionQueueWorkspace from "./ActionQueueWorkspace"
import RemediationHistory from "./RemediationHistory"

function RemediationViewToggle({ view, onView }) {
  return (
    <div
      role="tablist"
      aria-label="Remediation views"
      className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 p-0.5"
    >
      {[
        { id: "queue", label: "Queue" },
        { id: "history", label: "Activity log" },
      ].map((tab) => {
        const active = view === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            id={`remediation-tab-${tab.id}`}
            aria-controls={`remediation-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault()
                onView(tab.id === "queue" ? "history" : "queue")
              }
            }}
            onClick={() => onView(tab.id)}
            className={`rounded-full px-3.5 py-1 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#6d5cff] ${
              active ? "bg-white text-[#5b4cf0] shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default function RemediationPage({
  view,
  onView,
  queueItems,
  filterChips,
  onClearFilters,
  selectedId,
  onReview,
  onAssign,
  onSnooze,
  onDismiss,
  onBulkApprove,
  onBulkAssign,
  onRequestAccess,
  search,
  onSearch,
  historyRows,
  isGlobal,
  historyOutcome,
  historyTenant,
  historyApprover,
  historySla,
  historyActor,
  historyEvent,
  onHistoryFilter,
  onViewRollback,
  historyFocusId,
  scope = "global",
  queueAiStatus,
  queueAge,
  onQueueAiStatus,
  onQueueAge,
  onOpenTenant,
}) {
  const toggle = <RemediationViewToggle view={view} onView={onView} />

  return (
    <div>
      {view === "queue" ? (
        <div role="tabpanel" id="remediation-panel-queue" aria-labelledby="remediation-tab-queue">
          <ActionQueueWorkspace
            items={queueItems}
            filterChips={filterChips}
            onClearFilters={onClearFilters}
            selectedId={selectedId}
            onReview={onReview}
            onAssign={onAssign}
            onSnooze={onSnooze}
            onDismiss={onDismiss}
            onBulkApprove={onBulkApprove}
            onBulkAssign={onBulkAssign}
            onRequestAccess={onRequestAccess}
            search={search}
            onSearch={onSearch}
            scope={scope}
            queueAiStatus={queueAiStatus}
            queueAge={queueAge}
            onQueueAiStatus={onQueueAiStatus}
            onQueueAge={onQueueAge}
            onOpenTenant={onOpenTenant}
            headerAction={toggle}
          />
        </div>
      ) : (
        <div role="tabpanel" id="remediation-panel-history" aria-labelledby="remediation-tab-history">
          <RemediationHistory
            rows={historyRows}
            isGlobal={isGlobal}
            outcome={historyOutcome}
            tenant={historyTenant}
            approver={historyApprover}
            sla={historySla}
            actor={historyActor}
            event={historyEvent}
            onFilter={onHistoryFilter}
            onViewRollback={onViewRollback}
            showPortfolioTotals
            highlightId={historyFocusId}
            headerAction={toggle}
          />
        </div>
      )}
    </div>
  )
}
