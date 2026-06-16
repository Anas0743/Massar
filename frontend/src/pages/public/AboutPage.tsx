import { GraduationCap, Target, UsersRound } from "lucide-react"
import { SectionHeader } from "../../components/SectionHeader"

export function AboutPage() {
  return (
    <section className="masar-grain relative -mt-20 bg-paper pb-16 pt-28">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary-100/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SectionHeader
            eyebrow="من نحن"
            title="مسار تبني جسرًا عمليًا بين الطالب وخبير التقنية"
            description="الفكرة ليست تقديم محتوى عام آخر، بل جلسة مباشرة تنتهي بقرار أو خطة أو تحسين ملموس."
          />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="masar-soft-panel relative overflow-hidden rounded-3xl border border-black/10 p-3 shadow-float backdrop-blur">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
              alt="جلسة إرشاد تقنية"
              className="h-full min-h-80 rounded-3xl object-cover"
            />
            <div className="absolute inset-x-8 bottom-8 rounded-full bg-white/90 px-5 py-3 text-sm font-black text-ink shadow-soft ring-1 ring-black/10 backdrop-blur">
              جلسة واحدة يمكن أن تختصر أسابيع من التردد.
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Target, title: "هدف واضح", text: "تقليل الحيرة أمام الطالب وتحويل السؤال الكبير إلى خطوات قابلة للتنفيذ." },
              { icon: UsersRound, title: "خبراء مناسبون", text: "اختيار الخبراء حسب المجال ونوع الجلسة والسعر والتقييم." },
              { icon: GraduationCap, title: "مصممة للجامعات", text: "تركز على التدريب، مشاريع التخرج، أول وظيفة، ومراجعة الملفات المهنية." },
            ].map((item) => (
              <div key={item.title} className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/88 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-float">
                <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-primary-500/10 blur-3xl transition group-hover:bg-primary-500/18" />
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-700">
                  <item.icon className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-xl font-black text-ink">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

