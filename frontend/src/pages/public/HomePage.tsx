import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  Code2,
  Compass,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers3,
  MessageCircle,
  Quote,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState } from "../../components/EmptyState"
import { ExpertCard } from "../../components/ExpertCard"
import { LoadingState } from "../../components/LoadingState"
import { ButtonLink } from "../../components/ui/Button"
import { ar } from "../../i18n/ar"
import { publicAPI } from "../../services/api"

type IconItem = {
  title: string
  description: string
  icon: LucideIcon
}

type ActionItem = IconItem & {
  action: string
  to: string
}

const quickIntents: ActionItem[] = [
  {
    title: "محتار في المسار",
    description: "ابدأ بجلسة تحديد المسار",
    action: "اختيار المسار",
    to: "/sessions",
    icon: Compass,
  },
  {
    title: "جاهزية التقديم",
    description: "CV وLinkedIn وGitHub",
    action: "مراجعة الملف",
    to: "/sessions",
    icon: ClipboardCheck,
  },
  {
    title: "مقابلة تدريب",
    description: "محاكاة وأسئلة وتقييم",
    action: "تجهيز مقابلة",
    to: "/experts?track=career",
    icon: BriefcaseBusiness,
  },
  {
    title: "مشروع تخرج",
    description: "فكرة وخطة تنفيذ تقنية",
    action: "توجيه المشروع",
    to: "/sessions",
    icon: GraduationCap,
  },
]

const steps: IconItem[] = [
  { title: "اختر نوع المشكلة", description: "حدد هل تحتاج مسار تعلم، مراجعة CV، مشروع تخرج، أو تجهيز مقابلة.", icon: Compass },
  { title: "قارن الخبراء", description: "اطلع على التخصصات، التقييم، السعر، والوقت المناسب لك.", icon: Users },
  { title: "احجز جلسة قصيرة", description: "اكتب سؤالك الأساسي فقط، ثم اختر الموعد ونوع الجلسة.", icon: CalendarCheck2 },
  { title: "استلم خطة قابلة للتنفيذ", description: "يحصل الطالب على ملخص واضح وخطوة تالية بدل النصائح العامة.", icon: FileCheck2 },
]

const platformProducts: IconItem[] = [
  {
    title: "جلسات إرشاد تقنية",
    description: "جلسة مركزة مع خبير في المجال الذي تريد دخوله أو تطوير مستواك فيه.",
    icon: MessageCircle,
  },
  {
    title: "مراجعة جاهزية التوظيف",
    description: "CV وLinkedIn وGitHub ومقابلات تدريب أو Junior بعيون خبير عملي.",
    icon: ClipboardCheck,
  },
  {
    title: "خطة تعلم ومشروع",
    description: "خطة 30 يوم، اختيار مشروع تخرج، ومصادر مناسبة لمستواك الحالي.",
    icon: BookOpenCheck,
  },
]

const reasons: IconItem[] = [
  {
    title: "مخصص لطلاب IT",
    description: "الأسئلة، أنواع الجلسات، والمسارات مبنية حول واقع الطالب والخريج التقني.",
    icon: GraduationCap,
  },
  {
    title: "لا تضيع بين الخيارات",
    description: "المسارات وأنواع الجلسات واضحة، والطالب يبدأ من مشكلة محددة لا من نموذج طويل.",
    icon: Target,
  },
  {
    title: "خبراء وسير عمل حقيقي",
    description: "حجوزات، توفر، روابط اجتماع، ملاحظات جلسة، وتقييمات داخل منصة واحدة.",
    icon: ShieldCheck,
  },
]

const trackIcons = [BrainCircuit, Code2, BriefcaseBusiness, Layers3, ShieldCheck, Route, Zap, Sparkles]

const sessionOutcomeRows = [
  { label: "ملخص الجلسة", value: "أين أنت الآن؟ وما القرار الذي اتفقتم عليه؟", icon: FileText },
  { label: "نقاط القوة", value: "المهارات الجيدة التي يمكن البناء عليها فورًا.", icon: CheckCircle2 },
  { label: "نقاط التحسين", value: "أولويات واضحة بدل قائمة طويلة من النصائح.", icon: Target },
  { label: "خطة 30 يوم", value: "مهام أسبوعية، مصادر، ومخرج قابل للعرض.", icon: CalendarCheck2 },
]

const testimonials = [
  {
    quote: "كنت محتارًا بين Frontend وMobile. بعد جلسة واحدة خرجت بخطة أسبوعية ومشروع صغير أبدأ به فورًا.",
    name: "طالب سنة ثالثة",
    meta: "Computer Science",
  },
  {
    quote: "مراجعة GitHub كشفت لي أشياء ما كنت منتبهًا لها. التعديلات التي أخذتها للجلسة حسنت مقابلاتي كثيرًا.",
    name: "خريج جديد",
    meta: "Backend Track",
  },
  {
    quote: "أجمل شيء أن الجلسة لم تكن كلامًا عامًا. أخذت مصادر، أولويات، وخطوة تالية واضحة لمشروع التخرج.",
    name: "فريق مشروع تخرج",
    meta: "AI / Data",
  },
]

function HomeSection({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "start"
}) {
  return (
    <div className={align === "center" ? "mx-auto mb-10 max-w-3xl text-center" : "mb-10 max-w-3xl"}>
      <p className="inline-flex rounded-full border border-black/10 bg-white/85 px-4 py-1.5 text-sm font-black text-primary-700 shadow-sm">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  )
}

export function HomePage() {
  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })
  const experts = useQuery({ queryKey: ["experts", "featured"], queryFn: () => publicAPI.experts({ min_rating: 0 }) })
  const sessions = useQuery({ queryKey: ["session-types"], queryFn: publicAPI.sessionTypes })
  const faqs = useQuery({ queryKey: ["faqs"], queryFn: publicAPI.faqs })

  const trackCount = tracks.data?.length || 8
  const expertCount = experts.data?.length || 7
  const sessionCount = sessions.data?.length || 7

  return (
    <>
      <section className="relative -mt-20 min-h-[860px] overflow-hidden bg-ink pt-20 text-white">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2200&q=88"
          alt="طلاب تقنية يناقشون خطة تعلم مع خبير"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,20,0.42)_0%,rgba(17,17,20,0.68)_48%,rgba(17,17,20,0.94)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-paper to-transparent" />
        <div className="masar-hero-lines absolute inset-0 opacity-50" />

        <div className="relative mx-auto flex min-h-[780px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-sun" />
              منصة إرشاد وحجز جلسات لطلاب وخريجي الـ IT
            </p>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              {ar.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-9 text-white/82 sm:text-xl">{ar.hero.description}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/experts" size="lg" className="h-14 px-7 text-base">
                {ar.hero.primary}
                <ArrowLeft className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink to="/sessions" variant="secondary" size="lg" className="h-14 px-7 text-base">
                استكشف أنواع الجلسات
              </ButtonLink>
            </div>

            <div className="mt-8 max-w-5xl rounded-md border border-white/16 bg-white/[0.08] p-3 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="px-2 text-sm font-black text-white">ابدأ من مشكلتك الحالية</p>
                <Link to="/tracks" className="inline-flex items-center gap-2 px-2 text-sm font-black text-primary-50 transition hover:text-white">
                  عرض كل المجالات
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {quickIntents.map((intent) => (
                  <Link
                    key={intent.title}
                    to={intent.to}
                    className="group rounded-md border border-white/12 bg-white/[0.08] p-3 transition hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.13] sm:p-4"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-ink sm:h-9 sm:w-9">
                      <intent.icon className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="mt-3 text-sm font-black text-white">{intent.title}</h3>
                    <p className="mt-1 text-xs font-bold leading-6 text-white/62">{intent.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-primary-50 transition group-hover:gap-2 group-hover:text-white">
                      {intent.action}
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-12 grid gap-3 text-sm font-bold text-white/78 sm:grid-cols-3 lg:max-w-4xl">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary-500" />
              خبراء معتمدون من الأدمن
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-aqua" />
              حجز سريع بدون فورم طويل
            </span>
            <span className="inline-flex items-center gap-2">
              <FileText className="h-5 w-5 text-coral" />
              ملخص وخطة بعد الجلسة
            </span>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-paper pb-12">
        <div className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:-mt-16 lg:px-8">
          <div className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
            <div className="masar-progress h-1.5" />
            <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div className="border-b border-black/10 p-6 lg:border-b-0 lg:border-l">
                <p className="text-sm font-black text-primary-700">Masar MVP</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-ink">منصة حجز وإرشاد، لا صفحة تعريف فقط</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  الطالب يرى المجال، الخبير، الجلسة، والحجز في تدفق واحد واضح.
                </p>
              </div>
              {[
                { value: trackCount, label: "مجالات تقنية جاهزة", icon: Route },
                { value: expertCount, label: "خبير يمكن الحجز معه", icon: Users },
                { value: sessionCount, label: "نوع جلسة للطالب", icon: Layers3 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 border-b border-black/10 p-6 last:border-b-0 lg:border-b-0 lg:border-l">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-ink text-white">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="block text-3xl font-black text-ink">{item.value}</span>
                    <span className="text-sm font-bold text-slate-500">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSection
            eyebrow="منتجات مسار"
            title="كل ما يحتاجه الطالب ليتحرك من الحيرة إلى التنفيذ"
            description="بدل أن يبحث الطالب في عشرات المصادر، يدخل مسار ويختار نوع المساعدة المناسبة: إرشاد، مراجعة، مقابلة، أو خطة تعلم."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {platformProducts.map((product, index) => (
              <article
                key={product.title}
                className="group relative overflow-hidden rounded-md border border-black/10 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-float"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#111114,#2fa891,#6d5dfc)]" />
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-paper text-primary-700 ring-1 ring-black/10">
                    <product.icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-black text-ink">{product.title}</h3>
                <p className="mt-3 text-sm leading-8 text-slate-600">{product.description}</p>
                <div className="mt-6 border-t border-black/10 pt-4">
                  <Link to="/sessions" className="inline-flex items-center gap-2 text-sm font-black text-primary-700 transition group-hover:gap-3">
                    اعرف المزيد
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16">
        <div className="masar-grid absolute inset-0 opacity-80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSection eyebrow="كيف تعمل مسار؟" title="تجربة حجز قصيرة، ونتيجة واضحة بعد الجلسة" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-md border border-black/10 bg-white/92 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-float">
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-ink text-white">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <span className="text-3xl font-black text-slate-200">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-black text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <HomeSection
              align="start"
              eyebrow="ماذا تستلم بعد الجلسة؟"
              title="ليست جلسة كلام وانتهت، بل وثيقة تساعدك تتحرك بعدها"
              description="بعد انتهاء الجلسة يستطيع الخبير رفع ملخص واضح داخل لوحة الطالب: ماذا ناقشتم، أين قوتك، ما الذي يحتاج تحسينًا، وما خطة الشهر القادم."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/experts" size="lg">
                احجز جلسة مع خبير
                <ArrowLeft className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink to="/sessions" variant="secondary" size="lg">
                أنواع الجلسات
              </ButtonLink>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
            <div className="masar-progress h-1.5" />
            <div className="p-6">
              <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-primary-700">نموذج خطة طالب</p>
                  <h3 className="mt-2 text-2xl font-black text-ink">خطة Frontend خلال 30 يوم</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    مثال على شكل المخرجات التي تظهر للطالب داخل لوحة التحكم بعد الجلسة.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 ring-1 ring-primary-100">
                  <CheckCircle2 className="h-4 w-4" />
                  مكتملة
                </span>
              </div>

              <div className="divide-y divide-black/10">
                {sessionOutcomeRows.map((row) => (
                  <div key={row.label} className="grid gap-3 py-5 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-paper text-ink ring-1 ring-black/10">
                        <row.icon className="h-5 w-5" />
                      </span>
                      <span className="font-black text-ink">{row.label}</span>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="-mx-6 -mb-6 mt-2 bg-ink px-6 py-5 text-white">
                <p className="text-sm font-black text-primary-500">الخطوة التالية</p>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  ابن صفحة Portfolio صغيرة، ارفعها على GitHub، ثم احجز مراجعة ثانية خلال أسبوعين لقياس التحسن.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <HomeSection
              align="start"
              eyebrow="المجالات"
              title="مسارات تقنية واضحة بدل قائمة خيارات مربكة"
              description="كل مسار يقود الطالب إلى خبراء مناسبين ونوع جلسة أقرب لسؤاله الحالي."
            />

            {tracks.isLoading ? (
              <LoadingState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {tracks.data?.slice(0, 8).map((track, index) => {
                  const Icon = trackIcons[index % trackIcons.length]
                  return (
                    <Link
                      key={track.id}
                      to={`/experts?track=${track.slug}`}
                      className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowLeft className="h-5 w-5 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-primary-700" />
                      </div>
                      <h3 className="mt-5 font-black text-ink">{track.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{track.description}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-black text-primary-50">
              لماذا مسار؟
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              لأن المشكلة غالبًا ليست نقص المصادر، بل غياب القرار التالي.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
              الطالب لا يحتاج آلاف الروابط. يحتاج خبيرًا يسمع سياقه، يراجع وضعه الحالي، ويعطيه خطة عملية تناسب وقته ومستواه.
            </p>

            <div className="mt-8 grid gap-4">
              {reasons.map((reason) => (
                <div key={reason.title} className="flex gap-4 rounded-md border border-white/12 bg-white/[0.06] p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-ink">
                    <reason.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-black">{reason.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-white/68">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[440px] overflow-hidden rounded-md border border-white/12 bg-white/[0.06] shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=86"
              alt="طالب يراجع خطة تقنية على جهازه"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/64 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-ink">
                <CheckCircle2 className="h-4 w-4 text-primary-700" />
                ناتج ملموس بعد الجلسة
              </div>
              <h3 className="text-2xl font-black">ملخص، نقاط قوة وضعف، خطة 30 يوم، ومصادر مقترحة.</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">
                هذا هو الفرق بين جلسة استشارة عامة وجلسة مبنية لتساعد طالب IT على اتخاذ خطوة قابلة للقياس.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSection
            eyebrow="خبراء مميزون"
            title="ابدأ مع خبير يعرف تحديات طلبة الـ IT"
            description="بطاقات الخبراء تعرض المجال، الخبرة، السعر، والتقييم حتى تختار بسرعة."
          />
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSection eyebrow="أنواع الجلسات" title="اختر الجلسة حسب النتيجة التي تريدها" />
          {sessions.isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.data?.slice(0, 6).map((session) => (
                <article key={session.id} className="rounded-md border border-black/10 bg-paper p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-float">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white text-coral ring-1 ring-black/10">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-black/10">
                      {session.duration_minutes} دقيقة
                    </span>
                  </div>
                  <h3 className="mt-5 font-black text-ink">{session.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{session.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomeSection eyebrow="آراء الطلاب" title="ما الذي يتغير بعد جلسة واضحة؟" />
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((story) => (
              <article key={story.name} className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
                <Quote className="h-8 w-8 text-primary-600" />
                <p className="mt-5 min-h-28 text-sm leading-8 text-slate-700">{story.quote}</p>
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
                  <div>
                    <h3 className="font-black text-ink">{story.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{story.meta}</p>
                  </div>
                  <div className="flex text-sun" aria-label="تقييم خمسة نجوم">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <HomeSection eyebrow="FAQ" title="أسئلة سريعة قبل أول حجز" />
          <div className="grid gap-3">
            {faqs.data?.map((faq) => (
              <details key={faq.id} className="group rounded-md border border-black/10 bg-paper p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-ink">
                  {faq.question}
                  <ChevronLeft className="h-5 w-5 shrink-0 text-slate-400 transition group-open:-rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-white">
        <div className="masar-hero-lines absolute inset-0 opacity-40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-primary-500">ابدأ من سؤال واحد</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              احجز جلسة قصيرة واخرج بخطوة تعرف ماذا تفعل بعدها.
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/70">
              اختر الخبير أو نوع الجلسة، والباقي يكون داخل لوحة الطالب والخبير من الحجز إلى ملخص الجلسة.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink to="/experts" size="lg" className="h-14 px-7">
              تصفح الخبراء
              <ArrowLeft className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink to="/tracks" variant="secondary" size="lg" className="h-14 px-7">
              اختر المسار
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
