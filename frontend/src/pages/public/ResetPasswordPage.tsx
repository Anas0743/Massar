import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { KeyRound, ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../../components/ui/Button"
import { Field, Input } from "../../components/ui/Field"
import { authAPI } from "../../services/api"

const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(128, "كلمة المرور طويلة جدا"),
    confirm_password: z.string().min(8, "أكد كلمة المرور"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm_password"],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordForm) => authAPI.confirmPasswordReset({ token, new_password: values.new_password }),
    onSuccess: () => {
      toast.success("تم تحديث كلمة المرور")
      navigate("/login", { replace: true })
    },
    onError: () => toast.error("الرابط غير صالح أو منتهي"),
  })

  return (
    <section className="masar-page-shell masar-grain relative -mt-20 min-h-[720px] overflow-hidden pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(126,221,241,0.18),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(184,167,255,0.15),transparent_34%)]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink ring-1 ring-black/10 backdrop-blur">
            كلمة مرور جديدة
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.18] text-ink sm:text-5xl">تعيين كلمة المرور</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            اختر كلمة مرور قوية. بعد الحفظ ستحتاج إلى تسجيل الدخول مرة أخرى.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="masar-dark-panel relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-float">
            <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-ink">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="relative mt-7 text-3xl font-black">حماية الجلسات</h2>
            <p className="relative mt-3 text-sm leading-8 text-white/75">
              بعد تحديث كلمة المرور يتم تعطيل رموز الدخول القديمة تلقائيا لحماية الحساب.
            </p>
          </div>

          <form
            className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-primary-700">Secure update</p>
                <h2 className="mt-1 text-2xl font-black text-ink">بيانات كلمة المرور</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800 ring-8 ring-primary-50">
                <KeyRound className="h-5 w-5" />
              </span>
            </div>

            {!token ? (
              <div className="mt-7 rounded-3xl bg-rose-50 px-4 py-4 text-center text-sm font-bold leading-7 text-rose-700 ring-1 ring-rose-100">
                رابط الاستعادة غير مكتمل.{" "}
                <Link to="/forgot-password" className="text-primary-700">
                  اطلب رابطا جديدا
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-7 space-y-4">
                  <Field label="كلمة المرور الجديدة" error={form.formState.errors.new_password?.message}>
                    <Input type="password" autoComplete="new-password" {...form.register("new_password")} />
                  </Field>
                  <Field label="تأكيد كلمة المرور" error={form.formState.errors.confirm_password?.message}>
                    <Input type="password" autoComplete="new-password" {...form.register("confirm_password")} />
                  </Field>
                </div>
                <Button type="submit" className="mt-7 w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </>
            )}

            <p className="mt-5 text-center text-sm text-slate-600">
              لديك حساب؟{" "}
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
