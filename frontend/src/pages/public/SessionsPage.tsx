import { useQuery } from "@tanstack/react-query"
import { Clock, FileText } from "lucide-react"
import { LoadingState } from "../../components/LoadingState"
import { SectionHeader } from "../../components/SectionHeader"
import { ButtonLink } from "../../components/ui/Button"
import { formatCurrency } from "../../lib/utils"
import { publicAPI } from "../../services/api"

export function SessionsPage() {
  const sessions = useQuery({ queryKey: ["session-types"], queryFn: publicAPI.sessionTypes })

  return (
    <section className="masar-grain relative -mt-20 min-h-screen bg-paper pb-16 pt-28">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-coral/20 via-primary-100/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionHeader
            eyebrow="أنواع الجلسات"
            title="اختر النتيجة التي تريدها من الجلسة"
            description="كل جلسة مصممة لتقليل الحيرة وتقديم مخرجات واضحة قابلة للتنفيذ."
          />
        </div>
        {sessions.isLoading ? (
          <LoadingState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sessions.data?.map((session) => (
              <article key={session.id} className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur transition hover:-translate-y-2 hover:border-primary-500/35 hover:bg-white hover:shadow-float">
                <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/18" />
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-700">
                  <FileText className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-black text-ink">{session.name}</h2>
                <p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{session.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/10 pt-4 text-sm font-black">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    {session.duration_minutes} دقيقة
                  </span>
                  <span className="text-primary-700">{formatCurrency(session.base_price)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="masar-dark-panel relative mt-10 overflow-hidden rounded-3xl p-8 text-center text-white shadow-float">
          <div className="masar-progress absolute inset-x-0 top-0 h-1.5" />
          <h2 className="text-2xl font-black">لا تعرف أي جلسة تختار؟</h2>
          <p className="mt-3 text-slate-200">ابدأ بجلسة تحديد المسار، ثم يوجهك الخبير للخطوة التالية.</p>
          <ButtonLink to="/experts" className="mt-6" variant="secondary">
            تصفح الخبراء
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

