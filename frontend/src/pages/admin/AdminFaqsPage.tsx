import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { adminAPI } from "../../services/api"

export function AdminFaqsPage() {
  const queryClient = useQueryClient()
  const faqs = useQuery({ queryKey: ["admin-faqs"], queryFn: adminAPI.faqs })
  const [form, setForm] = useState({ question: "", answer: "", order: 0, is_active: true })
  const create = useMutation({
    mutationFn: adminAPI.createFaq,
    onSuccess: () => {
      toast.success("تم إنشاء السؤال")
      setForm({ question: "", answer: "", order: 0, is_active: true })
      void queryClient.invalidateQueries({ queryKey: ["admin-faqs"] })
    },
  })
  const remove = useMutation({
    mutationFn: adminAPI.deleteFaq,
    onSuccess: () => {
      toast.success("تم حذف السؤال")
      void queryClient.invalidateQueries({ queryKey: ["admin-faqs"] })
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => adminAPI.updateFaq(id, { is_active }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
  })

  if (faqs.isLoading) return <LoadingState />

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-5 shadow-float backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate(form)
        }}
      >
        <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
        <h1 className="text-xl font-black">إضافة FAQ</h1>
        <div className="mt-4 space-y-4">
          <Field label="السؤال">
            <Input value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} />
          </Field>
          <Field label="الترتيب">
            <Input type="number" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} />
          </Field>
          <Field label="الإجابة">
            <Textarea value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} />
          </Field>
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={create.isPending}>
          إنشاء
        </Button>
      </form>

      <div className="space-y-4">
        <h1 className="text-2xl font-black">الأسئلة الشائعة</h1>
        {faqs.data?.map((faq) => (
          <article key={faq.id} className="rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-black">{faq.question}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggle.mutate({ id: faq.id, is_active: !faq.is_active })}>
                  {faq.is_active ? "تعطيل" : "تفعيل"}
                </Button>
                <Button variant="danger" onClick={() => remove.mutate(faq.id)}>
                  حذف
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

