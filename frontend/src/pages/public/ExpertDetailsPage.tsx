import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { BadgeCheck, CalendarClock, Clock, Code2, ExternalLink, Star, UserRoundCheck, WalletCards } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { BookingStatusBadge } from "../../components/StatusBadge"
import { Button, ButtonLink } from "../../components/ui/Button"
import { Field, Select, Textarea, Input } from "../../components/ui/Field"
import { LoadingState } from "../../components/LoadingState"
import { dayNames, formatCurrency, toDateTimeLocalValue } from "../../lib/utils"
import { useAuth } from "../../hooks/useAuth"
import { publicAPI, studentAPI } from "../../services/api"

const bookingSchema = z.object({
  session_type_id: z.string().refine((value) => Number(value) > 0, "اختر نوع الجلسة"),
  scheduled_at: z.string().min(1, "اختر الموعد"),
  student_message: z.string().min(10, "اكتب وصفًا قصيرًا للمشكلة").max(2000),
})

type BookingForm = z.infer<typeof bookingSchema>

export function ExpertDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const expert = useQuery({ queryKey: ["expert", id], queryFn: () => publicAPI.expert(id!), enabled: Boolean(id) })
  const reviews = useQuery({
    queryKey: ["expert-reviews", id],
    queryFn: () => publicAPI.expertReviews(id!),
    enabled: Boolean(id),
  })

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      session_type_id: "0",
      scheduled_at: toDateTimeLocalValue(),
      student_message: "",
    },
  })
  const selectedSessionId = useWatch({ control: form.control, name: "session_type_id" })

  const createBooking = useMutation({
    mutationFn: (values: BookingForm) =>
      studentAPI.createBooking({
        expert_id: Number(id),
        session_type_id: Number(values.session_type_id),
        scheduled_at: new Date(values.scheduled_at).toISOString(),
        student_message: values.student_message,
        payment_method: "manual",
      }),
    onSuccess: (booking) => {
      toast.success("تم إرسال طلب الحجز")
      navigate(`/dashboard/bookings/${booking.id}`)
    },
    onError: () => toast.error("تعذر إنشاء الحجز. تأكد من تسجيل الدخول كطالب."),
  })

  const onSubmit = (values: BookingForm) => {
    if (!user) {
      navigate("/login", { state: { from: `/experts/${id}` } })
      return
    }
    if (user.role !== "student") {
      toast.error("الحجز متاح لحسابات الطلاب فقط")
      return
    }
    createBooking.mutate(values)
  }

  if (expert.isLoading) return <div className="mx-auto max-w-7xl px-4 py-12"><LoadingState /></div>
  if (!expert.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-md border border-black/10 bg-white p-8 text-center shadow-float">
          <h1 className="text-2xl font-black text-ink">لم يتم العثور على الخبير</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">قد يكون الرابط قديمًا أو أن حساب الخبير غير معتمد بعد.</p>
          <ButtonLink to="/experts" className="mt-6">
            العودة إلى الخبراء
          </ButtonLink>
        </div>
      </div>
    )
  }

  const selectedSession = expert.data.session_types.find((item) => item.id === Number(selectedSessionId))

  return (
    <section className="masar-grain relative -mt-20 bg-paper pb-16 pt-28">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary-100/60 via-coral/10 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 shadow-float backdrop-blur">
            <div className="masar-progress h-2" />
            <div className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <img
                src={expert.data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.data.name)}`}
                alt={expert.data.name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-primary-50"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    خبير معتمد
                  </span>
                  {expert.data.tracks.map((track) => (
                    <Link key={track.id} to={`/experts?track=${track.slug}`} className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-black/10">
                      {track.name}
                    </Link>
                  ))}
                </div>
                <h1 className="mt-4 text-3xl font-black text-ink">{expert.data.name}</h1>
                <p className="mt-2 text-lg font-bold text-slate-600">{expert.data.title}</p>
                <p className="mt-1 text-sm text-slate-500">{expert.data.company}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <span className="flex items-center gap-2 rounded-md bg-paper p-3 text-sm font-bold text-slate-700 ring-1 ring-black/10">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    {expert.data.rating_average || "جديد"} ({expert.data.rating_count})
                  </span>
                  <span className="flex items-center gap-2 rounded-md bg-paper p-3 text-sm font-bold text-slate-700 ring-1 ring-black/10">
                    <Clock className="h-5 w-5 text-aqua" />
                    {expert.data.years_of_experience} سنوات خبرة
                  </span>
                  <span className="flex items-center gap-2 rounded-md bg-paper p-3 text-sm font-bold text-slate-700 ring-1 ring-black/10">
                    <WalletCards className="h-5 w-5 text-sun" />
                    {formatCurrency(expert.data.hourly_price)}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-6 leading-8 text-slate-700">{expert.data.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {expert.data.linkedin_url ? (
                <a className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-black/10" href={expert.data.linkedin_url} target="_blank" rel="noreferrer">
                  <UserRoundCheck className="h-4 w-4" />
                  LinkedIn
                </a>
              ) : null}
              {expert.data.github_url ? (
                <a className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-black/10" href={expert.data.github_url} target="_blank" rel="noreferrer">
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
              {expert.data.portfolio_url ? (
                <a className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-black/10" href={expert.data.portfolio_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Portfolio
                </a>
              ) : null}
            </div>
            </div>
          </div>

          <div className="rounded-md border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xl font-black text-ink">أنواع الجلسات</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {expert.data.session_types.map((session) => (
                <div key={session.id} className="rounded-md border border-black/10 bg-paper p-4 shadow-sm transition hover:border-primary-200">
                  <h3 className="font-black">{session.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{session.description}</p>
                  <p className="mt-3 text-sm font-black text-primary-700">
                    {session.duration_minutes} دقيقة - {formatCurrency(session.custom_price ?? session.base_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xl font-black text-ink">الأوقات المتاحة أسبوعيًا</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {expert.data.availability.map((slot) => (
                <div key={slot.id} className="flex items-center gap-3 rounded-md bg-paper p-4 text-sm font-bold text-slate-700 ring-1 ring-black/10">
                  <CalendarClock className="h-5 w-5 text-aqua" />
                  {dayNames[slot.day_of_week]} من {slot.start_time.slice(0, 5)} إلى {slot.end_time.slice(0, 5)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xl font-black text-ink">التقييمات</h2>
            <div className="mt-4 grid gap-3">
              {reviews.data?.length ? (
                reviews.data.map((review) => (
                  <div key={review.id} className="rounded-md bg-paper p-4 ring-1 ring-black/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">{review.student_name || "طالب"}</p>
                      <span className="text-sm font-black text-amber-500">{"★".repeat(review.rating)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">لا توجد تقييمات بعد.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-md border border-black/10 bg-white/92 shadow-float backdrop-blur">
            <div className="masar-progress h-1.5" />
            <div className="p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">احجز جلسة</h2>
                <p className="mt-1 text-sm text-slate-500">خطوات قليلة، والدفع يدوي في الـ MVP.</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-100 text-primary-700">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            {user && user.role !== "student" ? (
              <div className="rounded-md bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-700">
                الحجز متاح فقط لحساب الطالب. يمكنك إنشاء حساب طالب لتجربة التدفق.
              </div>
            ) : null}
            <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <Field label="نوع الجلسة" error={form.formState.errors.session_type_id?.message}>
                <Select {...form.register("session_type_id")}>
                  <option value={0}>اختر نوع المشكلة</option>
                  {expert.data.session_types.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="وقت الجلسة" error={form.formState.errors.scheduled_at?.message}>
                <Input type="datetime-local" {...form.register("scheduled_at")} />
              </Field>
              <Field label="رسالة قصيرة عن المشكلة" error={form.formState.errors.student_message?.message}>
                <Textarea placeholder="مثال: أريد خطة لتجهيز GitHub والتقديم على تدريب Frontend..." {...form.register("student_message")} />
              </Field>
              {selectedSession ? (
                <div className="rounded-md bg-paper p-4 text-sm font-bold text-slate-700 ring-1 ring-black/10">
                  السعر المتوقع: {formatCurrency(selectedSession.custom_price ?? selectedSession.base_price)} - مدة الجلسة: {selectedSession.duration_minutes} دقيقة
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={createBooking.isPending}>
                {createBooking.isPending ? "جاري إرسال الطلب..." : "تأكيد الحجز"}
              </Button>
              {!user ? (
                <ButtonLink to="/login" variant="secondary" className="w-full">
                  تسجيل الدخول قبل الحجز
                </ButtonLink>
              ) : null}
            </form>
            <div className="mt-4">
              <BookingStatusBadge status="pending" />
              <p className="mt-2 text-xs leading-6 text-slate-500">سيبدأ الحجز كطلب قيد الانتظار حتى يؤكد الخبير أو الأدمن الموعد.</p>
            </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
