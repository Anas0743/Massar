import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LoadingState } from "../../components/LoadingState"
import { Button } from "../../components/ui/Button"
import { Input, Select } from "../../components/ui/Field"
import { dayNames } from "../../lib/utils"
import { expertAPI } from "../../services/api"

interface AvailabilityDraft {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export function ExpertAvailabilityPage() {
  const queryClient = useQueryClient()
  const availability = useQuery({ queryKey: ["expert-availability"], queryFn: expertAPI.availability })
  const [rows, setRows] = useState<AvailabilityDraft[]>([])

  useEffect(() => {
    if (availability.data) {
      const nextRows = availability.data.map((item) => ({
        day_of_week: item.day_of_week,
        start_time: item.start_time.slice(0, 5),
        end_time: item.end_time.slice(0, 5),
        is_active: item.is_active,
      }))
      const timer = window.setTimeout(() => setRows(nextRows), 0)

      return () => window.clearTimeout(timer)
    }
  }, [availability.data])

  const save = useMutation({
    mutationFn: () => expertAPI.updateAvailability(rows),
    onSuccess: () => {
      toast.success("تم حفظ أوقات التوفر")
      void queryClient.invalidateQueries({ queryKey: ["expert-availability"] })
    },
    onError: () => toast.error("تعذر حفظ التوفر"),
  })

  if (availability.isLoading) return <LoadingState />

  return (
    <div className="overflow-hidden rounded-md border border-black/10 bg-white/90 p-6 shadow-float backdrop-blur">
      <div className="masar-progress -mx-6 -mt-6 mb-6 h-1.5" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">أوقات التوفر الأسبوعية</h1>
          <p className="mt-2 text-sm text-slate-600">حدد الأيام والساعات التي يمكن للطلاب طلب الحجز فيها.</p>
        </div>
        <Button onClick={() => setRows((value) => [...value, { day_of_week: 1, start_time: "18:00", end_time: "21:00", is_active: true }])}>
          <Plus className="h-4 w-4" />
          إضافة وقت
        </Button>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((row, index) => (
          <div key={`${row.day_of_week}-${index}`} className="grid gap-3 rounded-md bg-paper p-4 ring-1 ring-black/10 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Select value={row.day_of_week} onChange={(event) => setRows((value) => value.map((item, itemIndex) => (itemIndex === index ? { ...item, day_of_week: Number(event.target.value) } : item)))}>
              {dayNames.map((day, dayIndex) => (
                <option key={day} value={dayIndex}>
                  {day}
                </option>
              ))}
            </Select>
            <Input type="time" value={row.start_time} onChange={(event) => setRows((value) => value.map((item, itemIndex) => (itemIndex === index ? { ...item, start_time: event.target.value } : item)))} />
            <Input type="time" value={row.end_time} onChange={(event) => setRows((value) => value.map((item, itemIndex) => (itemIndex === index ? { ...item, end_time: event.target.value } : item)))} />
            <Button variant="danger" size="icon" onClick={() => setRows((value) => value.filter((_, itemIndex) => itemIndex !== index))} aria-label="حذف">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button className="mt-6" onClick={() => save.mutate()} disabled={save.isPending}>
        حفظ التوفر
      </Button>
    </div>
  )
}
