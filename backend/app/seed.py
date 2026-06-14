from datetime import UTC, datetime, time, timedelta

from sqlalchemy import delete, insert, select

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.entities import (
    Availability,
    Booking,
    ExpertProfile,
    FAQ,
    Payment,
    Review,
    SessionNote,
    SessionType,
    StudentProfile,
    Track,
    User,
    expert_session_types,
    expert_tracks,
)
from app.models.enums import BookingStatus, PaymentMethod, PaymentStatus, UserRole
from app.services.serializers import recalculate_expert_rating

DEFAULT_PASSWORD = "Password123!"


TRACKS = [
    ("Frontend Development", "frontend", "بناء واجهات React حديثة وتجارب استخدام سريعة ومنظمة.", "MonitorSmartphone"),
    ("Backend Development", "backend", "تصميم APIs وقواعد بيانات وأنظمة قابلة للتوسع.", "Server"),
    ("AI / Data Science", "ai-data", "تعلم الذكاء الاصطناعي، تعلم الآلة، وتحليل البيانات بخطة واضحة.", "BrainCircuit"),
    ("Cybersecurity", "cybersecurity", "أساسيات الأمن السيبراني، المسارات، والمختبرات العملية.", "ShieldCheck"),
    ("Mobile Development", "mobile", "تطوير تطبيقات Flutter وReact Native وتجهيز مشاريع تطبيقية.", "Smartphone"),
    ("Cloud / DevOps", "devops", "النشر، Docker، CI/CD، Cloud، ومراقبة الأنظمة.", "CloudCog"),
    ("UI/UX", "ui-ux", "تحسين تجربة المستخدم، تصميم المنتجات، وبناء Portfolio قوي.", "Palette"),
    ("Career", "career", "مراجعة CV وLinkedIn وGitHub والتحضير للمقابلات.", "BriefcaseBusiness"),
]


SESSION_TYPES = [
    ("جلسة تحديد المسار", "career-path", "تخرج منها بخريطة طريق تناسب مستواك ووقتك.", 45, 25),
    ("مراجعة CV وLinkedIn", "cv-linkedin-review", "تحسين السيرة وملف LinkedIn للتدريب والوظائف.", 45, 20),
    ("مراجعة GitHub", "github-review", "ترتيب المشاريع والـ README ورفع جودة الحساب.", 45, 20),
    ("تحضير مقابلة تدريب", "internship-interview", "محاكاة مقابلة وتوجيه على نقاط التحسين.", 60, 35),
    ("اختيار مشروع تخرج", "graduation-project", "اختيار فكرة قابلة للتنفيذ وتحديد نطاقها التقني.", 60, 40),
    ("خطة تعلم 30 يوم", "30-day-plan", "خطة عملية يومية مع مصادر ومخرجات واضحة.", 45, 30),
    ("استشارة تقنية مخصصة", "custom-consulting", "جلسة مفتوحة لمشكلة تقنية أو قرار مسار.", 60, 45),
]


EXPERTS = [
    {
        "name": "لين الخطيب",
        "email": "frontend@masar.dev",
        "title": "Senior Frontend Engineer",
        "company": "Product Studio",
        "years": 6,
        "bio": "تساعد الطلاب على بناء أساس React قوي، تنظيم المشاريع، وتحويل أفكار الواجهات إلى تطبيقات قابلة للعرض.",
        "price": 30,
        "tracks": ["frontend", "ui-ux"],
        "sessions": ["career-path", "github-review", "30-day-plan", "custom-consulting"],
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "عمر العجارمة",
        "email": "backend@masar.dev",
        "title": "Backend Engineer",
        "company": "Fintech API Team",
        "years": 7,
        "bio": "يركز على FastAPI وNode.js وقواعد البيانات وتصميم REST APIs بطريقة مناسبة لمشاريع التخرج والعمل.",
        "price": 35,
        "tracks": ["backend", "devops"],
        "sessions": ["graduation-project", "custom-consulting", "internship-interview"],
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "سارة النجار",
        "email": "cyber@masar.dev",
        "title": "Cybersecurity Analyst",
        "company": "SOC Team",
        "years": 5,
        "bio": "ترشد الطلاب إلى أساسيات الشبكات، Linux، المختبرات، والتحضير لأول تدريب في الأمن السيبراني.",
        "price": 32,
        "tracks": ["cybersecurity"],
        "sessions": ["career-path", "30-day-plan", "custom-consulting"],
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "كريم منصور",
        "email": "ai@masar.dev",
        "title": "AI/Data Scientist",
        "company": "Analytics Lab",
        "years": 6,
        "bio": "يساعد في فهم Python وML وتحديد مشاريع بيانات مناسبة للمبتدئين والخريجين.",
        "price": 38,
        "tracks": ["ai-data"],
        "sessions": ["graduation-project", "30-day-plan", "custom-consulting"],
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "ديما زريقات",
        "email": "mobile@masar.dev",
        "title": "Mobile Developer",
        "company": "Apps Hub",
        "years": 5,
        "bio": "تقدم إرشادًا في Flutter وReact Native وبناء تطبيق MVP واضح لمشروع الجامعة أو التدريب.",
        "price": 28,
        "tracks": ["mobile", "frontend"],
        "sessions": ["career-path", "graduation-project", "custom-consulting"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "أنس أبو زيد",
        "email": "devops@masar.dev",
        "title": "Cloud / DevOps Engineer",
        "company": "CloudOps",
        "years": 8,
        "bio": "يبسط Docker وCI/CD والنشر السحابي للطلاب الذين يريدون تشغيل مشاريعهم باحتراف.",
        "price": 42,
        "tracks": ["devops", "backend"],
        "sessions": ["custom-consulting", "30-day-plan", "graduation-project"],
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    },
    {
        "name": "نور الحسن",
        "email": "career@masar.dev",
        "title": "Career Mentor for Junior Developers",
        "company": "Talent Partner",
        "years": 9,
        "bio": "تراجع CV وLinkedIn وGitHub وتجهز الطالب لأول مقابلة تدريب أو Junior role.",
        "price": 24,
        "tracks": ["career", "ui-ux"],
        "sessions": ["cv-linkedin-review", "github-review", "internship-interview", "career-path"],
        "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    },
]


FAQS = [
    ("هل مسار مناسبة للمبتدئين؟", "نعم. الجلسات مصممة لتقليل الحيرة وتحويل وضع الطالب الحالي إلى خطوة عملية واضحة.", 1),
    ("هل الدفع إلكتروني؟", "في الـ MVP الدفع يدوي، وتوجد حالة دفع قابلة للربط لاحقًا مع Stripe أو CliQ أو Zain Cash.", 2),
    ("ماذا أحصل بعد الجلسة؟", "يمكن للخبير رفع ملخص وخطة 30 يوم ومصادر مقترحة داخل لوحة الطالب.", 3),
    ("هل يمكن للخبير رفض الحجز؟", "نعم، الحجز يبدأ غالبًا كطلب pending ثم يوافق الخبير أو الأدمن ويضيف رابط الاجتماع.", 4),
]


def get_or_create_user(db, *, name: str, email: str, role: UserRole, avatar_url: str | None = None) -> User:
    user = db.scalars(select(User).where(User.email == email)).first()
    if user:
        return user
    user = User(
        name=name,
        email=email,
        password_hash=get_password_hash(DEFAULT_PASSWORD),
        role=role,
        avatar_url=avatar_url,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def seed() -> None:
    db = SessionLocal()
    try:
        admin = get_or_create_user(db, name="مدير مسار", email="admin@masar.dev", role=UserRole.ADMIN)

        student = get_or_create_user(db, name="رامي الطالب", email="student@masar.dev", role=UserRole.STUDENT)
        if not student.student_profile:
            db.add(
                StudentProfile(
                    user_id=student.id,
                    university="جامعة اليرموك",
                    major="Computer Science",
                    academic_year="السنة الثالثة",
                    current_skills=["HTML", "CSS", "JavaScript"],
                    interested_tracks=["frontend", "career"],
                    github_url="https://github.com/masar-student",
                    linkedin_url="https://linkedin.com/in/masar-student",
                    bio="أبحث عن خطة واضحة للوصول إلى أول تدريب Frontend.",
                )
            )

        second_student = get_or_create_user(db, name="ليان الخريجة", email="graduate@masar.dev", role=UserRole.STUDENT)
        if not second_student.student_profile:
            db.add(
                StudentProfile(
                    user_id=second_student.id,
                    university="الجامعة الأردنية",
                    major="Software Engineering",
                    academic_year="خريجة حديثًا",
                    current_skills=["Python", "SQL"],
                    interested_tracks=["ai-data", "backend"],
                )
            )

        track_by_slug: dict[str, Track] = {}
        for name, slug, description, icon in TRACKS:
            track = db.scalars(select(Track).where(Track.slug == slug)).first()
            if not track:
                track = Track(name=name, slug=slug, description=description, icon=icon, is_active=True)
                db.add(track)
                db.flush()
            track_by_slug[slug] = track

        session_by_slug: dict[str, SessionType] = {}
        for name, slug, description, duration, price in SESSION_TYPES:
            session_type = db.scalars(select(SessionType).where(SessionType.slug == slug)).first()
            if not session_type:
                session_type = SessionType(
                    name=name,
                    slug=slug,
                    description=description,
                    duration_minutes=duration,
                    base_price=price,
                    is_active=True,
                )
                db.add(session_type)
                db.flush()
            session_by_slug[slug] = session_type

        expert_users: list[User] = []
        for index, item in enumerate(EXPERTS):
            expert = get_or_create_user(
                db,
                name=item["name"],
                email=item["email"],
                role=UserRole.EXPERT,
                avatar_url=item["avatar"],
            )
            expert_users.append(expert)
            profile = expert.expert_profile
            if not profile:
                profile = ExpertProfile(user_id=expert.id)
                db.add(profile)
            profile.title = item["title"]
            profile.company = item["company"]
            profile.years_of_experience = item["years"]
            profile.bio = item["bio"]
            profile.hourly_price = item["price"]
            profile.session_duration_minutes = 45
            profile.linkedin_url = f"https://linkedin.com/in/{item['email'].split('@')[0]}-masar"
            profile.github_url = f"https://github.com/{item['email'].split('@')[0]}-masar"
            profile.portfolio_url = f"https://masar.dev/experts/{item['email'].split('@')[0]}"
            profile.is_approved = True

            db.execute(delete(expert_tracks).where(expert_tracks.c.expert_id == expert.id))
            for slug in item["tracks"]:
                db.execute(insert(expert_tracks).values(expert_id=expert.id, track_id=track_by_slug[slug].id))

            db.execute(delete(expert_session_types).where(expert_session_types.c.expert_id == expert.id))
            for slug in item["sessions"]:
                db.execute(
                    insert(expert_session_types).values(
                        expert_id=expert.id,
                        session_type_id=session_by_slug[slug].id,
                        custom_price=None,
                    )
                )

            if not db.scalars(select(Availability).where(Availability.expert_id == expert.id)).first():
                db.add_all(
                    [
                        Availability(expert_id=expert.id, day_of_week=(index + 1) % 7, start_time=time(17, 0), end_time=time(20, 0)),
                        Availability(expert_id=expert.id, day_of_week=(index + 3) % 7, start_time=time(18, 0), end_time=time(21, 0)),
                    ]
                )

        for question, answer, order in FAQS:
            if not db.scalars(select(FAQ).where(FAQ.question == question)).first():
                db.add(FAQ(question=question, answer=answer, order=order, is_active=True))

        db.flush()

        if not db.scalars(select(Booking)).first():
            first_expert = expert_users[0]
            career_expert = expert_users[-1]
            ai_expert = expert_users[3]
            now = datetime.now(UTC)

            bookings = [
                Booking(
                    student_id=student.id,
                    expert_id=first_expert.id,
                    session_type_id=session_by_slug["30-day-plan"].id,
                    scheduled_at=now + timedelta(days=3),
                    duration_minutes=45,
                    price=30,
                    status=BookingStatus.CONFIRMED,
                    meeting_url="https://meet.google.com/masar-demo-one",
                    student_message="أريد خطة عملية لأصبح جاهزًا لتدريب Frontend.",
                    expert_message="سأراجع GitHub الحالي ونبني خطة 30 يوم.",
                ),
                Booking(
                    student_id=student.id,
                    expert_id=career_expert.id,
                    session_type_id=session_by_slug["cv-linkedin-review"].id,
                    scheduled_at=now - timedelta(days=7),
                    duration_minutes=45,
                    price=20,
                    status=BookingStatus.COMPLETED,
                    meeting_url="https://meet.google.com/masar-demo-two",
                    student_message="أحتاج ترتيب CV وLinkedIn لأول تدريب.",
                ),
                Booking(
                    student_id=second_student.id,
                    expert_id=ai_expert.id,
                    session_type_id=session_by_slug["graduation-project"].id,
                    scheduled_at=now + timedelta(days=5),
                    duration_minutes=60,
                    price=40,
                    status=BookingStatus.PENDING,
                    student_message="أفكر بمشروع تخرج في تحليل بيانات التعليم.",
                ),
            ]
            db.add_all(bookings)
            db.flush()

            for booking in bookings:
                db.add(
                    Payment(
                        booking_id=booking.id,
                        amount=booking.price,
                        currency="JOD",
                        status=PaymentStatus.PAID if booking.status == BookingStatus.COMPLETED else PaymentStatus.UNPAID,
                        payment_method=PaymentMethod.MANUAL,
                        transaction_reference="manual-seed" if booking.status == BookingStatus.COMPLETED else None,
                    )
                )

            completed_booking = bookings[1]
            db.add(
                SessionNote(
                    booking_id=completed_booking.id,
                    summary="تمت مراجعة CV وLinkedIn وتحديد الرسائل الأساسية للملف المهني.",
                    strengths="مشاريع جامعية جيدة، وضوح في المسار المطلوب، واستعداد للتطبيق العملي.",
                    weaknesses="وصف المشاريع يحتاج أرقامًا ونتائج، وGitHub يحتاج READMEs أوضح.",
                    action_plan_30_days="الأسبوع 1: تحسين CV. الأسبوع 2: ترتيب LinkedIn. الأسبوع 3: توثيق مشروعين. الأسبوع 4: تقديم على 15 فرصة.",
                    resources="Google Developer Profile, GitHub README templates, LinkedIn headline examples.",
                    next_steps="إرسال نسخة CV المحدثة قبل نهاية الأسبوع.",
                )
            )
            review = Review(
                booking_id=completed_booking.id,
                student_id=student.id,
                expert_id=career_expert.id,
                rating=5,
                comment="الجلسة رتبت أفكاري جدًا وخرجت بخطوات واضحة.",
            )
            db.add(review)
            db.flush()
            recalculate_expert_rating(db, career_expert.id)

        db.commit()
        print("Seed completed.")
        print("Admin: admin@masar.dev / Password123!")
        print("Student: student@masar.dev / Password123!")
        print("Expert sample: frontend@masar.dev / Password123!")
        _ = admin
    finally:
        db.close()


if __name__ == "__main__":
    seed()
