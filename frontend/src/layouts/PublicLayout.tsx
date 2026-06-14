import { Menu, X } from "lucide-react"
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

function dashboardPath(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "expert") return "/expert/dashboard"
  return "/dashboard"
}

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  const nav = (
    <nav className="flex flex-col gap-2 lg:flex-row lg:items-center">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "rounded-full px-3 py-2 text-sm font-black text-slate-800 transition hover:bg-primary-50 hover:text-primary-700",
              isActive && "bg-ink text-white shadow-sm ring-1 ring-black/10 hover:bg-ink hover:text-white",
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/80 bg-white/[0.97] px-4 py-3 shadow-[0_18px_55px_rgba(17,17,20,0.22)] ring-1 ring-black/[0.04] backdrop-blur-2xl sm:px-5 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-lg font-black text-white shadow-md shadow-black/15">
              م
            </span>
            <span>
              <span className="block text-lg font-black text-ink">{ar.brand}</span>
              <span className="block text-xs font-bold text-slate-500">{ar.brandEn}</span>
            </span>
          </Link>

          <div className="hidden lg:block">{nav}</div>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <ButtonLink to={dashboardPath(user.role)} variant="secondary">
                  {ar.nav.dashboard}
                </ButtonLink>
                <Button variant="ghost" onClick={logout}>
                  خروج
                </Button>
              </>
            ) : (
              <>
                <ButtonLink to="/login" variant="ghost">
                  {ar.nav.login}
                </ButtonLink>
                <ButtonLink to="/register">{ar.nav.register}</ButtonLink>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="القائمة">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {open ? (
          <div className="mx-3 mt-3 rounded-md border border-black/10 bg-white px-4 py-4 shadow-float lg:hidden">
            {nav}
            <div className="mt-4 flex gap-2">
              {user ? (
                <ButtonLink to={dashboardPath(user.role)} className="flex-1" onClick={() => setOpen(false)}>
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

      <footer className="border-t border-black/10 bg-white/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-lg font-black text-white">م</span>
              <span className="text-lg font-black">مسار</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              منصة إرشاد وحجز جلسات تساعد طلاب وخريجي الـ IT على اختيار الخطوة القادمة بثقة.
            </p>
          </div>
          <div>
            <h3 className="font-black">روابط سريعة</h3>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
              <Link to="/experts">الخبراء</Link>
              <Link to="/tracks">المجالات</Link>
              <Link to="/sessions">أنواع الجلسات</Link>
            </div>
          </div>
          <div>
            <h3 className="font-black">جاهز لخطوة واضحة؟</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">ابدأ بحجز جلسة قصيرة، واخرج بخطة عملية بدل الحيرة.</p>
            <ButtonLink to="/experts" className="mt-4">
              تصفح الخبراء
            </ButtonLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
