import type { LucideIcon } from "lucide-react"

export function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary-500/30 hover:bg-white hover:shadow-float">
      <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech opacity-80" />
      <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/18" />
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
        </div>
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-paper text-primary-700 ring-1 ring-black/10 transition group-hover:-translate-y-0.5 group-hover:bg-primary-50">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

