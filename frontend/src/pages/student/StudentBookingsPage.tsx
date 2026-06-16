import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { EmptyState } from "../../components/EmptyState"
import { LoadingState } from "../../components/LoadingState"
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/StatusBadge"
import { Button, ButtonLink } from "../../components/ui/Button"
import { formatCurrency, formatDateTime } from "../../lib/utils"
import { studentAPI } from "../../services/api"

export function StudentBookingsPage() {
  const queryClient = useQueryClient()
  const bookings = useQuery({ queryKey: ["student-bookings"], queryFn: studentAPI.bookings })
  const cancel = useMutation({
    mutationFn: studentAPI.cancelBooking,
    onSuccess: () => {
      toast.success("تم إلغاء الحجز")
      void queryClient.invalidateQueries({ queryKey: ["student-bookings"] })
    },
    onError: () => toast.error("تعذر إلغاء الحجز"),
  })

  if (bookings.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur">
        <h1 className="text-2xl font-black">حجوزاتي</h1>
        <p className="mt-2 text-sm text-slate-600">تابع الحالة ورابط الاجتماع والملخص بعد الجلسة.</p>
      </div>
      {bookings.data?.length ? (
        <div className="grid gap-4">
          {bookings.data.map((booking) => (
            <article key={booking.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
              <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <BookingStatusBadge status={booking.status} />
                    {booking.payment ? <PaymentStatusBadge status={booking.payment.status} /> : null}
                  </div>
                  <h2 className="mt-3 text-xl font-black text-ink">{booking.session_type_name}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    مع {booking.expert_name} - {formatDateTime(booking.scheduled_at)}
                  </p>
                  <p className="mt-2 text-sm font-black text-primary-700">{formatCurrency(booking.price)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink to={`/dashboard/bookings/${booking.id}`} variant="secondary">
                    عرض التفاصيل
                  </ButtonLink>
                  {["pending", "confirmed"].includes(booking.status) ? (
                    <Button variant="danger" onClick={() => cancel.mutate(booking.id)} disabled={cancel.isPending}>
                      إلغاء
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="لا توجد حجوزات" description="اختر خبيرًا واحجز أول جلسة." />
      )}
    </div>
  )
}

