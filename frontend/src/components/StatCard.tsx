import type { LucideIcon } from "lucide-react"

export function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:border-primary-200 hover:shadow-float">
      <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-100 text-primary-700 ring-1 ring-primary-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
