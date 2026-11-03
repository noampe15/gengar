import { Users } from "lucide-react"

export default function SharedIssueScope({ risk }) {
  const peers = risk.relatedResources ?? []
  const total = peers.length + 1

  return (
    <div className="mt-4 flex gap-3 rounded-xl bg-[#eef2ff] px-3.5 py-3 text-[#4f46e5]">
      <Users className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="text-[13px] font-semibold">Shared issue scope</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#6366f1]">
          {peers.length === 0 ? (
            <>This control gap is isolated to this resource. Remediation will affect 1 resource.</>
          ) : (
            <>
              This issue is shared across{" "}
              <span className="font-semibold">
                {total} resource{total === 1 ? "" : "s"}
              </span>
              . Remediating it will also affect{" "}
              <span className="font-semibold">
                {peers.length === 1 ? "1 other resource" : `${peers.length} other resources`}
              </span>{" "}
              with the same control gap.
            </>
          )}
        </p>
        {peers.length > 0 && (
          <ul className="mt-2 space-y-1">
            {peers.map((name) => (
              <li key={name} className="text-[12px] font-medium text-[#4338ca]">
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
