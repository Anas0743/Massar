import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = "JOD") {
  return new Intl.NumberFormat("ar-JO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-JO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function toDateTimeLocalValue(value?: string) {
  const date = value ? new Date(value) : new Date(Date.now() + 1000 * 60 * 60 * 24)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export const bookingStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  rejected: "مرفوض",
  cancelled: "ملغي",
  completed: "مكتمل",
}

export const paymentStatusLabels: Record<string, string> = {
  unpaid: "غير مدفوع",
  paid: "مدفوع",
  refunded: "مسترد",
}
