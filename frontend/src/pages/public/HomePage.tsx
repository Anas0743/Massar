import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  ArrowLeft,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Compass,
  FileText,
  GraduationCap,
  Layers3,
  MessageCircle,
  Plus,
  Quote,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { EmptyState } from "../../components/EmptyState"
import { LoadingState } from "../../components/LoadingState"
import { ButtonLink } from "../../components/ui/Button"
import { formatCurrency } from "../../lib/utils"
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
    description: "جلسة تحدد الاتجاه المناسب لمستواك",
    action: "حدد مسارك",
    to: "/sessions",
    icon: Compass,
  },
  {
    title: "جاهزية التقديم",
    description: "مراجعة CV وLinkedIn وGitHub",
    action: "راجع ملفك",
    to: "/sessions",
    icon: ClipboardCheck,
  },
  {
    title: "مقابلة تدريب",
    description: "محاكاة وأسئلة وتقييم نقاط الضعف",
    action: "تجهز الآن",
    to: "/experts?track=career",
    icon: BriefcaseBusiness,
  },
  {
    title: "مشروع تخرج",
    description: "فكرة وخطة تنفيذ ومراجعة تقنية",
    action: "ابدأ المشروع",
    to: "/sessions",
    icon: GraduationCap,
  },
]

const trackIcons = [BrainCircuit, Code2, BriefcaseBusiness, Layers3, ShieldCheck, Route, Zap, Sparkles]

const audienceTabs = [
  {
    title: "طلاب وخريجي الثانوية",
    headline: "لطلاب وخريجي الثانوية",
    description: "اكتشف المجال الجامعي الأقرب لشخصيتك وابدأ مبكرًا بخطة تقنية واضحة.",
    cta: "احجز جلستك الإرشادية",
    to: "/sessions",
    icon: GraduationCap,
    points: [
      "اكتشف اهتماماتك ومهاراتك بوضوح.",
      "حدد التخصص الجامعي المناسب لك بثقة.",
      "اصنع خطة متكاملة لرحلتك الجامعية.",
      "طور هويتك المهنية وابن حضورك التقني مبكرًا.",
    ],
  },
  {
    title: "طلاب وخريجي الجامعة",
    headline: "لطلاب وخريجي الجامعة",
    description: "حوّل سنوات الجامعة إلى مسار عملي: مشاريع، مهارات، وخطة دخول سوق العمل.",
    cta: "ابن خطتك الجامعية",
    to: "/sessions",
    icon: Code2,
    points: [
      "حدد المجال التقني الأقرب لمهاراتك.",
      "ابن مشروعًا مناسبًا لمسارك.",
      "رتب GitHub وLinkedIn قبل التقديم.",
      "احصل على خطة تعلم عملية خلال 30 يوم.",
    ],
  },
  {
    title: "للباحثين عن عمل",
    headline: "للباحثين عن عمل",
    description: "جهز ملفك ومقابلاتك وخطتك للتقديم بوضوح بدل التجربة العشوائية.",
    cta: "جهز ملفك المهني",
    to: "/experts?track=career",
    icon: BriefcaseBusiness,
    points: [
      "راجع CV وLinkedIn وGitHub.",
      "تدرّب على أسئلة مقابلات Junior.",
      "حدد فجواتك التقنية قبل التقديم.",
      "اخرج بخطة تقديم أسبوعية واضحة.",
    ],
  },
]

const careerFileBenefits = [
  { label: "متوافق مع أنظمة ATS", value: "نراجع السيرة من ناحية الكلمات المفتاحية، الوضوح، وترتيب الخبرات.", icon: CheckCircle2 },
  { label: "ملف تقني متكامل", value: "نربط CV مع LinkedIn وGitHub حتى تظهر مشاريعك بطريقة تقنع صاحب العمل.", icon: FileText },
  { label: "خطة تحسين سريعة", value: "تخرج بقائمة تعديلات عملية قبل التقديم أو مقابلة التدريب القادمة.", icon: Target },
]

const articleCards = [
  {
    title: "كيف تختار مسار IT بدون أن تضيع بين الخيارات؟",
    excerpt: "طريقة عملية تقارن بين شغفك، مستواك الحالي، وفرص السوق قبل أن تبدأ التعلم.",
    category: "اختيار المسار",
    readTime: "5 دقائق قراءة",
    to: "/tracks",
    icon: Compass,
  },
  {
    title: "ما الذي يجب أن يظهر في GitHub قبل أول تدريب؟",
    excerpt: "أفكار لترتيب المشاريع والـ README والكوميتات حتى يفهم الخبير أو الشركة مستواك بسرعة.",
    category: "GitHub",
    readTime: "6 دقائق قراءة",
    to: "/sessions",
    icon: Code2,
  },
  {
    title: "جلسة إرشاد واحدة: ماذا يمكن أن تغيّر فعليًا؟",
    excerpt: "كيف تخرج من جلسة قصيرة بقرار واضح وخطة أسبوعية بدل قائمة نصائح عامة.",
    category: "إرشاد مهني",
    readTime: "4 دقائق قراءة",
    to: "/experts",
    icon: MessageCircle,
  },
]

const testimonialStats = [
  { value: "جلسة واحدة", label: "وضوح في القرار التالي", icon: Target },
  { value: "30 يوم", label: "خطة قابلة للمتابعة", icon: CalendarCheck2 },
  { value: "3 ملفات", label: "CV وLinkedIn وGitHub بصورة أقوى", icon: ClipboardCheck },
]

const testimonials = [
  {
    quote: "كنت محتارًا بين تطوير الواجهات وتطبيقات الجوال. بعد جلسة واحدة خرجت بخطة أسبوعية ومشروع صغير أبدأ به فورًا.",
    name: "طالب سنة ثالثة",
    meta: "Computer Science",
    focus: "اختيار المسار",
    before: "تشتت بين الواجهات وتطبيقات الجوال",
    after: "خطة أسبوعية ومشروع بداية",
    result: "مشروع أول قابل للعرض",
    icon: Compass,
  },
  {
    quote: "مراجعة GitHub كشفت لي أشياء ما كنت منتبهًا لها. التعديلات التي أخذتها للجلسة حسنت مقابلاتي كثيرًا.",
    name: "خريج جديد",
    meta: "Backend Track",
    focus: "جاهزية التقديم",
    before: "مشاريع موجودة لكن غير واضحة",
    after: "README وترتيب أقوى للملف",
    result: "مقابلات أكثر ثقة",
    icon: ClipboardCheck,
  },
  {
    quote: "الجلسة لم تكن كلامًا عامًا. أخذت مصادر، أولويات، وخطوة تالية واضحة لمشروع التخرج.",
    name: "فريق مشروع تخرج",
    meta: "AI / Data",
    focus: "مشروع التخرج",
    before: "فكرة واسعة بلا أولويات",
    after: "تقسيم عملي ومصادر دقيقة",
    result: "خطة تسليم أوضح",
    icon: GraduationCap,
  },
  {
    quote: "كنت أسمع نصائح كثيرة عن التخصص. المقارنة داخل الجلسة جعلت القرار مرتبطًا بميولي وفرص السوق.",
    name: "طالبة مقبلة على الجامعة",
    meta: "IT Orientation",
    focus: "تخصص الجامعة",
    before: "قرار مبني على آراء متفرقة",
    after: "مقارنة حسب الميول وفرص السوق",
    result: "اختيار أقرب بثقة",
    icon: Route,
  },
]

const heroProductTabs = [
  {
    title: "تحديد المسار",
    badge: "جلسة البداية",
    heading: "حدد الطريق المناسب لمستواك",
    description: "نراجع وضعك الحالي، وقتك المتاح، وهدفك، ثم نحول الحيرة إلى مسار واضح تبدأ به فورًا.",
    tags: ["45 دقيقة", "قرار واضح"],
    points: ["تحليل سريع لمستواك الحالي.", "اختيار مسار يناسب وقتك وهدفك.", "خطة أسبوع أول بدون تشتيت."],
    icon: Compass,
  },
  {
    title: "مراجعة الملف",
    badge: "جاهزية التقديم",
    heading: "اجعل CV وGitHub يحكيان عنك بوضوح",
    description: "يفحص الخبير ملفك بعين عملية: السيرة، LinkedIn، GitHub، وترتيب المشاريع قبل التقديم.",
    tags: ["CV", "LinkedIn", "GitHub"],
    points: ["ملاحظات مباشرة على نقاط الضعف.", "تحسين طريقة عرض المشاريع.", "قائمة تعديلات قبل التقديم."],
    icon: ClipboardCheck,
  },
  {
    title: "خطة 30 يوم",
    badge: "خطة تنفيذ",
    heading: "اخرج بخطة شهر قابلة للقياس",
    description: "تحصل على مهام أسبوعية، مصادر مناسبة، ومخرج عملي تضيفه إلى Portfolio أو مشروعك.",
    tags: ["30 يوم", "مصادر", "مخرجات"],
    points: ["تقسيم الخطة إلى أسابيع.", "مصادر حسب مستواك الحالي.", "مشروع صغير قابل للعرض."],
    icon: CalendarCheck2,
  },
]

function HeroProductPanel() {
  const [activeTab, setActiveTab] = useState(0)
  const active = heroProductTabs[activeTab]
  const ActiveIcon = active.icon

  const goToPrevious = () => setActiveTab((current) => (current === 0 ? heroProductTabs.length - 1 : current - 1))
  const goToNext = () => setActiveTab((current) => (current === heroProductTabs.length - 1 ? 0 : current + 1))

  return (
    <div className="relative">
      <div className="masar-dark-panel overflow-hidden rounded-3xl border border-white/50 shadow-[0_34px_90px_rgba(7,17,31,0.22)]">
        <div className="p-5 text-white lg:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-black lg:text-3xl">تجربة مسار</h2>
            <span className="masar-progress mx-auto mt-3 block h-1.5 w-24 rounded-full lg:mt-4" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.055] p-2 lg:mt-9" dir="ltr">
            <div className="grid grid-cols-3 items-center gap-2 text-center text-[11px] font-black text-white/58 sm:grid-cols-[32px_1fr_1fr_1fr_32px]">
              <button
                type="button"
                onClick={goToPrevious}
                className="hidden h-8 w-8 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white hover:text-ink sm:grid"
                aria-label="التبويب السابق"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {heroProductTabs.map((tab, index) => (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={
                    index === activeTab
                      ? "rounded-full bg-white px-3 py-2 text-ink shadow-sm transition"
                      : "rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
                  }
                  dir="rtl"
                >
                  {tab.title}
                </button>
              ))}
              <button
                type="button"
                onClick={goToNext}
                className="hidden h-8 w-8 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white hover:text-ink sm:grid"
                aria-label="التبويب التالي"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center text-center lg:mt-9">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#55d6c2,#b8a7ff)] text-ink shadow-glow lg:h-16 lg:w-16">
              <ActiveIcon className="h-7 w-7 lg:h-8 lg:w-8" />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/75 ring-1 ring-white/10">{active.badge}</span>
              {active.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-black text-white/75 ring-1 ring-white/10">
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="mt-4 text-2xl font-black lg:mt-5 lg:text-3xl">{active.heading}</h3>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/68 lg:mt-4 lg:text-base lg:leading-8">
              {active.description}
            </p>

            <div className="mt-5 grid w-full gap-2 lg:mt-7 lg:gap-3">
              {active.points.map((item) => (
                <div key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2.5 text-sm font-bold text-white/82 lg:py-3">
                  <span>{item}</span>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-500" />
                </div>
              ))}
            </div>
          </div>

          <Link to="/sessions" className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#55d6c2,#7eddf1,#b8a7ff)] px-5 py-4 text-sm font-black text-ink shadow-glow transition hover:-translate-y-0.5 lg:mt-9">
            اعرف أنواع الجلسات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })
  const experts = useQuery({ queryKey: ["experts", "featured"], queryFn: () => publicAPI.experts({ min_rating: 0 }) })
  const sessions = useQuery({ queryKey: ["session-types"], queryFn: publicAPI.sessionTypes })
  const faqs = useQuery({ queryKey: ["faqs"], queryFn: publicAPI.faqs })
  const [activeAudience, setActiveAudience] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

  const trackCount = tracks.data?.length || 8
  const expertCount = experts.data?.length || 7
  const sessionCount = sessions.data?.length || 7
  const mentorExperts = experts.data || []
  const mentorStripExperts = mentorExperts.length ? [...mentorExperts, ...mentorExperts] : []
  const selectedAudience = audienceTabs[activeAudience] || audienceTabs[0]
  const SelectedAudienceIcon = selectedAudience.icon
  const [featuredTestimonial, ...impactTestimonials] = testimonials
  const FeaturedTestimonialIcon = featuredTestimonial.icon

  return (
    <>
      <section className="masar-page-shell masar-grain relative -mt-20 overflow-hidden pb-20 pt-36 sm:pt-40 lg:pb-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 md:grid-cols-[1fr_0.9fr] md:items-center lg:gap-16 lg:px-8 xl:gap-20 xl:px-0">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/88 px-4 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary-600" />
              منصة إرشاد IT للطلاب والخريجين
            </p>

            <h1 className="mt-8 text-5xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-[88px]">
              ابدأ رحلتك
              <span className="masar-heading-gradient block pb-2">التقنية بوضوح</span>
              مع مسار
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-9 text-slate-600">
              احجز جلسة مع خبير يساعدك تختار المجال، تراجع جاهزيتك، أو تبني خطة تعلم ومشروع واضح خلال 30 يوم.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/experts" size="lg" className="h-14 px-7 text-base">
                احجز جلستك الآن
                <ArrowLeft className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink to="/tracks" variant="secondary" size="lg" className="h-14 px-7 text-base">
                تصفح المجالات
              </ButtonLink>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { value: trackCount, label: "مسارات تقنية", icon: Route },
                { value: expertCount, label: "خبراء للإرشاد", icon: Users },
                { value: sessionCount, label: "أنواع جلسات", icon: Layers3 },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-black/10 bg-white/82 p-5 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-float">
                  <item.icon className="h-5 w-5 text-primary-700" />
                  <p className="mt-5 text-3xl font-black text-ink">{item.value}+</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-2 text-sm font-bold text-slate-500">
              <p>
                تحتاج إرشادًا لفريق أو جامعة؟{" "}
                <Link to="/contact" className="font-black text-primary-700 underline decoration-primary-300 underline-offset-4">
                  تواصل معنا
                </Link>
              </p>
              <p>
                تريد الانضمام كخبير؟{" "}
                <Link to="/contact" className="font-black text-primary-700 underline decoration-primary-300 underline-offset-4">
                  أرسل طلبك
                </Link>
              </p>
            </div>
          </div>

          <HeroProductPanel />
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper py-24">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(85,214,194,0.11),transparent_38%),linear-gradient(245deg,rgba(184,167,255,0.13),transparent_42%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary-600" />
              تشخيص مسار تقني
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              اكتشف المجال الأنسب لك
              <span className="masar-heading-gradient block pb-1">والجلسة التي تحتاجها الآن</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              بدل أن تبدأ من قائمة طويلة، اختر حالتك الحالية وسيقودك مسار إلى نوع الجلسة والخطوة الأقرب لهدفك.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="text-center lg:text-right">
              <h3 className="text-3xl font-black leading-tight text-ink sm:text-4xl">ابدأ من سؤالك الحالي</h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-slate-600 sm:text-base lg:mx-0">
                لا تحتاج أن تعرف اسم المجال من البداية. اختر ما يصف وضعك، وسنوصلك إلى الخبير والجلسة المناسبة.
              </p>

              <div className="mt-7 grid gap-3">
                {[
                  "تحليل سريع للحالة الحالية والهدف.",
                  "اقتراح نوع الجلسة الأقرب للمشكلة.",
                  "خطة واضحة قابلة للتنفيذ بعد الحجز.",
                ].map((item) => (
                  <div key={item} className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-black/10 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm lg:mx-0">
                    <span>{item}</span>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" />
                  </div>
                ))}
              </div>

              <ButtonLink to="/sessions" size="lg" className="mt-8 h-14 px-7">
                اختر نوع الجلسة الآن
                <ArrowLeft className="h-5 w-5" />
              </ButtonLink>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-3xl border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,253,248,0.86),rgba(246,242,255,0.88))] p-6 shadow-[0_30px_90px_rgba(7,17,31,0.12)] sm:p-8">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink text-primary-500 shadow-float">
                  <Route className="h-8 w-8" />
                </div>
                <p className="mx-auto mt-4 w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-signal shadow-sm ring-1 ring-black/10">
                  خطتك جاهزة
                </p>

                <div className="relative mt-8 min-h-[310px]">
                  <div className="absolute left-1/2 top-0 h-[250px] w-px -translate-x-1/2 border-l-2 border-dashed border-primary-700/55" />
                  <div className="absolute left-[20%] top-[92px] h-px w-[60%] border-t-2 border-dashed border-primary-700/55" />
                  <div className="absolute left-[20%] top-[176px] h-px w-[60%] border-t-2 border-dashed border-primary-700/55" />

                  <div className="grid grid-cols-3 gap-5">
                    {quickIntents.slice(0, 3).map((intent, index) => (
                      <Link
                        key={intent.title}
                        to={intent.to}
                        className={
                          index === 1
                            ? "group relative z-10 mt-8 rounded-3xl border-2 border-primary-500 bg-white px-4 py-5 text-center shadow-float transition hover:-translate-y-1"
                            : "group relative z-10 mt-8 rounded-3xl border border-black/10 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-float"
                        }
                      >
                        <intent.icon className="mx-auto h-6 w-6 text-primary-700" />
                        <span className="mt-3 block text-sm font-black text-ink">{intent.title}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-5">
                    {[
                      { label: "مسار تعلم", active: true },
                      { label: "مراجعة ملف", active: false },
                      { label: "مشروع تخرج", active: true },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={
                          item.active
                            ? "relative z-10 rounded-3xl border-2 border-primary-500 bg-white px-4 py-5 text-center shadow-float"
                            : "relative z-10 rounded-3xl border border-black/10 bg-white px-4 py-5 text-center shadow-sm"
                        }
                      >
                        <span className="mx-auto block h-1.5 w-14 rounded-full bg-slate-400/70" />
                        <span className="mt-3 block text-xs font-black text-slate-500">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-5">
                    {quickIntents.slice(3).map((intent) => (
                      <Link
                        key={intent.title}
                        to={intent.to}
                        className="relative z-10 rounded-3xl border border-black/10 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-float"
                      >
                        <intent.icon className="mx-auto h-6 w-6 text-primary-700" />
                        <span className="mt-3 block text-sm font-black text-ink">{intent.title}</span>
                      </Link>
                    ))}
                    <Link to="/experts" className="relative z-10 rounded-3xl border-2 border-primary-500 bg-white px-4 py-5 text-center shadow-float transition hover:-translate-y-1">
                      <Users className="mx-auto h-6 w-6 text-primary-700" />
                      <span className="mt-3 block text-sm font-black text-ink">خبير مناسب</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#ffffff_100%)] py-24">
        <div className="masar-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_26%,rgba(126,221,241,0.18),transparent_30%),radial-gradient(circle_at_90%_72%,rgba(184,167,255,0.16),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <Route className="h-4 w-4 text-primary-700" />
              ابدأ من المجال
            </p>
            <h2 className="mt-7 text-4xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-6xl">
              اختر مسارك التقني
              <span className="masar-heading-gradient block pb-1">بدون ضياع بين الخيارات</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              ابدأ من المجال الأقرب لسؤالك، ثم انتقل مباشرة إلى خبراء وجلسات تناسب مستواك الحالي.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
            <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink p-7 text-white shadow-[0_34px_90px_rgba(7,17,31,0.2)]">
              <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
              <div className="absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-violetTech/20 blur-3xl" />
              <div className="relative">
                <span className="grid h-14 w-14 place-items-center rounded-3xl bg-white/10 text-aqua ring-1 ring-white/10">
                  <Compass className="h-7 w-7" />
                </span>
                <h3 className="mt-7 text-3xl font-black leading-tight">من أين أبدأ؟</h3>
                <p className="mt-4 text-sm leading-8 text-white/72">
                  إذا لم تكن متأكدًا من المجال، اختر جلسة تحديد المسار. وإذا كان المجال واضحًا، ابدأ من بطاقة المجال مباشرة.
                </p>

                <div className="mt-7 grid gap-3">
                  {[
                    "اقتراح خبراء حسب المسار.",
                    "ربط المجال بنوع الجلسة المناسب.",
                    "خطوة حجز مختصرة بلا فورم طويل.",
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/84">
                      <span>{item}</span>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-500" />
                    </div>
                  ))}
                </div>

                <ButtonLink to="/tracks" size="lg" className="mt-8 h-14 w-full">
                  عرض كل المجالات
                  <ArrowLeft className="h-5 w-5" />
                </ButtonLink>
              </div>
            </aside>

            {tracks.isLoading ? (
              <LoadingState />
            ) : tracks.isError ? (
              <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-sm font-bold text-slate-500 shadow-soft">
                تعذر تحميل المجالات الآن.
              </div>
            ) : tracks.data?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {tracks.data.slice(0, 8).map((track, index) => {
                  const Icon = trackIcons[index % trackIcons.length]
                  return (
                    <Link
                      key={track.id}
                      to={`/experts?track=${track.slug}`}
                      className="group relative min-h-[198px] overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-primary-500/35 hover:bg-white hover:shadow-float"
                    >
                      <div className="absolute inset-x-7 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech opacity-0 transition duration-300 group-hover:opacity-100" />
                      <div className="absolute -left-14 -bottom-14 h-36 w-36 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/18" />
                      <div className="relative flex items-start justify-between gap-4">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-paper text-primary-700 ring-1 ring-black/10 transition group-hover:-translate-y-1 group-hover:bg-primary-50">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="rounded-full bg-paper px-3 py-1.5 text-xs font-black text-slate-500 ring-1 ring-black/10">0{index + 1}</span>
                      </div>
                      <h3 className="relative mt-7 text-xl font-black text-ink transition group-hover:text-primary-700">{track.name}</h3>
                      <p className="relative mt-3 line-clamp-2 text-sm leading-7 text-slate-600">{track.description}</p>
                      <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-primary-700 transition group-hover:-translate-x-1">
                        خبراء هذا المجال
                        <ArrowLeft className="h-4 w-4" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyState title="لا توجد مجالات بعد" description="يمكن إضافة المجالات من لوحة الإدارة." />
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="masar-dark-panel overflow-hidden rounded-3xl px-6 py-10 text-white shadow-[0_30px_90px_rgba(7,17,31,0.18)] sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-center">
              <div className="text-center lg:text-right">
                <p className="text-3xl font-black leading-tight text-violetTech sm:text-4xl">
                  مرشدونا
                  <span className="block text-primary-500">التقنيون!</span>
                </p>
                <Link to="/experts" className="mt-6 inline-flex items-center gap-2 text-lg font-black text-coral transition hover:-translate-x-1 hover:text-white">
                  <ArrowLeft className="h-6 w-6" />
                  تصفح الكل
                </Link>
              </div>

              {experts.isLoading ? (
                <LoadingState />
              ) : mentorExperts.length ? (
                <div className="relative overflow-hidden" dir="ltr" aria-label="شريط مرشدين متحرك">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#07111f] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#07111f] to-transparent" />
                  <div className="masar-mentor-marquee flex w-max gap-8 py-2 hover:[animation-play-state:paused]">
                    {mentorStripExperts.map((expert, index) => (
                      <article key={`${expert.id}-${index}`} className="group w-52 shrink-0 text-center" dir="rtl">
                        <Link to={`/experts/${expert.id}`} className="mx-auto block w-fit">
                          <img
                            src={expert.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=55d6c2&color=07111f`}
                            alt={expert.name}
                            className="mx-auto h-20 w-20 rounded-full object-cover ring-8 ring-primary-500/90 transition group-hover:-translate-y-1 group-hover:ring-white"
                          />
                        </Link>
                        <h3 className="mt-5 text-lg font-black text-white">{expert.name}</h3>
                        <p className="mx-auto mt-2 line-clamp-3 max-w-[220px] text-xs font-bold leading-6 text-white/72">{expert.title || expert.bio}</p>
                        <div className="mt-3 flex justify-center text-sun" aria-label="تقييم الخبير">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                        <Link
                          to={`/experts/${expert.id}`}
                          className="mt-5 inline-flex rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-xs font-black text-white/86 transition hover:-translate-y-0.5 hover:bg-white hover:text-ink"
                        >
                          صفحة المرشد
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="لا يوجد خبراء بعد" description="شغل seed data لعرض الخبراء التجريبيين." />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(184,167,255,0.18),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(126,221,241,0.18),transparent_32%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <FileText className="h-4 w-4 text-primary-600" />
              مراجعة الملف المهني
            </p>
            <h2 className="mt-7 text-4xl font-black leading-[1.22] text-ink sm:text-5xl">
              جهز سيرتك وملفك التقني بثقة قبل التقديم
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
              جلسة مركزة تراجع CV وLinkedIn وGitHub، وتحوّل خبراتك ومشاريعك إلى ملف واضح ومقنع.
            </p>
          </div>

          <div className="mt-16 grid gap-12 min-[900px]:grid-cols-[0.92fr_1.08fr] min-[900px]:items-center">
            <div className="order-2 min-[900px]:order-2">
              <div className="rounded-3xl border border-black/10 bg-white/82 p-6 shadow-soft backdrop-blur sm:p-8">
                <p className="text-sm font-black text-primary-700">ابدأ تحسين ملفك الآن</p>
                <h3 className="mt-3 text-3xl font-black leading-tight text-ink">ملف تقديم يحكي عنك قبل المقابلة</h3>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  لا نضيف قالبًا جميلًا فقط؛ نرتب القصة المهنية، نبرز المشاريع، ونحدد ما يجب تعديله قبل إرسال أول طلب.
                </p>

                <div className="mt-7 grid gap-3">
                  {careerFileBenefits.map((benefit) => (
                    <div key={benefit.label} className="flex gap-4 rounded-2xl border border-black/10 bg-paper/80 p-4 transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-white hover:shadow-md">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-500/20">
                        <benefit.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="font-black text-ink">{benefit.label}</h4>
                        <p className="mt-1 text-sm leading-7 text-slate-600">{benefit.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to="/sessions" size="lg" className="h-14 px-8">
                    احجز مراجعة ملف
                    <ArrowLeft className="h-5 w-5" />
                  </ButtonLink>
                  <ButtonLink to="/experts?track=career" variant="secondary" size="lg" className="h-14 px-8">
                    خبراء التوظيف
                  </ButtonLink>
                </div>
              </div>
            </div>

            <div className="order-1 min-[900px]:order-1">
              <div className="masar-cv-stage group relative mx-auto min-h-[430px] max-w-[560px] overflow-visible rounded-3xl border border-black/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(238,253,248,0.82))] p-6 shadow-soft backdrop-blur sm:min-h-[500px]">
                <div className="absolute -left-10 top-12 h-44 w-44 rounded-full bg-violetTech/20 blur-3xl" />
                <div className="absolute -right-8 bottom-8 h-48 w-48 rounded-full bg-aqua/24 blur-3xl" />

                <div className="masar-cv-float masar-cv-float-late absolute left-6 top-24 w-[210px] sm:left-10 sm:top-28 sm:w-[250px]">
                  <article className="masar-cv-paper masar-cv-paper-back -rotate-6 rounded-2xl border border-black/10 bg-white p-4 shadow-soft">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="h-2 w-20 rounded-full bg-signal/80" />
                        <div className="mt-2 h-1.5 w-28 rounded-full bg-slate-200" />
                      </div>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-primary-700">
                        <FileText className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[72, 92, 84, 64, 78, 56].map((width) => (
                        <span key={width} className="block h-1.5 rounded-full bg-slate-200" style={{ width: `${width}%` }} />
                      ))}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <span className="h-10 rounded-xl bg-primary-50" />
                      <span className="h-10 rounded-xl bg-violetTech/20" />
                    </div>
                  </article>
                </div>

                <div className="masar-cv-float absolute right-4 top-8 w-[250px] sm:right-10 sm:w-[330px]">
                  <article className="masar-cv-paper masar-cv-paper-main rotate-2 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_34px_80px_rgba(7,17,31,0.16)]">
                    <div className="text-center">
                      <h4 className="text-sm font-black text-ink sm:text-base">Masar Candidate</h4>
                      <div className="mx-auto mt-2 h-1.5 w-28 rounded-full bg-slate-200" />
                      <div className="mx-auto mt-1.5 h-1.5 w-36 rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-5 space-y-4">
                      {["الملخص", "المشاريع", "المهارات", "التعليم"].map((section, index) => (
                        <div key={section}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black text-ink">{section}</span>
                            <span className="h-1.5 w-10 rounded-full bg-primary-500/70" />
                          </div>
                          <div className="space-y-1.5">
                            {[92, 82, 68].map((width) => (
                              <span
                                key={`${section}-${width}`}
                                className={`block h-1.5 rounded-full ${index % 2 === 0 ? "bg-slate-300" : "bg-slate-200"}`}
                                style={{ width: `${width}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className="masar-cv-float masar-cv-float-fast absolute bottom-8 left-[calc(50%_-_115px)] w-[230px] sm:left-[calc(50%_-_140px)] sm:w-[280px]">
                  <article className="masar-cv-paper masar-cv-paper-check rotate-1 rounded-2xl border border-primary-500/20 bg-white/94 p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary-700">Checklist</span>
                      <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="mt-4 grid gap-2">
                      {["ATS", "LinkedIn", "GitHub"].map((item) => (
                        <div key={item} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                          <span className="text-xs font-black text-slate-600">{item}</span>
                          <span className="mr-auto h-1.5 w-16 rounded-full bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(184,167,255,0.16),transparent_28%),radial-gradient(circle_at_86%_62%,rgba(126,221,241,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary-600" />
              خطة تناسب مرحلتك
            </p>
            <h2 className="mt-7 text-4xl font-black leading-[1.25] text-ink sm:text-5xl">
              نساعدك في بناء مستقبلك بخطوات واضحة
            </h2>
            <span className="mx-auto mt-5 block h-1 w-24 rounded-full bg-gradient-to-l from-violetTech via-aqua to-primary-500" />
          </div>

          <div className="mx-auto mt-11 grid max-w-3xl grid-cols-1 gap-2 rounded-full border border-black/10 bg-white/85 p-2 shadow-soft backdrop-blur sm:grid-cols-3">
            {audienceTabs.map((audience, index) => {
              const isActive = activeAudience === index

              return (
                <button
                  key={audience.title}
                  type="button"
                  onClick={() => setActiveAudience(index)}
                  className={`rounded-full px-5 py-4 text-sm font-black transition ${
                    isActive
                      ? "bg-gradient-to-l from-primary-500 via-aqua to-violetTech text-white shadow-lg shadow-primary-500/20"
                      : "text-slate-600 hover:bg-paper hover:text-ink"
                  }`}
                  aria-pressed={isActive}
                >
                  {audience.title}
                </button>
              )
            })}
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,250,252,0.84))] p-5 shadow-soft backdrop-blur sm:p-7 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-500/20">
                    <SelectedAudienceIcon className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-primary-700">مسار إرشادي مختصر</p>
                    <h3 className="mt-1 text-3xl font-black leading-tight text-ink sm:text-4xl">{selectedAudience.headline}</h3>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{selectedAudience.description}</p>

                <div className="mt-7 grid gap-3">
                  {selectedAudience.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/82 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-500/30 hover:shadow-md sm:px-5"
                    >
                      <span className="text-sm font-bold leading-7 text-slate-700 sm:text-base">{point}</span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-500/20 text-primary-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonLink to={selectedAudience.to} size="lg" className="h-14 px-8">
                    {selectedAudience.cta}
                    <ArrowLeft className="h-5 w-5" />
                  </ButtonLink>
                  <Link
                    to="/sessions"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-primary-700 hover:shadow-md"
                  >
                    تصفح أنواع الجلسات
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative min-h-[330px] overflow-hidden rounded-3xl border border-black/10 bg-[linear-gradient(145deg,rgba(245,238,255,0.9),rgba(232,252,247,0.9))] p-7 shadow-inner">
                  <div className="absolute -left-14 top-10 h-44 w-44 rounded-full bg-aqua/25 blur-3xl" />
                  <div className="absolute -right-16 bottom-4 h-44 w-44 rounded-full bg-violetTech/24 blur-3xl" />

                  <div className="relative mx-auto flex h-[276px] max-w-sm items-center justify-center">
                    <div className="absolute top-0 grid h-20 w-20 place-items-center rounded-full bg-ink text-primary-500 shadow-soft ring-8 ring-white/80">
                      <Route className="h-10 w-10" />
                    </div>

                    <div className="absolute top-20 rounded-full bg-white px-5 py-2 text-sm font-black text-signal shadow-soft ring-1 ring-black/10">
                      خطتك جاهزة
                    </div>

                    <div className="absolute left-5 top-32 h-16 w-28 rounded-2xl bg-white shadow-soft ring-1 ring-black/10">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-slate-300" />
                    </div>
                    <div className="absolute right-5 top-32 h-16 w-28 rounded-2xl bg-white shadow-soft ring-1 ring-black/10">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-slate-300" />
                    </div>
                    <div className="absolute top-32 h-16 w-28 rounded-2xl border-4 border-primary-500/80 bg-white shadow-soft">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-primary-700" />
                    </div>

                    <div className="absolute bottom-20 left-6 h-16 w-28 rounded-2xl border-4 border-primary-500/75 bg-white shadow-soft">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-primary-700" />
                    </div>
                    <div className="absolute bottom-20 h-16 w-28 rounded-2xl bg-white shadow-soft ring-1 ring-black/10">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-slate-300" />
                    </div>
                    <div className="absolute bottom-0 right-6 h-16 w-28 rounded-2xl border-4 border-primary-500/75 bg-white shadow-soft">
                      <span className="absolute left-5 top-7 h-1.5 w-14 rounded-full bg-primary-700" />
                    </div>

                    <span className="absolute top-[102px] h-16 border-r-2 border-dashed border-primary-700/60" />
                    <span className="absolute bottom-[100px] left-[78px] h-px w-48 border-t-2 border-dashed border-primary-700/60" />
                    <span className="absolute bottom-[68px] right-[84px] h-px w-44 border-t-2 border-dashed border-primary-700/60" />

                    {[["top-[116px]", "right-[155px]"], ["bottom-[88px]", "left-[56px]"], ["bottom-[52px]", "right-[74px]"]].map(([top, side]) => (
                      <span key={`${top}-${side}`} className={`absolute ${top} ${side} h-4 w-4 rounded-full bg-primary-500 ring-4 ring-white`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-black/10 pt-6">
              {sessions.isLoading ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {[1, 2, 3].map((item) => (
                    <span key={item} className="h-10 w-32 animate-pulse rounded-full bg-slate-200" />
                  ))}
                </div>
              ) : sessions.isError ? (
                <p className="text-center text-sm font-bold text-slate-500">تعذر تحميل أنواع الجلسات الآن.</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  {sessions.data?.slice(0, 6).map((session) => (
                    <Link
                      key={session.id}
                      to="/sessions"
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-500/40 hover:text-primary-700 hover:shadow-md"
                    >
                      <FileText className="h-4 w-4 text-signal" />
                      {session.name}
                      <span className="text-primary-700">{formatCurrency(session.base_price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_72%,rgba(126,221,241,0.16),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(184,167,255,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <BookOpenCheck className="h-4 w-4 text-primary-600" />
              مقالات وإرشادات متخصصة
            </p>
            <h2 className="mt-7 text-4xl font-black leading-[1.2] text-ink sm:text-5xl">
              طوّر معرفتك التقنية عبر محتوى مسار
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
              أفكار مختصرة تساعدك تفهم الطريق قبل الجلسة، وتحوّل الحيرة إلى أسئلة أفضل وخطوات أوضح.
            </p>
            <Link
              to="/tracks"
              className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#55d6c2,#7eddf1,#b8a7ff,#f6a7c9)] px-7 py-4 text-sm font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-float"
            >
              استكشف كل المسارات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {articleCards.map((article, index) => (
              <Link
                key={article.title}
                to={article.to}
                className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-7 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-primary-500/35 hover:shadow-float"
              >
                <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-l from-primary-500 via-aqua to-violetTech opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/16" />
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-paper text-primary-700 ring-1 ring-black/10 transition group-hover:bg-primary-50 group-hover:text-primary-700">
                    <article.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-black/10">0{index + 1}</span>
                </div>

                <h3 className="mt-7 text-xl font-black leading-9 text-ink transition group-hover:text-primary-700">{article.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-8 text-slate-600">{article.excerpt}</p>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5 text-xs font-black text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-primary-700 ring-1 ring-primary-500/15">
                    <Sparkles className="h-3.5 w-3.5" />
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarCheck2 className="h-4 w-4 text-slate-400" />
                    {article.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="masar-grain relative overflow-hidden bg-[linear-gradient(180deg,#f7fafc_0%,#ffffff_46%,#eefdf8_100%)] py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary-500/30 to-transparent" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
                <Quote className="h-4 w-4 text-primary-600" />
                آراء الطلاب بعد الجلسة
              </p>
              <h2 className="mt-7 max-w-3xl text-4xl font-black leading-[1.2] text-ink sm:text-5xl">
                تجارب توضّح ما الذي يتغير فعليًا
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                بدل اقتباسات عامة، نعرض الفرق الذي يلمسه الطالب: قرار أوضح، ملف أقوى، وخطوة تنفيذ تبدأ من نفس الأسبوع.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {testimonialStats.map((stat) => {
                const StatIcon = stat.icon

                return (
                  <div key={stat.label} className="rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-500/15">
                      <StatIcon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-lg font-black text-ink">{stat.value}</p>
                    <p className="mt-2 text-xs font-bold leading-6 text-slate-500">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.02fr_1.18fr] lg:items-stretch">
            <article className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-[0_28px_80px_rgba(7,17,31,0.22)] sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-primary-500 via-aqua to-coral" />
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-primary-500 ring-1 ring-white/15">
                  <FeaturedTestimonialIcon className="h-7 w-7" />
                </span>
                <div className="flex rounded-full bg-white/8 px-3 py-2 text-sun ring-1 ring-white/10" aria-label="تقييم خمسة نجوم">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="mt-8 text-2xl font-black leading-10 sm:text-3xl sm:leading-[1.7]">“{featuredTestimonial.quote}”</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-black text-white/45">قبل الجلسة</p>
                  <p className="mt-2 text-sm font-bold leading-7 text-white/82">{featuredTestimonial.before}</p>
                </div>
                <div className="rounded-3xl border border-primary-500/25 bg-primary-500/10 p-4">
                  <p className="text-xs font-black text-primary-500">بعد الجلسة</p>
                  <p className="mt-2 text-sm font-bold leading-7 text-white">{featuredTestimonial.after}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-black">{featuredTestimonial.name}</h3>
                  <p className="mt-1 text-sm font-bold text-white/52">{featuredTestimonial.meta}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-ink">
                  <CheckCircle2 className="h-4 w-4 text-primary-700" />
                  {featuredTestimonial.result}
                </span>
              </div>
            </article>

            <div className="grid gap-4">
              {impactTestimonials.map((story, index) => {
                const StoryIcon = story.icon

                return (
                  <article
                    key={story.name}
                    className="group grid gap-5 rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-float sm:grid-cols-[auto_1fr]"
                  >
                    <div className="flex items-start justify-between gap-3 sm:block">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-paper text-primary-700 ring-1 ring-black/10 transition group-hover:bg-primary-50">
                        <StoryIcon className="h-6 w-6" />
                      </span>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-black text-slate-400 ring-1 ring-black/10 sm:mt-4 sm:inline-flex">
                        0{index + 2}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 ring-1 ring-primary-500/15">
                          {story.focus}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                          <Sparkles className="h-3.5 w-3.5 text-signal" />
                          {story.result}
                        </span>
                      </div>

                      <p className="mt-4 text-sm font-medium leading-8 text-slate-700">{story.quote}</p>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-black/10 bg-paper px-4 py-3">
                          <p className="text-[11px] font-black text-slate-400">قبل</p>
                          <p className="mt-1 text-sm font-bold leading-7 text-slate-600">{story.before}</p>
                        </div>
                        <div className="rounded-2xl border border-primary-500/20 bg-primary-50 px-4 py-3">
                          <p className="text-[11px] font-black text-primary-700">بعد</p>
                          <p className="mt-1 text-sm font-bold leading-7 text-ink">{story.after}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                        <div>
                          <h3 className="font-black text-ink">{story.name}</h3>
                          <p className="mt-1 text-xs font-bold text-slate-500">{story.meta}</p>
                        </div>
                        <div className="flex text-sun" aria-label="تقييم خمسة نجوم">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_70%,rgba(126,221,241,0.14),transparent_26%),radial-gradient(circle_at_86%_14%,rgba(184,167,255,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary-600" />
              إجابات قبل أول جلسة
            </p>
            <h2 className="mt-7 text-4xl font-black leading-[1.2] text-ink sm:text-5xl">الأسئلة الشائعة</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
              إجابات سريعة على أهم ما يحتاج الطالب معرفته قبل اختيار الخبير أو نوع الجلسة.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4">
            {faqs.isLoading ? (
              <LoadingState />
            ) : faqs.isError ? (
              <div className="rounded-3xl border border-black/10 bg-white p-8 text-center text-sm font-bold text-slate-500 shadow-soft">
                تعذر تحميل الأسئلة الآن. حاول تحديث الصفحة لاحقًا.
              </div>
            ) : faqs.data?.length ? (
              faqs.data.map((faq, index) => {
                const isOpen = openFaq === index
                const answerId = `home-faq-answer-${faq.id}`

                return (
                  <article
                    key={faq.id}
                    className={`overflow-hidden rounded-3xl border transition duration-300 ${
                      isOpen
                        ? "border-primary-500/20 bg-white shadow-soft"
                        : "border-black/10 bg-white/86 shadow-sm hover:-translate-y-0.5 hover:border-primary-500/25 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-right sm:px-7 sm:py-6"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span className="text-base font-black leading-8 text-ink sm:text-lg">{faq.question}</span>
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-lg transition ${
                          isOpen
                            ? "bg-[linear-gradient(135deg,#55d6c2,#b8a7ff,#f6a7c9)]"
                            : "bg-primary-500 shadow-primary-500/20"
                        }`}
                      >
                        {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      </span>
                    </button>

                    {isOpen ? (
                      <div id={answerId} className="px-5 pb-7 sm:px-7">
                        <div className="border-t border-black/10 pt-5">
                          <p className="max-w-4xl text-sm font-medium leading-8 text-slate-600 sm:text-base">{faq.answer}</p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <EmptyState title="لا توجد أسئلة بعد" description="يمكن إضافة الأسئلة الشائعة من لوحة الإدارة." />
            )}
          </div>
        </div>
      </section>

      <section className="masar-dark-panel py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-primary-500">ابدأ من سؤال واحد</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">احجز جلسة قصيرة واخرج بخطوة تعرف ماذا تفعل بعدها.</h2>
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
