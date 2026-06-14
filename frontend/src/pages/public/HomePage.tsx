import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, CalendarCheck, CheckCircle2, Compass, FileText, Route, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState } from "../../components/EmptyState"
import { ExpertCard } from "../../components/ExpertCard"
import { LoadingState } from "../../components/LoadingState"
import { SectionHeader } from "../../components/SectionHeader"
import { ButtonLink } from "../../components/ui/Button"
import { ar } from "../../i18n/ar"
import { publicAPI } from "../../services/api"

const steps = [
  { title: "اختر المجال", description: "حدد نوع المشكلة أو المسار التقني الذي يشغلك.", icon: Compass },
  { title: "اختر الخبير", description: "قارن الخبراء حسب التخصص والسعر والتقييم.", icon: Users },
  { title: "احجز الجلسة", description: "اختر نوع الجلسة والوقت واكتب رسالة قصيرة.", icon: CalendarCheck },
  { title: "احصل على خطة واضحة", description: "بعد الجلسة تستلم ملخصًا وخطة عملية.", icon: CheckCircle2 },
]

const reasons = [
  "مصممة خصيصًا لطلاب وخريجي IT",
  "جلسات قصيرة بنتيجة عملية قابلة للتنفيذ",
  "خبراء في البرمجة، البيانات، الأمن، DevOps، والمسار المهني",
  "لوحات واضحة للطالب والخبير والأدمن",
]

export function HomePage() {
  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })
  const experts = useQuery({ queryKey: ["experts", "featured"], queryFn: () => publicAPI.experts({ min_rating: 0 }) })
  const sessions = useQuery({ queryKey: ["session-types"], queryFn: publicAPI.sessionTypes })
  const faqs = useQuery({ queryKey: ["faqs"], queryFn: publicAPI.faqs })

  return (
    <>
      <section className="masar-grain relative -mt-20 min-h-[760px] overflow-hidden bg-paper pt-20 text-ink">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85"
          alt="طلاب تقنية في جلسة تعلم"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/92 to-paper" />
        <div className="relative mx-auto flex min-h-[740px] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mb-8 flex w-full max-w-xl items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <div className="masar-progress h-2 flex-1 rounded-full shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-coral" />
          </div>

          <p className="text-6xl font-black tracking-normal text-ink sm:text-7xl lg:text-8xl">Masar</p>
          <p className="mt-3 text-lg font-black text-primary-700">اكتشف مسارك التقني بثقة</p>

          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
            {ar.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-9 text-slate-700 sm:text-lg">{ar.hero.description}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/experts" size="lg">
              {ar.hero.primary}
              <ArrowLeft className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink to="/tracks" variant="secondary" size="lg">
              اختر المسار أولًا
            </ButtonLink>
          </div>

          <div className="mt-12 grid w-full max-w-3xl gap-4 text-center sm:grid-cols-3">
            {[
              ["تقييم دقيق", "افهم مستواك وسؤالك قبل اختيار الخبير", Compass],
              ["إرشاد مخصص", "جلسة تناسب تخصصك ووقتك وهدفك", Users],
              ["نتائج ملموسة", "ملخص وخطة 30 يوم بعد الجلسة", CheckCircle2],
            ].map(([title, text, Icon]) => (
              <div key={title as string} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-soft backdrop-blur">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-primary-100 text-primary-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-black text-ink">{title as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="كيف تعمل مسار؟" title="أربع خطوات فقط من الحيرة إلى خطة واضحة" />
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-100 text-primary-700 ring-1 ring-primary-200">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="font-black text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="المجالات" title="اختر المسار الأقرب لسؤالك الآن" />
          {tracks.isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tracks.data?.slice(0, 8).map((track) => (
                <Link key={track.id} to={`/experts?track=${track.slug}`} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
                  <Route className="mb-4 h-7 w-7 text-aqua" />
                  <h3 className="font-black text-ink">{track.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{track.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="خبراء مميزون" title="ابدأ مع خبير يعرف تحديات طلبة الـ IT" />
          {experts.isLoading ? (
            <LoadingState />
          ) : experts.data?.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {experts.data.slice(0, 6).map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          ) : (
            <EmptyState title="لا يوجد خبراء بعد" description="شغل seed data لعرض الخبراء التجريبيين." />
          )}
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="أنواع الجلسات" title="جلسات قصيرة بنتيجة ملموسة" />
          {sessions.isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.data?.slice(0, 6).map((session) => (
                <div key={session.id} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
                  <FileText className="mb-4 h-7 w-7 text-coral" />
                  <h3 className="font-black text-ink">{session.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{session.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black text-primary-700">لماذا مسار؟</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink">لأن الطالب لا يحتاج معلومات أكثر فقط، بل قرارًا أوضح</h2>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              مسار تجمع الحجز، التخصص، التوفر، ملخص الجلسة، والمراجعات في تجربة واحدة تساعد الطالب على التحرك.
            </p>
            <div className="mt-6 grid gap-3">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3 rounded-md bg-white/88 p-4 ring-1 ring-black/10">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-coral" />
                  <span className="text-sm font-bold text-slate-700">{reason}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md bg-ink p-6 text-white shadow-soft">
            <Sparkles className="h-9 w-9 text-sun" />
            <h3 className="mt-6 text-2xl font-black">بعد الجلسة ستحصل على خطة عملية</h3>
            <p className="mt-4 leading-8 text-slate-200">
              ملخص، نقاط قوة وضعف، خطة 30 يوم، مصادر، وخطوة تالية. هذه هي النتيجة التي تجعل الحجز يستحق وقت الطالب.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title="أسئلة سريعة قبل أول حجز" />
          <div className="grid gap-3">
            {faqs.data?.map((faq) => (
              <details key={faq.id} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
                <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="text-3xl font-black">ابدأ من سؤال واحد، واخرج بخطوة واضحة</h2>
            <p className="mt-3 text-primary-50">تصفح الخبراء واختر الجلسة المناسبة لمشكلتك الحالية.</p>
          </div>
          <ButtonLink to="/experts" variant="secondary" size="lg">
            احجز جلستك الآن
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
