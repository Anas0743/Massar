import { useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { EmptyState } from "../../components/EmptyState"
import { ExpertCard } from "../../components/ExpertCard"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Select } from "../../components/ui/Field"
import { publicAPI } from "../../services/api"

export function ExpertsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [track, setTrack] = useState(searchParams.get("track") || "")
  const [maxPrice, setMaxPrice] = useState("")
  const [minRating, setMinRating] = useState("")

  const params = useMemo(
    () => ({
      search: search || undefined,
      track: track || undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      min_rating: minRating ? Number(minRating) : undefined,
    }),
    [search, track, maxPrice, minRating],
  )

  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })
  const experts = useQuery({ queryKey: ["experts", params], queryFn: () => publicAPI.experts(params) })

  return (
    <section className="masar-page-shell masar-grain relative -mt-20 min-h-screen overflow-hidden pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(126,221,241,0.18),transparent_32%),radial-gradient(circle_at_86%_66%,rgba(184,167,255,0.16),transparent_36%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-7 flex max-w-md items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <div className="masar-progress h-2 flex-1 rounded-full shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-coral" />
          </div>
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink ring-1 ring-black/10 backdrop-blur">
            خبراء مسار
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-6xl">
            اختر الخبير الذي يفهم سؤالك
            <span className="masar-heading-gradient block pb-1">قبل أن تبدأ الجلسة</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            فلترة بسيطة حسب المجال والسعر والتقييم، ثم صفحة تفاصيل واضحة لاختيار نوع الجلسة والموعد.
          </p>
        </div>

        <div className="masar-soft-panel relative mb-8 mt-12 overflow-hidden rounded-3xl border border-black/10 p-5 shadow-float backdrop-blur">
          <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech" />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-black text-ink">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div>
                <p>فلترة ذكية</p>
                <p className="mt-1 text-xs font-bold text-slate-500">غيّر المعايير وشاهد النتائج مباشرة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200">
                {experts.data?.length ?? 0} خبير
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setTrack("")
                  setMaxPrice("")
                  setMinRating("")
                }}
              >
                تصفير
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="بحث بالاسم أو المهارة">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pr-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="React, CV, AI..." />
              </div>
            </Field>
            <Field label="المجال">
              <Select value={track} onChange={(event) => setTrack(event.target.value)}>
                <option value="">كل المجالات</option>
                {tracks.data?.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="أعلى سعر">
              <Input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="مثال: 35" />
            </Field>
            <Field label="أقل تقييم">
              <Select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
                <option value="">أي تقييم</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
                <option value="5">5</option>
              </Select>
            </Field>
          </div>
        </div>

        {experts.isLoading ? (
          <LoadingState />
        ) : experts.data?.length ? (
          <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {experts.data.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد نتائج" description="جرّب تغيير المجال أو تخفيف الفلاتر." />
        )}
      </div>
    </section>
  )
}

