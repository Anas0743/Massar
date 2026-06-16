import { Inbox } from "lucide-react"

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-black/10 bg-white/86 p-8 text-center shadow-sm backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(126,221,241,0.12),transparent_32%),radial-gradient(circle_at_82%_74%,rgba(184,167,255,0.12),transparent_34%)]" />
      <span className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-500/20">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="relative text-lg font-black text-ink">{title}</h3>
      {description ? <p className="relative mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">{description}</p> : null}
    </div>
  )
}

