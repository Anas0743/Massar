import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Clock, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { formatCurrency } from "../lib/utils"
import type { Expert } from "../types/models"
import { ButtonLink } from "./ui/Button"

export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-black/10 bg-white/90 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
      <div className="masar-progress h-1.5" />
      <div className="flex items-start gap-4 p-5 pb-3">
        <Link to={`/experts/${expert.id}`} className="shrink-0">
          <img
            src={expert.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=2fa891&color=fff`}
            alt={expert.name}
            className="h-16 w-16 rounded-full object-cover ring-4 ring-primary-50"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/experts/${expert.id}`} className="text-lg font-black text-ink transition group-hover:text-primary-700">
              {expert.name}
            </Link>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              معتمد
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">{expert.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {expert.tracks.slice(0, 3).map((track) => (
              <span key={track.id} className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-black/10">
                {track.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="line-clamp-3 min-h-20 px-5 text-sm leading-7 text-slate-600">{expert.bio}</p>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-2 rounded-md bg-paper p-3 text-xs font-bold text-slate-700 ring-1 ring-black/10">
        <span className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {expert.rating_average || "جديد"}
        </span>
        <span className="flex items-center gap-1.5">
          <BriefcaseBusiness className="h-4 w-4 text-aqua" />
          {expert.years_of_experience} سنوات
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-sun" />
          {expert.session_duration_minutes} د
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/10 p-5">
        <div>
          <span className="block text-xs font-bold text-slate-500">يبدأ من</span>
          <span className="text-base font-black text-ink">{formatCurrency(expert.hourly_price)}</span>
        </div>
        <ButtonLink to={`/experts/${expert.id}`} size="sm">
          عرض الخبير
          <ArrowLeft className="h-4 w-4" />
        </ButtonLink>
      </div>
    </article>
  )
}
