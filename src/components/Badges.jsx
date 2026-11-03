import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"

export const severityStyles = {
  Critical: {
    text: "text-[#e11d48]",
    bg: "bg-[#fff1f2]",
    border: "border-[#fda4af]",
    dot: "bg-[#e11d48]",
    bar: "bg-[#e11d48]",
    ring: "#e11d48",
  },
  High: {
    text: "text-[#ea580c]",
    bg: "bg-[#fff7ed]",
    border: "border-[#fdba74]",
    dot: "bg-[#ea580c]",
    bar: "bg-[#f97316]",
    ring: "#ea580c",
  },
  Medium: {
    text: "text-[#ca8a04]",
    bg: "bg-[#fefce8]",
    border: "border-[#facc15]",
    dot: "bg-[#ca8a04]",
    bar: "bg-[#eab308]",
    ring: "#ca8a04",
  },
  Low: {
    text: "text-[#a3a31c]",
    bg: "bg-[#f7f8e8]",
    border: "border-[#c4c43a]",
    dot: "bg-[#c4c43a]",
    bar: "bg-[#d4d45c]",
    ring: "#b8b82e",
  },
  None: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    ring: "#16a34a",
  },
}

export const providerStyles = {
  AWS: "bg-[#fff4ed] text-[#c2410c]",
  Azure: "bg-[#eff6ff] text-[#2563eb]",
  GCP: "bg-[#ecfdf3] text-[#16a34a]",
}

export function SeverityBadge({ severity, label, icon: Icon }) {
  const style = severityStyles[severity] ?? severityStyles.Medium
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      {Icon ? <Icon className="h-3 w-3" aria-hidden="true" /> : <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      <span>{label ?? severity}</span>
    </span>
  )
}

export function TenantStatusBadge({ health }) {
  const map = {
    critical: { label: "Critical", Icon: ShieldAlert, className: "bg-rose-50 text-rose-800", iconClass: "text-[#e11d48]" },
    warning: { label: "SLA Warning", Icon: Shield, className: "bg-orange-50 text-amber-800", iconClass: "text-[#ea580c]" },
    secure: { label: "Secure", Icon: ShieldCheck, className: "bg-emerald-50 text-emerald-800", iconClass: "text-[#16a34a]" },
  }
  const s = map[health] ?? map.secure
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      <s.Icon className={`h-3 w-3 ${s.iconClass}`} aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function EnvRiskBadge({ severity, label }) {
  const style = severityStyles[severity] ?? severityStyles.None
  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12px] font-semibold tracking-tight shadow-sm ${style.bg} ${style.border} ${style.text}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-white ${style.dot}`} />
      {label ?? severity}
    </span>
  )
}

export function ProviderBadge({ provider }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${providerStyles[provider] ?? "bg-slate-100 text-slate-600"}`}
    >
      {provider}
    </span>
  )
}

export function ScoreRing({ score, size = 40, stroke = 3, healthy = false }) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = healthy || score === 0
    ? "#16a34a"
    : score >= 80
      ? "#e11d48"
      : score >= 60
        ? "#ea580c"
        : score >= 40
          ? "#ca8a04"
          : "#b8b82e"

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f2f4"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold tabular-nums text-slate-800">{score}</span>
    </div>
  )
}
