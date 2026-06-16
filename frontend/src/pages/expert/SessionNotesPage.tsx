import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Field, Textarea } from "../../components/ui/Field"
import { expertAPI, studentAPI } from "../../services/api"

const noteSchema = z.object({
  summary: z.string().min(10),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  action_plan_30_days: z.string().optional(),
  resources: z.string().optional(),
  next_steps: z.string().optional(),
})

type NoteForm = z.infer<typeof noteSchema>

export function SessionNotesPage() {
  const { bookingId } = useParams()
  const booking = useQuery({ queryKey: ["booking", bookingId], queryFn: () => studentAPI.booking(bookingId!), enabled: Boolean(bookingId) })
  const form = useForm<NoteForm>({ resolver: zodResolver(noteSchema) })
  const mutation = useMutation({
    mutationFn: (values: NoteForm) => expertAPI.sessionNote(Number(bookingId), values),
    onSuccess: () => toast.success("تم حفظ ملخص الجلسة"),
    onError: () => toast.error("تعذر حفظ الملخص"),
  })

  useEffect(() => {
    if (booking.data?.session_note) {
      form.reset({
        summary: booking.data.session_note.summary,
        strengths: booking.data.session_note.strengths || "",
        weaknesses: booking.data.session_note.weaknesses || "",
        action_plan_30_days: booking.data.session_note.action_plan_30_days || "",
        resources: booking.data.session_note.resources || "",
        next_steps: booking.data.session_note.next_steps || "",
      })
    }
  }, [booking.data, form])

  if (booking.isLoading) return <LoadingState />

  return (
    <form className="masar-soft-panel overflow-hidden rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
      <h1 className="text-2xl font-black">ملخص وخطة الجلسة</h1>
      <p className="mt-2 text-sm text-slate-600">
        الحجز مع {booking.data?.student_name} - {booking.data?.session_type_name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="ملخص الجلسة" error={form.formState.errors.summary?.message}>
          <Textarea {...form.register("summary")} />
        </Field>
        <Field label="نقاط القوة">
          <Textarea {...form.register("strengths")} />
        </Field>
        <Field label="نقاط الضعف">
          <Textarea {...form.register("weaknesses")} />
        </Field>
        <Field label="خطة 30 يوم">
          <Textarea {...form.register("action_plan_30_days")} />
        </Field>
        <Field label="مصادر مقترحة">
          <Textarea {...form.register("resources")} />
        </Field>
        <Field label="الخطوة التالية">
          <Textarea {...form.register("next_steps")} />
        </Field>
      </div>
      <Button type="submit" className="mt-6" disabled={mutation.isPending}>
        حفظ الملخص والخطة
      </Button>
    </form>
  )
}

