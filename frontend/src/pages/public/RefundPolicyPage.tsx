const sections = [
  {
    title: "تأكيد الدفع",
    body: "تُسجل المدفوعات يدويًا من الإدارة مع مرجع دفع. لا يبدأ تأكيد الحجز قبل ظهور حالة الدفع كمدفوع داخل النظام.",
  },
  {
    title: "إلغاء الطالب",
    body: "يمكن للطالب إلغاء الحجز قبل الموعد ضمن مهلة الإلغاء المحددة في إعدادات المنصة. بعد انتهاء المهلة، تحتاج حالات الإلغاء إلى مراجعة الإدارة.",
  },
  {
    title: "إلغاء الخبير أو الإدارة",
    body: "إذا تعذر على الخبير تنفيذ الجلسة، يمكن إلغاء الحجز أو إعادة جدولته بالتنسيق مع الطالب. تحتفظ الإدارة بحق مراجعة الحالة وتحديث الدفع حسب الاتفاق.",
  },
  {
    title: "الاسترداد",
    body: "تُراجع طلبات الاسترداد يدويًا بناءً على حالة الحجز، وقت الإلغاء، وتنفيذ الجلسة. عند قبول الاسترداد، تُحدّث حالة الدفع إلى مسترد مع حفظ مرجع العملية.",
  },
  {
    title: "النزاعات",
    body: "في حال وجود خلاف حول جودة الجلسة أو حضور أحد الأطراف، تراجع الإدارة سجل الحجز، رسائل الأطراف، وحالة الدفع لاتخاذ قرار مناسب.",
  },
]

export function RefundPolicyPage() {
  return (
    <section className="masar-page-shell masar-grain relative -mt-20 overflow-hidden pb-16 pt-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black text-primary-700">آخر تحديث: 18 حزيران 2026</p>
        <h1 className="mt-3 text-4xl font-black text-ink">سياسة الإلغاء والاسترداد</h1>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          توضّح هذه السياسة طريقة التعامل مع الإلغاء والاسترداد في نظام الدفع اليدوي الحالي.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur">
              <h2 className="text-xl font-black text-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-8 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
