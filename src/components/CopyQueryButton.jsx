import { useState } from "react"
import { Check, Copy } from "lucide-react"

export default function CopyQueryButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      area.setAttribute("readonly", "")
      area.style.position = "fixed"
      area.style.left = "-9999px"
      document.body.appendChild(area)
      area.select()
      document.execCommand("copy")
      area.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 text-[11px] font-semibold text-slate-100 outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-[#6d5cff]"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy Query"}
    </button>
  )
}
