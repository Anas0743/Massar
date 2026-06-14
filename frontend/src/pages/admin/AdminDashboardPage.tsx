import { useQuery } from "@tanstack/react-query"
import { CalendarClock, CheckCircle2, MessageSquare, Star, UserRoundCheck, Users } from "lucide-react"
import { LoadingState } from "../../components/LoadingState"
import { StatCard } from "../../components/StatCard"
import { adminAPI } from "../../services/api"

export function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: adminAPI.stats })
  const messages = useQuery({ queryKey: ["admin-contact-messages"], queryFn: adminAPI.contactMessages })

  if (stats.isLoading) return <LoadingState />

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-6 shadow-float backdrop-blur">
        <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
        <h1 className="text-2xl font-black">لوحة الأدمن</h1>
        <p className="mt-2 text-sm text-slate-600">نظرة تشغيلية على الطلاب والخبراء والحجوزات والمحتوى.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="الطلاب" value={stats.data?.students_count ?? 0} icon={Users} />
        <StatCard title="الخبراء" value={stats.data?.experts_count ?? 0} icon={UserRoundCheck} />
        <StatCard title="الحجوزات" value={stats.data?.bookings_count ?? 0} icon={CalendarClock} />
        <StatCard title="مكتملة" value={stats.data?.completed_bookings_count ?? 0} icon={CheckCircle2} />
        <StatCard title="معلقة" value={stats.data?.pending_bookings_count ?? 0} icon={MessageSquare} />
        <StatCard title="متوسط التقييم" value={stats.data?.average_rating ?? 0} icon={Star} />
      </div>

      <section className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
        <h2 className="text-xl font-black">آخر رسائل التواصل</h2>
        <div className="mt-4 grid gap-3">
          {messages.data?.slice(0, 5).map((message) => (
            <div key={message.id} className="rounded-md bg-paper p-4 ring-1 ring-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-black">{message.name}</p>
                <span className="text-xs font-bold text-slate-500">{message.email}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{message.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
