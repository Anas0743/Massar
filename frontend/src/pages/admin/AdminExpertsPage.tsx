import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { adminAPI } from "../../services/api"

const initialExpertForm = {
  name: "",
  email: "",
  password: "Password123!",
  phone: "",
  avatar_url: "",
  title: "",
  company: "",
  years_of_experience: 0,
  hourly_price: 25,
  session_duration_minutes: 45,
  bio: "",
  is_approved: false,
}

export function AdminExpertsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialExpertForm)
  const experts = useQuery({ queryKey: ["admin-experts"], queryFn: () => adminAPI.experts() })
  const create = useMutation({
    mutationFn: adminAPI.createExpert,
    onSuccess: () => {
      toast.success("تم إنشاء حساب الخبير وتخزينه في قاعدة البيانات")
      setForm(initialExpertForm)
      void queryClient.invalidateQueries({ queryKey: ["admin-experts"] })
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
    },
    onError: () => toast.error("تعذر إنشاء الخبير. قد يكون البريد مستخدمًا."),
  })
  const approve = useMutation({
    mutationFn: adminAPI.approveExpert,
    onSuccess: () => {
      toast.success("تم قبول الخبير")
      void queryClient.invalidateQueries({ queryKey: ["admin-experts"] })
    },
  })
  const reject = useMutation({
    mutationFn: adminAPI.rejectExpert,
    onSuccess: () => {
      toast.success("تم رفض الخبير")
      void queryClient.invalidateQueries({ queryKey: ["admin-experts"] })
    },
  })

  if (experts.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-6 shadow-float backdrop-blur">
        <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
        <h1 className="text-2xl font-black">إدارة الخبراء</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          إنشاء حساب الخبير يتم من الأدمن فقط. بعد الإنشاء يمكن اعتماد الخبير أو تركه بانتظار المراجعة.
        </p>
      </div>

      <form
        className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-5 shadow-float backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate(form)
        }}
      >
        <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">إنشاء حساب خبير</h2>
            <p className="mt-1 text-sm text-slate-600">سيتم إنشاء مستخدم بدور expert مع ملف خبير أولي.</p>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-black/10">
            <input
              type="checkbox"
              checked={form.is_approved}
              onChange={(event) => setForm({ ...form, is_approved: event.target.checked })}
            />
            اعتماد فورًا
          </label>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="اسم الخبير">
            <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
          <Field label="كلمة المرور الأولية">
            <Input required type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </Field>
          <Field label="العنوان الوظيفي">
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="الشركة">
            <Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
          </Field>
          <Field label="سنوات الخبرة">
            <Input type="number" min="0" value={form.years_of_experience} onChange={(event) => setForm({ ...form, years_of_experience: Number(event.target.value) })} />
          </Field>
          <Field label="السعر">
            <Input type="number" min="0" value={form.hourly_price} onChange={(event) => setForm({ ...form, hourly_price: Number(event.target.value) })} />
          </Field>
          <Field label="مدة الجلسة">
            <Input type="number" min="15" value={form.session_duration_minutes} onChange={(event) => setForm({ ...form, session_duration_minutes: Number(event.target.value) })} />
          </Field>
          <Field label="الصورة URL">
            <Input value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="نبذة قصيرة">
            <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          </Field>
        </div>
        <Button type="submit" className="mt-5" disabled={create.isPending}>
          {create.isPending ? "جاري إنشاء الخبير..." : "إنشاء حساب الخبير"}
        </Button>
      </form>

      <div className="grid gap-4">
        {experts.data?.map((expert) => (
          <article key={expert.id} className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:shadow-float">
            <div className="masar-progress -mx-5 -mt-5 mb-5 h-1" />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src={expert.avatar_url || `https://ui-avatars.com/api/?name=${expert.name}`} alt={expert.name} className="h-14 w-14 rounded-full object-cover ring-4 ring-primary-50" />
                <div>
                  <h2 className="font-black">{expert.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{expert.title}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{expert.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${expert.is_approved ? "bg-primary-100 text-primary-700 ring-primary-200" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                  {expert.is_approved ? "معتمد" : "بانتظار الموافقة"}
                </span>
                <Button variant="success" onClick={() => approve.mutate(expert.id)}>
                  قبول
                </Button>
                <Button variant="danger" onClick={() => reject.mutate(expert.id)}>
                  رفض
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
