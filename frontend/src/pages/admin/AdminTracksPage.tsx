import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { adminAPI } from "../../services/api"

export function AdminTracksPage() {
  const queryClient = useQueryClient()
  const tracks = useQuery({ queryKey: ["admin-tracks"], queryFn: adminAPI.tracks })
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "Route", is_active: true })
  const create = useMutation({
    mutationFn: adminAPI.createTrack,
    onSuccess: () => {
      toast.success("تم إنشاء المجال")
      setForm({ name: "", slug: "", description: "", icon: "Route", is_active: true })
      void queryClient.invalidateQueries({ queryKey: ["admin-tracks"] })
    },
  })
  const remove = useMutation({
    mutationFn: adminAPI.deleteTrack,
    onSuccess: () => {
      toast.success("تمت أرشفة المجال")
      void queryClient.invalidateQueries({ queryKey: ["admin-tracks"] })
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => adminAPI.updateTrack(id, { is_active }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-tracks"] }),
  })

  if (tracks.isLoading) return <LoadingState />

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
        <h1 className="text-xl font-black">إضافة مجال</h1>
        <div className="mt-4 space-y-4">
          <Field label="الاسم">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          </Field>
          <Field label="الأيقونة">
            <Input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} />
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
        <h1 className="text-2xl font-black">المجالات</h1>
        {tracks.data?.map((track) => (
          <article key={track.id} className="rounded-3xl border border-black/10 bg-white/88 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-black">{track.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${track.is_active ? "bg-primary-50 text-primary-700" : "bg-slate-100 text-slate-500"}`}>
                    {track.is_active ? "نشط" : "مؤرشف"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{track.slug}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{track.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggle.mutate({ id: track.id, is_active: !track.is_active })}>
                  {track.is_active ? "تعطيل" : "تفعيل"}
                </Button>
                {track.is_active ? (
                  <Button variant="danger" onClick={() => remove.mutate(track.id)}>
                    أرشفة
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

