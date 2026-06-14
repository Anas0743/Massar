import { cn, bookingStatusLabels, paymentStatusLabels } from "../lib/utils"
import type { BookingStatus, PaymentStatus } from "../types/models"

const bookingColors: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  rejected: "bg-rose-50 text-rose-700 ring-rose-100",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
}

const paymentColors: Record<PaymentStatus, string> = {
  unpaid: "bg-slate-100 text-slate-600 ring-slate-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  refunded: "bg-cyan-50 text-cyan-700 ring-cyan-100",
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1", bookingColors[status])}>
      {bookingStatusLabels[status]}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1", paymentColors[status])}>
      {paymentStatusLabels[status]}
    </span>
  )
}
