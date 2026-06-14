import { useQuery } from "@tanstack/react-query"
import { CalendarCheck, ClipboardList, Star, Users } from "lucide-react"
import { EmptyState } from "../../components/EmptyState"
import { ExpertCard } from "../../components/ExpertCard"
import { LoadingState } from "../../components/LoadingState"
import { StatCard } from "../../components/StatCard"
import { BookingStatusBadge } from "../../components/StatusBadge"
import { ButtonLink } from "../../components/ui/Button"
import { formatDateTime } from "../../lib/utils"
import { publicAPI, studentAPI } from "../../services/api"

export function StudentDashboardPage() {
  const bookings = useQuery({ queryKey: ["student-bookings"], queryFn: studentAPI.bookings })
  const experts = useQuery({ queryKey: ["experts", "student-suggested"], queryFn: () => publicAPI.experts({ min_rating: 0 }) })

  const upcoming = bookings.data?.filter((booking) => ["pending", "confirmed"].includes(booking.status)).slice(0, 3) ?? []
  const latestNote = bookings.data?.find((booking) => booking.session_note)?.session_note

  if (bookings.isLoading) return <LoadingState />

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-6 shadow-float backdrop-blur">
        <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-ink">لوحة الطالب</h1>
            <p className="mt-2 text-sm text-slate-600">تابع حجوزاتك والخطط المستلمة واقتراحات الخبراء.</p>
          </div>
          <ButtonLink to="/experts">حجز جلسة جديدة</ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="كل الحجوزات" value={bookings.data?.length ?? 0} icon={ClipboardList} />
        <StatCard title="الحجوزات القادمة" value={upcoming.length} icon={CalendarCheck} />
        <StatCard title="خطط مستلمة" value={bookings.data?.filter((booking) => booking.session_note).length ?? 0} icon={Star} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">الحجوزات القادمة</h2>
            <ButtonLink to="/dashboard/bookings" variant="secondary" size="sm">
              عرض الكل
            </ButtonLink>
          </div>
          {upcoming.length ? (
            <div className="grid gap-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="rounded-md bg-paper p-4 ring-1 ring-black/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{booking.session_type_name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {booking.expert_name} - {formatDateTime(booking.scheduled_at)}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد حجوزات قادمة" description="ابدأ بحجز جلسة مع خبير مناسب." />
          )}
        </div>

        <div className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
          <h2 className="text-xl font-black">آخر خطة مستلمة</h2>
          {latestNote ? (
            <div className="mt-4 rounded-md bg-primary-100/70 p-4 text-sm leading-7 text-primary-950 ring-1 ring-primary-200">
              <p className="font-black">ملخص الجلسة</p>
              <p className="mt-2">{latestNote.summary}</p>
              <p className="mt-3 font-black">الخطوة التالية</p>
              <p>{latestNote.next_steps || "راجع الخطة التفصيلية داخل صفحة الحجز."}</p>
            </div>
          ) : (
            <EmptyState title="لا توجد خطة بعد" description="ستظهر هنا بعد أن يرفع الخبير ملخص الجلسة." />
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-700" />
          <h2 className="text-xl font-black">خبراء مقترحون</h2>
        </div>
        {experts.isLoading ? (
          <LoadingState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {experts.data?.slice(0, 3).map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
