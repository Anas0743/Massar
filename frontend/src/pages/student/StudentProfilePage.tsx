import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Input, Textarea } from "../../components/ui/Field"
import { useAuth } from "../../hooks/useAuth"
import { studentAPI } from "../../services/api"

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  academic_year: z.string().optional(),
  current_skills: z.string().optional(),
  interested_tracks: z.string().optional(),
  github_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  cv_url: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

function splitList(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []
}

export function StudentProfilePage() {
  const { user, refresh } = useAuth()
  const profile = useQuery({ queryKey: ["student-profile"], queryFn: studentAPI.profile })
  const form = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })
  const update = useMutation({
    mutationFn: (values: ProfileForm) =>
      studentAPI.updateProfile({
        ...values,
        current_skills: splitList(values.current_skills),
        interested_tracks: splitList(values.interested_tracks),
      }),
    onSuccess: async () => {
      toast.success("تم تحديث الملف الشخصي")
      await refresh()
    },
    onError: () => toast.error("تعذر تحديث الملف"),
  })

  useEffect(() => {
    if (profile.data) {
      form.reset({
        name: user?.name || "",
        phone: user?.phone || "",
        university: profile.data.university || "",
        major: profile.data.major || "",
        academic_year: profile.data.academic_year || "",
        current_skills: profile.data.current_skills.join(", "),
        interested_tracks: profile.data.interested_tracks.join(", "),
        github_url: profile.data.github_url || "",
        linkedin_url: profile.data.linkedin_url || "",
        cv_url: profile.data.cv_url || "",
        bio: profile.data.bio || "",
      })
    }
  }, [profile.data, user, form])

  if (profile.isLoading) return <LoadingState />

  return (
    <form className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => update.mutate(values))}>
      <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
      <h1 className="text-2xl font-black">ملفي الشخصي</h1>
      <p className="mt-2 text-sm text-slate-600">هذه البيانات تساعد المنصة تقترح خبراء وجلسات مناسبة.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="الاسم" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="الهاتف">
          <Input {...form.register("phone")} />
        </Field>
        <Field label="الجامعة">
          <Input {...form.register("university")} />
        </Field>
        <Field label="التخصص">
          <Input {...form.register("major")} />
        </Field>
        <Field label="السنة الدراسية">
          <Input {...form.register("academic_year")} />
        </Field>
        <Field label="المهارات الحالية">
          <Input placeholder="JavaScript, SQL, Python" {...form.register("current_skills")} />
        </Field>
        <Field label="المجالات المهتم بها">
          <Input placeholder="frontend, backend, career" {...form.register("interested_tracks")} />
        </Field>
        <Field label="GitHub">
          <Input {...form.register("github_url")} />
        </Field>
        <Field label="LinkedIn">
          <Input {...form.register("linkedin_url")} />
        </Field>
        <Field label="CV URL">
          <Input {...form.register("cv_url")} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="نبذة قصيرة">
          <Textarea {...form.register("bio")} />
        </Field>
      </div>
      <Button type="submit" className="mt-6" disabled={update.isPending}>
        حفظ التغييرات
      </Button>
    </form>
  )
}

