import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { formatCurrency } from "../../lib/utils"
import { adminAPI } from "../../services/api"

export function AdminSessionTypesPage() {
  const queryClient = useQueryClient()
  const sessionTypes = useQuery({ queryKey: ["admin-session-types"], queryFn: adminAPI.sessionTypes })
  const [form, setForm] = useState({ name: "", slug: "", description: "", duration_minutes: 45, base_price: 25, is_active: true })
  const create = useMutation({
    mutationFn: adminAPI.createSessionType,
    onSuccess: () => {
      toast.success("تم إنشاء نوع الجلسة")
      setForm({ name: "", slug: "", description: "", duration_minutes: 45, base_price: 25, is_active: true })
      void queryClient.invalidateQueries({ queryKey: ["admin-session-types"] })
    },
  })
  const remove = useMutation({
    mutationFn: adminAPI.deleteSessionType,
    onSuccess: () => {
      toast.success("تم حذف نوع الجلسة")
      void queryClient.invalidateQueries({ queryKey: ["admin-session-types"] })
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => adminAPI.updateSessionType(id, { is_active }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-session-types"] }),
  })

  if (sessionTypes.isLoading) return <LoadingState />

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-5 shadow-float backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate(form)
        }}
      >
        <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
        <h1 className="text-xl font-black">إضافة نوع جلسة</h1>
        <div className="mt-4 space-y-4">
          <Field label="الاسم">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          </Field>
          <Field label="المدة بالدقائق">
            <Input type="number" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} />
          </Field>
          <Field label="السعر الأساسي">
            <Input type="number" value={form.base_price} onChange={(event) => setForm({ ...form, base_price: Number(event.target.value) })} />
          </Field>
          <Field label="الوصف">
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={create.isPending}>
          إنشاء
        </Button>
      </form>

      <div className="space-y-4">
        <h1 className="text-2xl font-black">أنواع الجلسات</h1>
        {sessionTypes.data?.map((session) => (
          <article key={session.id} className="rounded-md border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-black">{session.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {session.duration_minutes} دقيقة - {formatCurrency(session.base_price)}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{session.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggle.mutate({ id: session.id, is_active: !session.is_active })}>
                  {session.is_active ? "تعطيل" : "تفعيل"}
                </Button>
                <Button variant="danger" onClick={() => remove.mutate(session.id)}>
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
