import { useQuery } from "@tanstack/react-query"
import { CalendarClock, CheckCircle2, Clock, Star } from "lucide-react"
import { LoadingState } from "../../components/LoadingState"
import { StatCard } from "../../components/StatCard"
import { BookingStatusBadge } from "../../components/StatusBadge"
import { ButtonLink } from "../../components/ui/Button"
import { formatDateTime } from "../../lib/utils"
import { expertAPI } from "../../services/api"

export function ExpertDashboardPage() {
  const profile = useQuery({ queryKey: ["expert-profile"], queryFn: expertAPI.profile })
  const bookings = useQuery({ queryKey: ["expert-bookings"], queryFn: expertAPI.bookings })

  if (profile.isLoading || bookings.isLoading) return <LoadingState />

  const upcoming = bookings.data?.filter((booking) => ["pending", "confirmed"].includes(booking.status)).slice(0, 4) ?? []
  const completed = bookings.data?.filter((booking) => booking.status === "completed").length ?? 0

  return (
    <div className="space-y-8">
      <div className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur">
        <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black">لوحة الخبير</h1>
            <p className="mt-2 text-sm text-slate-600">
              {profile.data?.is_approved ? "حسابك مفعل ويمكن للطلاب الحجز معك." : "حسابك بانتظار موافقة الأدمن."}
            </p>
          </div>
          <ButtonLink to="/expert/availability">تعديل التوفر</ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="الحجوزات القادمة" value={upcoming.length} icon={CalendarClock} />
        <StatCard title="كل الجلسات" value={bookings.data?.length ?? 0} icon={Clock} />
        <StatCard title="مكتملة" value={completed} icon={CheckCircle2} />
        <StatCard title="متوسط التقييم" value={profile.data?.rating_average || "جديد"} icon={Star} />
      </div>

      <section className="rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">الحجوزات القادمة</h2>
          <ButtonLink to="/expert/bookings" variant="secondary" size="sm">
            إدارة الحجوزات
          </ButtonLink>
        </div>
        <div className="grid gap-3">
          {upcoming.map((booking) => (
            <div key={booking.id} className="rounded-3xl bg-paper p-4 ring-1 ring-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black">{booking.student_name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.session_type_name} - {formatDateTime(booking.scheduled_at)}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

