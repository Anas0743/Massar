import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { SectionHeader } from "../../components/SectionHeader"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { publicAPI } from "../../services/api"

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد غير صحيح"),
  phone: z.string().optional(),
  message: z.string().min(10, "اكتب رسالة أوضح"),
})

type ContactForm = z.infer<typeof contactSchema>

export function ContactPage() {
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema), defaultValues: { name: "", email: "", phone: "", message: "" } })
  const mutation = useMutation({
    mutationFn: publicAPI.contact,
    onSuccess: () => {
      toast.success("وصلتنا رسالتك")
      form.reset()
    },
    onError: () => toast.error("تعذر إرسال الرسالة"),
  })

  return (
    <section className="masar-grain relative -mt-20 min-h-screen bg-paper pb-16 pt-28">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary-100/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionHeader eyebrow="تواصل معنا" title="رسالة واحدة تكفي لبدء الحديث" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <form className="rounded-md border border-black/10 bg-white/90 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>
              <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register("email")} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="الهاتف" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="الرسالة" error={form.formState.errors.message?.message}>
                <Textarea {...form.register("message")} />
              </Field>
            </div>
            <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
            </Button>
          </form>
          <div className="grid gap-4">
            {[
              { icon: Mail, title: "البريد", text: "hello@masar.dev" },
              { icon: Phone, title: "الهاتف", text: "+962 7 0000 0000" },
              { icon: MessageCircle, title: "طلبات الشراكة", text: "للجامعات والمجتمعات التقنية." },
            ].map((item) => (
              <div key={item.title} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-100 text-primary-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-black">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
