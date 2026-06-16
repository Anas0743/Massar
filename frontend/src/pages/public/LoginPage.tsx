import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { LogIn } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../../components/ui/Button"
import { Field, Input } from "../../components/ui/Field"
import { useAuth } from "../../hooks/useAuth"
import type { UserRole } from "../../types/models"

const loginSchema = z.object({
  email: z.string().email("البريد غير صحيح"),
  password: z.string().min(8, "كلمة المرور قصيرة"),
})

type LoginForm = z.infer<typeof loginSchema>

const roleHome: Record<UserRole, string> = {
  student: "/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin",
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      toast.success("أهلًا بك في مسار")
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || roleHome[user.role], { replace: true })
    },
    onError: () => toast.error("بيانات الدخول غير صحيحة"),
  })

  return (
    <section className="masar-page-shell masar-grain relative -mt-20 min-h-[760px] overflow-hidden pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(126,221,241,0.18),transparent_32%),radial-gradient(circle_at_86%_70%,rgba(246,167,201,0.13),transparent_34%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-7 flex max-w-md items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <div className="masar-progress h-2 flex-1 rounded-full shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-coral" />
          </div>
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink ring-1 ring-black/10 backdrop-blur">
            دخول آمن حسب الدور
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-6xl">
            ارجع لمسارك
            <span className="masar-heading-gradient block pb-1">من آخر خطوة توقفت عندها</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            حساب الطالب يفتح الحجوزات والخطط، حساب الخبير يفتح الجلسات والملخصات، والأدمن يدير جودة المنصة.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="masar-dark-panel relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-float">
            <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink">
                <LogIn className="h-5 w-5" />
              </span>
              <h2 className="mt-7 text-3xl font-black">حسابات تجريبية جاهزة</h2>
              <p className="mt-3 text-sm leading-8 text-white/75">بعد تشغيل seed يمكنك تجربة كل دور بسرعة بدون إعداد طويل.</p>
            </div>
            <div className="mt-8 grid gap-3 text-sm">
              {[
                ["طالب", "student@masar.dev"],
                ["خبير", "frontend@masar.dev"],
                ["أدمن", "admin@masar.dev"],
              ].map(([role, email]) => (
                <div key={email} className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="font-black text-white">{role}</p>
                  <p className="mt-1 font-semibold text-primary-100">{email}</p>
                </div>
              ))}
              <p className="rounded-full bg-white px-4 py-2 text-center text-xs font-black text-ink">كلمة المرور: Password123!</p>
            </div>
          </div>

          <form className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-primary-700">Masar access</p>
                <h2 className="mt-1 text-2xl font-black text-ink">تسجيل الدخول</h2>
              </div>
              <span className="h-12 w-12 rounded-full bg-primary-100 ring-8 ring-primary-50" />
            </div>
            <div className="mt-7 space-y-4">
              <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register("email")} />
              </Field>
              <Field label="كلمة المرور" error={form.formState.errors.password?.message}>
                <Input type="password" autoComplete="current-password" {...form.register("password")} />
              </Field>
            </div>
            <Button type="submit" className="mt-7 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري الدخول..." : "دخول"}
            </Button>
            <p className="mt-5 text-center text-sm text-slate-600">
              لا تملك حساب طالب؟{" "}
              <Link to="/register" className="font-black text-primary-700">
                إنشاء حساب
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

