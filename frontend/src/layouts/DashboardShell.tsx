import { LogOut } from "lucide-react"
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
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-black/10 bg-white/88 p-5 shadow-float backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-xl font-black text-white shadow-md shadow-black/15">
            م
          </span>
          <div>
            <p className="text-lg font-black">مسار</p>
            <p className="text-xs font-bold text-slate-500">{title}</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-full px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-black/[0.04]",
                  isActive && "bg-primary-50 text-primary-700 ring-1 ring-primary-100",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/88 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold text-slate-500">مرحبًا</p>
              <h1 className="text-lg font-black text-ink">{user?.name}</h1>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
          <nav className="flex flex-wrap gap-2 px-4 pb-3 lg:hidden">
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
