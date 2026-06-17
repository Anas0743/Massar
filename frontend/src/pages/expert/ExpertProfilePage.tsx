import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { ChangePasswordCard } from "../../components/ChangePasswordCard"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { useAuth } from "../../hooks/useAuth"
import { expertAPI, publicAPI } from "../../services/api"

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
  title: z.string().min(2),
  company: z.string().optional(),
  years_of_experience: z.string().min(1),
  bio: z.string().min(20),
  hourly_price: z.string().min(1),
  session_duration_minutes: z.string().min(1),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  track_ids: z.array(z.number()),
  session_type_ids: z.array(z.number()),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ExpertProfilePage() {
  const { refresh } = useAuth()
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: ["expert-profile"], queryFn: expertAPI.profile })
  const tracks = useQuery({ queryKey: ["tracks"], queryFn: publicAPI.tracks })
  const sessionTypes = useQuery({ queryKey: ["session-types"], queryFn: publicAPI.sessionTypes })
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { track_ids: [], session_type_ids: [], years_of_experience: "0", hourly_price: "0", session_duration_minutes: "45" },
  })
  const selectedTrackIds = useWatch({ control: form.control, name: "track_ids" }) ?? []
  const selectedSessionTypeIds = useWatch({ control: form.control, name: "session_type_ids" }) ?? []

  useEffect(() => {
    if (profile.data) {
      form.reset({
        name: profile.data.name,
        phone: profile.data.phone || "",
        avatar_url: profile.data.avatar_url || "",
        title: profile.data.title || "",
        company: profile.data.company || "",
        years_of_experience: String(profile.data.years_of_experience),
        bio: profile.data.bio || "",
        hourly_price: String(profile.data.hourly_price),
        session_duration_minutes: String(profile.data.session_duration_minutes),
        linkedin_url: profile.data.linkedin_url || "",
        github_url: profile.data.github_url || "",
        portfolio_url: profile.data.portfolio_url || "",
        track_ids: profile.data.tracks.map((track) => track.id),
        session_type_ids: profile.data.session_types.map((session) => session.id),
      })
    }
  }, [profile.data, form])

  const update = useMutation({
    mutationFn: (values: ProfileForm) =>
      expertAPI.updateProfile({
        ...values,
        years_of_experience: Number(values.years_of_experience),
        hourly_price: Number(values.hourly_price),
        session_duration_minutes: Number(values.session_duration_minutes),
      }),
    onSuccess: async () => {
      toast.success("تم حفظ ملف الخبير")
      await refresh()
      void queryClient.invalidateQueries({ queryKey: ["expert-profile"] })
    },
    onError: () => toast.error("تعذر حفظ الملف"),
  })

  const toggleNumber = (field: "track_ids" | "session_type_ids", id: number) => {
    const values = form.getValues(field)
    form.setValue(field, values.includes(id) ? values.filter((value) => value !== id) : [...values, id], { shouldDirty: true })
  }

  if (profile.isLoading || tracks.isLoading || sessionTypes.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
    <form className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => update.mutate(values))}>
      <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">ملف الخبير</h1>
          <p className="mt-2 text-sm text-slate-600">اكتمال الملف يزيد ثقة الطالب قبل الحجز.</p>
        </div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200">
          {profile.data?.is_approved ? "معتمد" : "بانتظار الموافقة"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="الاسم" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="الصورة URL">
          <Input {...form.register("avatar_url")} />
        </Field>
        <Field label="العنوان الوظيفي" error={form.formState.errors.title?.message}>
          <Input {...form.register("title")} />
        </Field>
        <Field label="الشركة الحالية">
          <Input {...form.register("company")} />
        </Field>
        <Field label="سنوات الخبرة">
          <Input type="number" {...form.register("years_of_experience")} />
        </Field>
        <Field label="سعر الجلسة">
          <Input type="number" {...form.register("hourly_price")} />
        </Field>
        <Field label="مدة الجلسة بالدقائق">
          <Input type="number" {...form.register("session_duration_minutes")} />
        </Field>
        <Field label="الهاتف">
          <Input {...form.register("phone")} />
        </Field>
        <Field label="LinkedIn">
          <Input {...form.register("linkedin_url")} />
        </Field>
        <Field label="GitHub">
          <Input {...form.register("github_url")} />
        </Field>
        <Field label="Portfolio">
          <Input {...form.register("portfolio_url")} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="نبذة الخبير" error={form.formState.errors.bio?.message}>
          <Textarea {...form.register("bio")} />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-black">التخصصات</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tracks.data?.map((track) => {
              const selected = selectedTrackIds.includes(track.id)
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => toggleNumber("track_ids", track.id)}
                  className={`rounded-full px-3 py-2 text-sm font-bold ring-1 transition ${selected ? "masar-gradient text-white ring-transparent shadow-sm" : "bg-paper text-slate-700 ring-black/10 hover:ring-primary-200"}`}
                >
                  {track.name}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <h2 className="font-black">أنواع الجلسات</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sessionTypes.data?.map((session) => {
              const selected = selectedSessionTypeIds.includes(session.id)
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => toggleNumber("session_type_ids", session.id)}
                  className={`rounded-full px-3 py-2 text-sm font-bold ring-1 transition ${selected ? "masar-gradient text-white ring-transparent shadow-sm" : "bg-paper text-slate-700 ring-black/10 hover:ring-primary-200"}`}
                >
                  {session.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Button type="submit" className="mt-8" disabled={update.isPending}>
        حفظ ملف الخبير
      </Button>
    </form>
    <ChangePasswordCard />
    </div>
  )
}

