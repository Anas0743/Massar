const sections = [
  {
    title: "البيانات التي نجمعها",
    body: "نجمع بيانات الحساب الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف الاختياري، وبيانات الملف الشخصي، وبيانات الحجوزات والدفع اليدوي، والرسائل التي ترسلها عبر نموذج التواصل.",
  },
  {
    title: "كيف نستخدم البيانات",
    body: "نستخدم البيانات لتشغيل الحسابات، إدارة الحجوزات، متابعة الدفع، تحسين تجربة المنصة، التواصل حول الجلسات، وحماية المنصة من الاستخدام غير المصرح به.",
  },
  {
    title: "مشاركة البيانات",
    body: "تظهر بيانات الحجز الضرورية للطرف الآخر في الجلسة، مثل اسم الطالب أو الخبير وموعد الجلسة ورسالة الطالب ورابط الاجتماع. لا نبيع بيانات المستخدمين لأطراف خارجية.",
  },
  {
    title: "الاحتفاظ والحذف",
    body: "نحتفظ بسجلات الحجوزات والمدفوعات والتقييمات لأغراض تشغيلية ومالية وحل النزاعات. يمكن تعطيل الحساب أو تحديث بياناته، مع بقاء السجلات التاريخية المرتبطة بالحقوق المالية محفوظة.",
  },
  {
    title: "الأمان",
    body: "نستخدم صلاحيات وصول، كلمات مرور مشفرة، وتعطيلًا تلقائيًا للجلسات القديمة عند تغيير كلمة المرور. يجب على المستخدم الحفاظ على سرية بيانات دخوله.",
  },
]

export function PrivacyPage() {
  return (
    <section className="masar-page-shell masar-grain relative -mt-20 overflow-hidden pb-16 pt-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black text-primary-700">آخر تحديث: 18 حزيران 2026</p>
        <h1 className="mt-3 text-4xl font-black text-ink">سياسة الخصوصية</h1>
        <p className="mt-4 text-sm leading-8 text-slate-600">
          توضّح هذه السياسة كيف تتعامل منصة مسار مع بيانات المستخدمين أثناء استخدام خدمات الإرشاد والحجز.
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
