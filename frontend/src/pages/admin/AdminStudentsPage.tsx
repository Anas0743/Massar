import { useQuery } from "@tanstack/react-query"
import { LoadingState } from "../../components/LoadingState"
import { adminAPI } from "../../services/api"

export function AdminStudentsPage() {
  const students = useQuery({ queryKey: ["admin-students"], queryFn: adminAPI.students })

  if (students.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="masar-soft-panel rounded-3xl border border-black/10 p-6 shadow-float backdrop-blur">
        <h1 className="text-2xl font-black">إدارة الطلاب</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">عرض سريع لحسابات الطلاب وحالة كل حساب داخل المنصة.</p>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-black/10 bg-white/90 shadow-float backdrop-blur">
        <div className="masar-progress h-1" />
        <table className="min-w-[720px] w-full text-right text-sm">
          <thead className="bg-paper text-slate-500">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">البريد</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.data?.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 font-black">{student.name}</td>
                <td className="px-4 py-3 text-slate-600">{student.email}</td>
                <td className="px-4 py-3">{student.is_active ? "نشط" : "معطل"}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(student.created_at).toLocaleDateString("ar-JO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

