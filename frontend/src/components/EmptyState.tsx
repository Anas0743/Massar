import { Inbox } from "lucide-react"

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-black/10 bg-white/86 p-8 text-center shadow-sm backdrop-blur">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-700">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}
