import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { MailCheck, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../../components/ui/Button"
import { Field, Input } from "../../components/ui/Field"
import { authAPI } from "../../services/api"

const forgotPasswordSchema = z.object({
  email: z.string().email("البريد غير صحيح"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const mutation = useMutation({
    mutationFn: authAPI.requestPasswordReset,
    onSuccess: () => {
      setSent(true)
      toast.success("تم استقبال طلب الاستعادة")
    },
    onError: () => toast.error("تعذر إرسال الطلب الآن"),
  })

  return (
    <section className="masar-page-shell masar-grain relative -mt-20 min-h-[720px] overflow-hidden pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(85,214,194,0.16),transparent_32%),radial-gradient(circle_at_86%_72%,rgba(246,167,201,0.13),transparent_34%)]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink ring-1 ring-black/10 backdrop-blur">
            استعادة آمنة
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.18] text-ink sm:text-5xl">استعادة كلمة المرور</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            أدخل بريد حسابك، وإذا كان مسجلا سنرسل رابطا صالحا لفترة قصيرة لتعيين كلمة مرور جديدة.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="masar-dark-panel relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-float">
            <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-ink">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="relative mt-7 text-3xl font-black">رابط واحد فقط</h2>
            <p className="relative mt-3 text-sm leading-8 text-white/75">
              عند طلب رابط جديد يتم تعطيل الروابط السابقة، وبعد نجاح التغيير يتم تسجيل الخروج من الجلسات القديمة.
            </p>
          </div>

          <form
            className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-primary-700">Password reset</p>
                <h2 className="mt-1 text-2xl font-black text-ink">إرسال رابط الاستعادة</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800 ring-8 ring-primary-50">
                <MailCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-7 space-y-4">
              <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register("email")} />
              </Field>
            </div>
            <Button type="submit" className="mt-7 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري الإرسال..." : "إرسال الرابط"}
            </Button>
            {sent ? (
              <p className="mt-5 rounded-3xl bg-primary-50 px-4 py-3 text-center text-sm font-bold leading-7 text-primary-800 ring-1 ring-primary-100">
                راجع بريدك خلال دقائق، وتأكد من مجلد الرسائل غير المرغوبة إذا لم يظهر الرابط.
              </p>
            ) : null}
            <p className="mt-5 text-center text-sm text-slate-600">
              تذكرت كلمة المرور؟{" "}
              <Link to="/login" className="font-black text-primary-700">
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
