import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { authAPI, TOKEN_KEY } from "../services/api"
import { Button } from "./ui/Button"
import { Field, Input } from "./ui/Field"

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "أدخل كلمة المرور الحالية"),
    new_password: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل").max(128),
    confirm_password: z.string().min(8, "أكد كلمة المرور الجديدة"),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm_password"],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export function ChangePasswordCard() {
  const navigate = useNavigate()
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  })
  const changePassword = useMutation({
    mutationFn: (values: PasswordForm) =>
      authAPI.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
    }),
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور. سجل الدخول من جديد.")
      form.reset()
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event("masar:auth-expired"))
      navigate("/login", { replace: true })
    },
    onError: () => toast.error("تعذر تغيير كلمة المرور. تأكد من كلمة المرور الحالية."),
  })

  return (
    <form
      className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur"
      onSubmit={form.handleSubmit((values) => changePassword.mutate(values))}
    >
      <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
      <h2 className="text-2xl font-black">تغيير كلمة المرور</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">استخدم كلمة مرور قوية ومختلفة عن كلمة المرور الحالية.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Field label="كلمة المرور الحالية" error={form.formState.errors.current_password?.message}>
          <Input type="password" autoComplete="current-password" {...form.register("current_password")} />
        </Field>
        <Field label="كلمة المرور الجديدة" error={form.formState.errors.new_password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("new_password")} />
        </Field>
        <Field label="تأكيد كلمة المرور" error={form.formState.errors.confirm_password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("confirm_password")} />
        </Field>
      </div>
      <Button type="submit" className="mt-6" disabled={changePassword.isPending}>
        {changePassword.isPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
      </Button>
    </form>
  )
}
