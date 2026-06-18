const sections = [
  {
    title: "طبيعة الخدمة",
    body: "مسار منصة تنظم جلسات إرشاد بين الطلاب والخبراء. لا تضمن المنصة نتيجة وظيفية أو قبولًا في تدريب، لكنها تساعد على تنظيم الإرشاد والخطة والمتابعة.",
  },
  {
    title: "حسابات المستخدمين",
    body: "يجب إدخال بيانات صحيحة والحفاظ على سرية الحساب. يمكن للإدارة تعطيل الحسابات المخالفة أو غير الموثوقة لحماية المستخدمين والمنصة.",
  },
  {
    title: "الحجوزات والجلسات",
    body: "يبدأ الحجز كطلب بانتظار المراجعة أو الدفع. يصبح الحجز مؤكدًا بعد تحديث الدفع وموافقة الخبير أو الإدارة. يجب الالتزام بموعد الجلسة ورابط الاجتماع المضاف.",
  },
  {
    title: "الدفع اليدوي",
    body: "يعتمد الإصدار الحالي على تأكيد دفع يدوي من الإدارة. لا يُعد الحجز مؤكدًا قبل وضع حالة الدفع كمدفوع وإضافة مرجع الدفع عند الحاجة.",
  },
  {
    title: "المحتوى والسلوك",
    body: "يُمنع استخدام المنصة للإساءة أو مشاركة محتوى غير قانوني أو انتحال الهوية. يحق للإدارة إزالة المحتوى المخالف أو تقييد الحساب.",
  },
]

export function TermsPage() {
  return (
    <section className="masar-page-shell masar-grain relative -mt-20 overflow-hidden pb-16 pt-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black text-primary-700">آخر تحديث: 18 حزيران 2026</p>
        <h1 className="mt-3 text-4xl font-black text-ink">شروط الاستخدام</h1>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          باستخدامك لمنصة مسار، فأنت توافق على هذه الشروط وعلى سياسات الحجز والدفع والإلغاء المنشورة داخل المنصة.
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
