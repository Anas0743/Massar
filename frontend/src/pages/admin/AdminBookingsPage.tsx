import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/StatusBadge"
import { Select } from "../../components/ui/Field"
import { formatCurrency, formatDateTime } from "../../lib/utils"
import { adminAPI, expertAPI } from "../../services/api"
import type { BookingStatus, PaymentStatus } from "../../types/models"

export function AdminBookingsPage() {
  const queryClient = useQueryClient()
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminAPI.bookings() })
  const status = useMutation({
    mutationFn: ({ id, next }: { id: number; next: BookingStatus }) => expertAPI.updateStatus(id, next),
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز")
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
  })
  const payment = useMutation({
    mutationFn: ({ id, next }: { id: number; next: PaymentStatus }) => adminAPI.updatePaymentStatus(id, next),
    onSuccess: () => {
      toast.success("تم تحديث حالة الدفع")
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
  })

  if (bookings.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur">
        <h1 className="text-2xl font-black">كل الحجوزات</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">تحكم بحالة الحجز والدفع اليدوي من مكان واحد.</p>
      </div>
      <div className="grid gap-4">
        {bookings.data?.map((booking) => (
          <article key={booking.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
            <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <BookingStatusBadge status={booking.status} />
                  {booking.payment ? <PaymentStatusBadge status={booking.payment.status} /> : null}
                </div>
                <h2 className="mt-3 font-black">{booking.session_type_name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  الطالب: {booking.student_name} - الخبير: {booking.expert_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatDateTime(booking.scheduled_at)} - {formatCurrency(booking.price)}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Select value={booking.status} onChange={(event) => status.mutate({ id: booking.id, next: event.target.value as BookingStatus })}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="rejected">rejected</option>
                </Select>
                <Select value={booking.payment?.status || "unpaid"} onChange={(event) => payment.mutate({ id: booking.id, next: event.target.value as PaymentStatus })}>
                  <option value="unpaid">unpaid</option>
                  <option value="paid">paid</option>
                  <option value="refunded">refunded</option>
                </Select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

