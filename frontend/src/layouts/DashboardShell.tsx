import { LogOut, Sparkles } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { cn } from "../lib/utils"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/ui/Button"
import type { LucideIcon } from "lucide-react"

export interface DashboardNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function DashboardShell({ title, navItems }: { title: string; navItems: DashboardNavItem[] }) {
  const { user, logout } = useAuth()

  return (
    <div className="masar-grain min-h-screen bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(126,221,241,0.14),transparent_30%),radial-gradient(circle_at_88%_74%,rgba(184,167,255,0.13),transparent_34%)]" />
      <aside className="fixed bottom-5 right-5 top-5 z-30 hidden w-72 overflow-hidden rounded-3xl border border-white/10 bg-ink p-5 text-white shadow-[0_30px_90px_rgba(7,17,31,0.24)] lg:block">
        <div className="absolute -left-20 top-10 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-52 w-52 rounded-full bg-violetTech/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-xl font-black text-ink shadow-md shadow-black/15">
            <span className="absolute -left-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-primary-500 text-[9px] text-ink ring-2 ring-ink">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
            م
          </span>
          <div>
            <p className="text-lg font-black">مسار</p>
            <p className="text-xs font-bold text-white/60">{title}</p>
          </div>
        </div>
        <nav className="relative mt-8 grid gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-full px-3 py-3 text-sm font-bold text-white/68 transition hover:bg-white/[0.08] hover:text-white",
                  isActive && "bg-white text-ink shadow-sm ring-1 ring-white/20",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="relative lg:pr-80">
        <header className="sticky top-3 z-20 px-3">
          <div className="masar-glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-bold text-slate-500">مرحبًا</p>
              <h1 className="text-lg font-black text-ink">{user?.name}</h1>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
          <nav className="masar-glass mx-1 mt-3 flex flex-wrap gap-2 rounded-3xl px-4 py-3 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-600",
                    isActive && "bg-primary-50 text-primary-700",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
