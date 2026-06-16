import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState } from "../../components/EmptyState"
import { LoadingState } from "../../components/LoadingState"
import { BookingStatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Field"
import { formatCurrency, formatDateTime } from "../../lib/utils"
import { expertAPI } from "../../services/api"
import type { BookingStatus } from "../../types/models"

export function ExpertBookingsPage() {
  const queryClient = useQueryClient()
  const bookings = useQuery({ queryKey: ["expert-bookings"], queryFn: expertAPI.bookings })
  const status = useMutation({
    mutationFn: ({ id, next }: { id: number; next: BookingStatus }) => expertAPI.updateStatus(id, next),
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز")
      void queryClient.invalidateQueries({ queryKey: ["expert-bookings"] })
    },
    onError: () => toast.error("تعذر تحديث الحالة"),
  })
  const meeting = useMutation({
    mutationFn: ({ id, meeting_url }: { id: number; meeting_url: string }) => expertAPI.updateMeetingUrl(id, meeting_url),
    onSuccess: () => {
      toast.success("تم حفظ رابط الاجتماع")
      void queryClient.invalidateQueries({ queryKey: ["expert-bookings"] })
    },
    onError: () => toast.error("تعذر حفظ الرابط"),
  })

  if (bookings.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur">
        <h1 className="text-2xl font-black">حجوزات الخبير</h1>
        <p className="mt-2 text-sm text-slate-600">اقبل أو ارفض الطلبات، أضف رابط الاجتماع، وأغلق الجلسة بعد انتهائها.</p>
      </div>
      {bookings.data?.length ? (
        <div className="grid gap-4">
          {bookings.data.map((booking) => (
            <article key={booking.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
              <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <BookingStatusBadge status={booking.status} />
                  <h2 className="mt-3 text-xl font-black">{booking.student_name}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.session_type_name} - {formatDateTime(booking.scheduled_at)}
                  </p>
                  <p className="mt-2 text-sm font-black text-primary-700">{formatCurrency(booking.price)}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{booking.student_message}</p>
                </div>
                <div className="grid min-w-72 gap-3">
                  {booking.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="success" onClick={() => status.mutate({ id: booking.id, next: "confirmed" })}>
                        قبول
                      </Button>
                      <Button className="flex-1" variant="danger" onClick={() => status.mutate({ id: booking.id, next: "rejected" })}>
                        رفض
                      </Button>
                    </div>
                  ) : null}
                  {booking.status === "confirmed" ? (
                    <Button variant="secondary" onClick={() => status.mutate({ id: booking.id, next: "completed" })}>
                      وضعها مكتملة
                    </Button>
                  ) : null}
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const formData = new FormData(event.currentTarget)
                      meeting.mutate({ id: booking.id, meeting_url: String(formData.get("meeting_url")) })
                    }}
                  >
                    <Input name="meeting_url" defaultValue={booking.meeting_url || ""} placeholder="Google Meet / Zoom" />
                    <Button type="submit" variant="secondary">
                      حفظ
                    </Button>
                  </form>
                  {["confirmed", "completed"].includes(booking.status) ? (
                    <Link className="masar-gradient rounded-full px-4 py-3 text-center text-sm font-black text-white shadow-sm" to={`/expert/session-notes/${booking.id}`}>
                      ملخص الجلسة
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="لا توجد حجوزات" />
      )}
    </div>
  )
}

