import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../../components/ui/Button"
import { Field, Input } from "../../components/ui/Field"
import { useAuth } from "../../hooks/useAuth"

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: RegisterForm) => registerUser({ ...values, role: "student" }),
    onSuccess: () => {
      toast.success("تم إنشاء حساب الطالب وتخزينه في قاعدة البيانات")
      navigate("/dashboard", { replace: true })
    },
    onError: () => toast.error("تعذر إنشاء الحساب. قد يكون البريد مستخدمًا."),
  })

  return (
    <section className="masar-page-shell masar-grain relative -mt-20 min-h-[760px] overflow-hidden pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(85,214,194,0.16),transparent_32%),radial-gradient(circle_at_86%_70%,rgba(184,167,255,0.16),transparent_36%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-7 flex max-w-md items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            <div className="masar-progress h-2 flex-1 rounded-full shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-coral" />
          </div>
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink ring-1 ring-black/10 backdrop-blur">
            تسجيل طالب جديد
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-6xl">
            ابدأ حسابك كطالب
            <span className="masar-heading-gradient block pb-1">واحجز أول جلسة بدون تعقيد</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            نأخذ أقل بيانات ممكنة في البداية. حسابات الخبراء لا تُنشأ من التسجيل العام، بل من لوحة الأدمن لضمان جودة الخبراء.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="masar-dark-panel relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-float">
            <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-aqua/20 blur-3xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-ink">
              <UserPlus className="h-5 w-5" />
            </span>
            <h2 className="relative mt-7 text-3xl font-black text-white">ماذا يحدث بعد التسجيل؟</h2>
            <div className="mt-6 grid gap-3">
              {[
                ["1", "يتم إنشاء حساب طالب وتخزينه مباشرة في قاعدة البيانات."],
                ["2", "تختار المجال أو الخبير المناسب من صفحة الخبراء."],
                ["3", "ترسل طلب الحجز برسالة قصيرة وتحصل على خطة بعد الجلسة."],
              ].map(([number, text]) => (
                <div key={number} className="relative flex gap-3 rounded-3xl bg-white/[0.08] p-4 ring-1 ring-white/10">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-ink">{number}</span>
                  <p className="text-sm font-bold leading-7 text-white/78">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <form className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-primary-700">Student account</p>
                <h2 className="mt-1 text-2xl font-black text-ink">إنشاء حساب</h2>
              </div>
              <span className="h-12 w-12 rounded-full bg-coral/70 ring-8 ring-coral/10" />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field label="الاسم" error={form.formState.errors.name?.message}>
                <Input autoComplete="name" {...form.register("name")} />
              </Field>
              <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register("email")} />
              </Field>
              <Field label="الهاتف" error={form.formState.errors.phone?.message}>
                <Input autoComplete="tel" {...form.register("phone")} />
              </Field>
              <Field label="كلمة المرور" error={form.formState.errors.password?.message}>
                <Input type="password" autoComplete="new-password" {...form.register("password")} />
              </Field>
            </div>
            <Button type="submit" className="mt-7 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب طالب"}
            </Button>
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

