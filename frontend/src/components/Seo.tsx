import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const defaultDescription =
  "مسار منصة إرشاد وحجز جلسات لطلاب وخريجي أقسام IT مع خبراء معتمدين وخطط متابعة عملية."

const metadata = [
  { pattern: /^\/$/, title: "مسار - إرشاد مهني لطلاب IT", description: defaultDescription },
  { pattern: /^\/experts$/, title: "الخبراء - مسار", description: "تصفح خبراء مسار واحجز جلسة إرشاد مناسبة لمسارك التقني." },
  { pattern: /^\/experts\/[^/]+$/, title: "تفاصيل الخبير - مسار", description: "تعرف على خبرة المرشد، الجلسات المتاحة، وآراء الطلاب قبل الحجز." },
  { pattern: /^\/tracks$/, title: "المجالات التقنية - مسار", description: "استكشف مسارات Frontend وBackend وData وDevOps وغيرها لاختيار طريقك بوضوح." },
  { pattern: /^\/sessions$/, title: "أنواع الجلسات - مسار", description: "اختر نوع الجلسة المناسب: مراجعة CV، خطة 30 يوم، مشروع تخرج، أو تحضير مقابلات." },
  { pattern: /^\/about$/, title: "من نحن - مسار", description: "تعرف على فكرة مسار وكيف تساعد الطلاب والخريجين على اتخاذ خطوات تقنية أوضح." },
  { pattern: /^\/contact$/, title: "تواصل معنا - مسار", description: "تواصل مع فريق مسار للاستفسارات، الشراكات، أو دعم الحجوزات." },
  { pattern: /^\/privacy$/, title: "سياسة الخصوصية - مسار", description: "تعرف على كيفية تعامل مسار مع بيانات الحسابات والحجوزات والدفع." },
  { pattern: /^\/terms$/, title: "شروط الاستخدام - مسار", description: "شروط استخدام منصة مسار للحجوزات، الحسابات، الجلسات، والدفع اليدوي." },
  { pattern: /^\/refund-policy$/, title: "سياسة الإلغاء والاسترداد - مسار", description: "سياسة مسار للتعامل مع الإلغاء، الاسترداد، وحالات النزاع." },
  { pattern: /^\/login$/, title: "تسجيل الدخول - مسار", description: "ادخل إلى حسابك في مسار لمتابعة حجوزاتك وجلساتك." },
  { pattern: /^\/register$/, title: "إنشاء حساب - مسار", description: "أنشئ حساب طالب في مسار وابدأ رحلتك مع الإرشاد التقني." },
]

function upsertMeta(selector: string, create: () => HTMLMetaElement, value: string) {
  const element = document.head.querySelector(selector) ?? create()
  element.setAttribute("content", value)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement("link")
    element.rel = "canonical"
    document.head.appendChild(element)
  }
  element.href = href
}

export function Seo() {
  const location = useLocation()

  useEffect(() => {
    const entry = metadata.find((item) => item.pattern.test(location.pathname))
    const title = entry?.title ?? "مسار - Masar"
    const description = entry?.description ?? defaultDescription
    const canonical = `${window.location.origin}${location.pathname}`

    document.title = title
    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
      return meta
    }, description)
    upsertMeta('meta[property="og:title"]', () => {
      const meta = document.createElement("meta")
      meta.setAttribute("property", "og:title")
      document.head.appendChild(meta)
      return meta
    }, title)
    upsertMeta('meta[property="og:description"]', () => {
      const meta = document.createElement("meta")
      meta.setAttribute("property", "og:description")
      document.head.appendChild(meta)
      return meta
    }, description)
    upsertCanonical(canonical)
  }, [location.pathname])

  return null
}
