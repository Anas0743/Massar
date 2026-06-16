import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { LoadingState } from "../../components/LoadingState"
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Field, Select, Textarea } from "../../components/ui/Field"
import { formatCurrency, formatDateTime } from "../../lib/utils"
import { studentAPI } from "../../services/api"

const reviewSchema = z.object({
  rating: z.string().refine((value) => Number(value) >= 1 && Number(value) <= 5),
  comment: z.string().min(5, "اكتب تعليقًا قصيرًا").max(2000),
})

type ReviewForm = z.infer<typeof reviewSchema>

export function BookingDetailsPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const booking = useQuery({ queryKey: ["booking", id], queryFn: () => studentAPI.booking(id!), enabled: Boolean(id) })
  const form = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: "5", comment: "" } })
  const review = useMutation({
    mutationFn: (values: ReviewForm) => studentAPI.review(Number(id), { rating: Number(values.rating), comment: values.comment }),
    onSuccess: () => {
      toast.success("تم إرسال التقييم")
      void queryClient.invalidateQueries({ queryKey: ["booking", id] })
    },
    onError: () => toast.error("تعذر إرسال التقييم"),
  })

  if (booking.isLoading) return <LoadingState />
  if (!booking.data) return <p>الحجز غير موجود.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">تفاصيل الحجز #{booking.data.id}</h1>
        <p className="mt-2 text-sm text-slate-600">{booking.data.session_type_name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-5 shadow-float backdrop-blur">
          <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
          <div className="flex flex-wrap gap-2">
            <BookingStatusBadge status={booking.data.status} />
            {booking.data.payment ? <PaymentStatusBadge status={booking.data.payment.status} /> : null}
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-bold text-slate-500">الخبير</dt>
              <dd className="mt-1 font-black">{booking.data.expert_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">الموعد</dt>
              <dd className="mt-1 font-black">{formatDateTime(booking.data.scheduled_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">المدة</dt>
              <dd className="mt-1 font-black">{booking.data.duration_minutes} دقيقة</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">السعر</dt>
              <dd className="mt-1 font-black">{formatCurrency(booking.data.price)}</dd>
            </div>
          </dl>

          {booking.data.meeting_url ? (
            <a href={booking.data.meeting_url} target="_blank" rel="noreferrer" className="masar-gradient mt-6 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black text-white shadow-sm">
              فتح رابط الاجتماع
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-6 rounded-3xl bg-amber-50 p-4 text-sm font-bold text-amber-700">لم يضف الخبير رابط الاجتماع بعد.</p>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur">
          <h2 className="text-xl font-black">رسالتك للخبير</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{booking.data.student_message || "لا توجد رسالة."}</p>
          {booking.data.expert_message ? (
            <>
              <h2 className="mt-6 text-xl font-black">رد الخبير</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{booking.data.expert_message}</p>
            </>
          ) : null}
        </div>
      </div>

      {booking.data.session_note ? (
        <div className="overflow-hidden rounded-3xl border border-primary-200 bg-primary-100/60 p-5 shadow-sm">
          <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
          <h2 className="text-xl font-black text-primary-950">ملخص الجلسة وخطة الطالب</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["الملخص", booking.data.session_note.summary],
              ["نقاط القوة", booking.data.session_note.strengths],
              ["نقاط الضعف", booking.data.session_note.weaknesses],
              ["خطة 30 يوم", booking.data.session_note.action_plan_30_days],
              ["مصادر مقترحة", booking.data.session_note.resources],
              ["الخطوة التالية", booking.data.session_note.next_steps],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-white/78 p-4 ring-1 ring-primary-200">
                <h3 className="font-black text-primary-950">{label}</h3>
                <p className="mt-2 text-sm leading-7 text-primary-900">{value || "غير محدد"}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {booking.data.status === "completed" && !booking.data.review ? (
        <form className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur" onSubmit={form.handleSubmit((values) => review.mutate(values))}>
          <h2 className="text-xl font-black">قيّم الخبير</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
            <Field label="التقييم" error={form.formState.errors.rating?.message}>
              <Select {...form.register("rating")}>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
                <option value="2">نجمتان</option>
                <option value="1">نجمة</option>
              </Select>
            </Field>
            <Field label="تعليق" error={form.formState.errors.comment?.message}>
              <Textarea {...form.register("comment")} />
            </Field>
          </div>
          <Button type="submit" className="mt-4" disabled={review.isPending}>
            إرسال التقييم
          </Button>
        </form>
      ) : null}
    </div>
  )
}

