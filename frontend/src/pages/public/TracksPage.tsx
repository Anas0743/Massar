import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Route } from "lucide-react"
import { LoadingState } from "../../components/LoadingState"
import { SectionHeader } from "../../components/SectionHeader"
import { ButtonLink } from "../../components/ui/Button"
import { publicAPI } from "../../services/api"

export function TracksPage() {
  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })

  return (
    <section className="masar-grain relative -mt-20 min-h-screen bg-paper pb-16 pt-28">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary-100/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionHeader
            eyebrow="المجالات"
            title="مسارات تقنية تساعدك تختار سؤال الجلسة"
            description="كل مسار يعرض لك خبراء مناسبين ونوع المشكلات التي يمكنك مناقشتها."
          />
        </div>
        {tracks.isLoading ? (
          <LoadingState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {tracks.data?.map((track) => (
              <article key={track.id} className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:-translate-y-2 hover:border-primary-500/35 hover:bg-white hover:shadow-float">
                <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/18" />
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-700">
                    <Route className="h-6 w-6" />
                  </span>
                  <span className="h-2 w-16 rounded-full bg-coral/70 transition group-hover:w-24" />
                </div>
                <h2 className="mt-5 text-xl font-black text-ink">{track.name}</h2>
                <p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{track.description}</p>
                <ButtonLink to={`/experts?track=${track.slug}`} variant="secondary" className="mt-5 w-full">
                  خبراء المسار
                  <ArrowLeft className="h-4 w-4" />
                </ButtonLink>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

