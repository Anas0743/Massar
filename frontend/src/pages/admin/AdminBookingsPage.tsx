import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Input, Select } from "../../components/ui/Field"
import { formatCurrency, formatDateTime } from "../../lib/utils"
import { adminAPI } from "../../services/api"
import type { BookingStatus, PaymentStatus } from "../../types/models"

export function AdminBookingsPage() {
  const queryClient = useQueryClient()
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminAPI.bookings() })
  const status = useMutation({
    mutationFn: ({ id, next }: { id: number; next: BookingStatus }) => adminAPI.updateBookingStatus(id, next),
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز")
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
    onError: () => toast.error("تعذر تحديث حالة الحجز. تحقق من الدفع أو وقت الجلسة."),
  })
  const payment = useMutation({
    mutationFn: ({ id, next, reference }: { id: number; next: PaymentStatus; reference?: string }) =>
      adminAPI.updatePaymentStatus(id, next, reference),
    onSuccess: () => {
      toast.success("تم تحديث حالة الدفع")
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
    onError: () => toast.error("تعذر تحديث الدفع. مرجع الدفع مطلوب للحالات المدفوعة أو المستردة."),
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
              <div className="grid gap-3 xl:min-w-[420px]">
                <Select value={booking.status} onChange={(event) => status.mutate({ id: booking.id, next: event.target.value as BookingStatus })}>
                  <option value="pending">بانتظار المراجعة</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغى</option>
                  <option value="rejected">مرفوض</option>
                </Select>
                <form
                  className="grid gap-2 sm:grid-cols-[150px_1fr_auto]"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const formData = new FormData(event.currentTarget)
                    payment.mutate({
                      id: booking.id,
                      next: String(formData.get("payment_status")) as PaymentStatus,
                      reference: String(formData.get("transaction_reference") || "").trim(),
                    })
                  }}
                >
                  <Select name="payment_status" defaultValue={booking.payment?.status || "unpaid"}>
                    <option value="unpaid">غير مدفوع</option>
                    <option value="paid">مدفوع</option>
                    <option value="refunded">مسترد</option>
                  </Select>
                  <Input name="transaction_reference" defaultValue={booking.payment?.transaction_reference || ""} placeholder="مرجع الدفع" />
                  <Button type="submit" variant="secondary" disabled={payment.isPending}>
                    حفظ
                  </Button>
                </form>
                {booking.status === "pending" && booking.payment?.status !== "paid" ? (
                  <p className="text-xs font-bold leading-6 text-amber-700">يجب تأكيد الدفع قبل تحويل الحجز إلى مؤكد.</p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

