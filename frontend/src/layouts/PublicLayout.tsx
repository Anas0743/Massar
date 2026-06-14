import { ArrowLeft, BookOpenCheck, CalendarCheck2, CheckCircle2, CreditCard, LayoutDashboard, LogOut, Mail, Menu, ShieldCheck, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { ar } from "../i18n/ar"
import { cn } from "../lib/utils"
import { useAuth } from "../hooks/useAuth"
import { Button, ButtonLink } from "../components/ui/Button"

const navItems = [
  { to: "/", label: ar.nav.home },
  { to: "/experts", label: ar.nav.experts },
  { to: "/tracks", label: ar.nav.tracks },
  { to: "/sessions", label: ar.nav.sessions },
  { to: "/about", label: ar.nav.about },
  { to: "/contact", label: ar.nav.contact },
]

const footerLinks = [
  {
    title: "المنصة",
    links: [
      { to: "/experts", label: "الخبراء" },
      { to: "/tracks", label: "المجالات" },
      { to: "/sessions", label: "أنواع الجلسات" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { to: "/about", label: "من نحن" },
      { to: "/contact", label: "تواصل معنا" },
      { to: "/login", label: "تسجيل الدخول" },
    ],
  },
]

const footerTrustItems = [
  { label: "حجوزات منظمة", icon: CalendarCheck2 },
  { label: "دفع يدوي في MVP", icon: CreditCard },
  { label: "خبراء بموافقة الإدارة", icon: ShieldCheck },
]

const socialLinks = [
  { href: "https://www.linkedin.com", label: "LinkedIn", mark: "in" },
  { href: "https://github.com", label: "GitHub", mark: "GH" },
  { href: "https://x.com", label: "X", mark: "X" },
  { href: "https://www.instagram.com", label: "Instagram", mark: "IG" },
]

function dashboardPath(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "expert") return "/expert/dashboard"
  return "/dashboard"
}

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  const nav = (
    <nav className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "relative rounded-full px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-white hover:text-ink hover:shadow-sm",
              isActive &&
                "bg-ink text-white shadow-sm ring-1 ring-black/10 after:absolute after:-bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary-500 hover:bg-ink hover:text-white",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-3 z-40 px-3">
        <div className="masar-glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-3 py-2.5 sm:px-4 lg:px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-lg font-black text-white shadow-md shadow-black/15">
              <span className="absolute -left-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary-500 text-[9px] text-ink ring-2 ring-white">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
              م
            </span>
            <span className="leading-none">
              <span className="block text-lg font-black text-ink">{ar.brand}</span>
              <span className="mt-1 block text-[11px] font-bold text-slate-500">IT Guidance Marketplace</span>
            </span>
          </Link>

          <div className="hidden lg:block">{nav}</div>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <ButtonLink to={dashboardPath(user.role)} variant="secondary">
                  <LayoutDashboard className="h-4 w-4" />
                  {ar.nav.dashboard}
                </ButtonLink>
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <ButtonLink to="/login" variant="secondary">
                  {ar.nav.login}
                </ButtonLink>
                <ButtonLink to="/register">
                  {ar.nav.register}
                  <ArrowLeft className="h-4 w-4" />
                </ButtonLink>
              </>
            )}
          </div>

          <Button variant="secondary" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="القائمة">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {open ? (
          <div className="masar-glass mx-3 mt-3 rounded-md px-4 py-4 lg:hidden">
            {nav}
            <div className="mt-4 flex gap-2">
              {user ? (
                <ButtonLink to={dashboardPath(user.role)} className="flex-1" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  {ar.nav.dashboard}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to="/login" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                    {ar.nav.login}
                  </ButtonLink>
                  <ButtonLink to="/register" className="flex-1" onClick={() => setOpen(false)}>
                    {ar.nav.register}
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="relative overflow-hidden border-t border-primary-500/25 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(126,221,241,0.15),transparent_28%),radial-gradient(circle_at_88%_70%,rgba(184,167,255,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 xl:px-0">
          <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white/84 px-6 py-5 text-center shadow-sm backdrop-blur">
            <p className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
              <Sparkles className="h-4 w-4 text-primary-600" />
              معلومة مهمة
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              الدفع في نسخة MVP يدوي، مع مساحة جاهزة لاحقًا للربط مع Stripe أو CliQ أو Zain Cash.
            </p>
          </div>

          <div className="mt-12 grid gap-10 border-t border-black/10 pt-12 lg:grid-cols-[1.25fr_0.9fr_0.95fr] lg:items-start">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-ink text-xl font-black text-white shadow-md shadow-black/15">
                  <span className="absolute -left-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary-500 text-[9px] text-ink ring-2 ring-white">
                    <Sparkles className="h-2.5 w-2.5" />
                  </span>
                  م
                </span>
                <span>
                  <span className="block text-2xl font-black text-ink">{ar.brand}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">IT Guidance Marketplace</span>
                </span>
              </Link>

              <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600">
                منصة إرشاد وحجز جلسات تساعد طلاب وخريجي أقسام IT على اختيار المسار، تجهيز الملف المهني، وبناء خطة عملية بعد كل جلسة.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {footerTrustItems.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-paper px-3 py-2 text-xs font-black text-slate-600">
                    <item.icon className="h-4 w-4 text-primary-700" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-black text-ink">{group.title}</h3>
                  <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600">
                    {group.links.map((item) => (
                      <Link key={item.to} to={item.to} className="transition hover:-translate-x-1 hover:text-primary-700">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/74 p-6 shadow-sm backdrop-blur">
              <h3 className="font-black text-ink">جاهز لخطوة أوضح؟</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">ابدأ بسؤال واحد، واختر جلسة قصيرة مع خبير يفهم تحديات طالب التقنية.</p>
              <ButtonLink to="/experts" className="mt-5 h-12 px-6">
                تصفح الخبراء
                <ArrowLeft className="h-4 w-4" />
              </ButtonLink>

              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-paper text-xs font-black text-ink transition hover:-translate-y-1 hover:bg-ink hover:text-white hover:shadow-md"
                  >
                    {social.mark}
                  </a>
                ))}
                <Link
                  to="/contact"
                  aria-label="تواصل عبر البريد"
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-paper text-ink transition hover:-translate-y-1 hover:bg-primary-500 hover:shadow-md"
                >
                  <Mail className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-black/10 pt-6 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 مسار. جميع الحقوق محفوظة.</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary-700" />
                حماية حسابات وأدوار واضحة
              </span>
              <Link to="/contact" className="transition hover:text-primary-700">
                سياسة التواصل والخصوصية
              </Link>
              <Link to="/sessions" className="transition hover:text-primary-700">
                شروط الحجز
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-slate-600 ring-1 ring-black/10">
                <BookOpenCheck className="h-4 w-4 text-signal" />
                MVP جاهز للتطوير
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
