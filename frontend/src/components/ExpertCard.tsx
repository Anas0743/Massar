import { ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarCheck2, Clock, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { formatCurrency } from "../lib/utils"
import type { Expert } from "../types/models"
import { ButtonLink } from "./ui/Button"

export function ExpertCard({ expert }: { expert: Expert }) {
  const rating = expert.rating_average ? expert.rating_average.toFixed(1) : "جديد"

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-black/10 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(85,214,194,0.28),rgba(126,221,241,0.18),rgba(184,167,255,0.18))]" />

      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <Link to={`/experts/${expert.id}`} className="shrink-0">
            <img
              src={expert.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=07111f&color=fff`}
              alt={expert.name}
              className="h-[72px] w-[72px] rounded-md object-cover shadow-md ring-4 ring-white"
            />
          </Link>

          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 shadow-sm ring-1 ring-black/10">
              <BadgeCheck className="h-3.5 w-3.5" />
              معتمد
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white shadow-sm">
              <Star className="h-3.5 w-3.5 fill-sun text-sun" />
              {rating}
            </span>
          </div>
        </div>

        <Link to={`/experts/${expert.id}`} className="mt-5 block text-xl font-black text-ink transition group-hover:text-primary-700">
          {expert.name}
        </Link>
        <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-500">{expert.title}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {expert.tracks.slice(0, 3).map((track) => (
            <span key={track.id} className="rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-black/10">
              {track.name}
            </span>
          ))}
        </div>
      </div>

      <p className="line-clamp-3 min-h-20 px-5 text-sm leading-7 text-slate-600">{expert.bio}</p>

      <div className="mx-5 mt-4 grid grid-cols-2 gap-2 rounded-md bg-paper p-3 text-xs font-bold text-slate-700 ring-1 ring-black/10">
        <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-2 ring-1 ring-black/5">
          <BriefcaseBusiness className="h-4 w-4 text-primary-700" />
          {expert.years_of_experience} سنوات خبرة
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-2 ring-1 ring-black/5">
          <Clock className="h-4 w-4 text-primary-600" />
          {expert.session_duration_minutes} د
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/10 p-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <CalendarCheck2 className="h-3.5 w-3.5" />
            يبدأ من
          </span>
          <span className="mt-1 block text-lg font-black text-ink">{formatCurrency(expert.hourly_price)}</span>
        </div>
        <ButtonLink to={`/experts/${expert.id}`} size="sm" className="px-4">
          عرض الخبير
          <ArrowLeft className="h-4 w-4" />
        </ButtonLink>
      </div>
    </article>
  )
}
