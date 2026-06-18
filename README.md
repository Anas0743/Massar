# مسار - Masar

منصة SaaS/Marketplace لإرشاد واستشارات طلاب وخريجي أقسام IT. الإصدار الحالي يحتوي على طلاب، خبراء، أدمن، حجوزات، توفر أسبوعي، ملخصات جلسات، تقييمات، دفع يدوي، ومحتوى أساسي قابل للإدارة.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS + React Router + TanStack Query + React Hook Form + Zod.
- Backend: FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL + JWT + Role-based access control.
- DevOps: Docker Compose لتشغيل PostgreSQL والـ API والواجهة.

## المعمارية

```text
.
├── backend
│   ├── alembic
│   │   └── versions
│   ├── app
│   │   ├── api/routes
│   │   ├── core
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   ├── main.py
│   │   └── seed.py
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── i18n
│   │   ├── layouts
│   │   ├── pages
│   │   ├── services
│   │   ├── types
│   │   └── lib
│   └── package.json
└── docker-compose.yml
```

## التشغيل عبر Docker

```bash
docker compose up --build
```

بعد التشغيل:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- PostgreSQL host port: `5433` داخل الجهاز، و`5432` داخل شبكة Docker.

الـ backend يشغل migrations ثم seed تلقائيًا عند بدء الحاوية.

إذا كان Docker Desktop مغلقًا، افتحه أولًا وتأكد أن `docker info` يعرض قسم `Server` قبل تشغيل الأمر.

## التشغيل الإنتاجي عبر Docker

ملف `docker-compose.yml` مخصص للتطوير فقط لأنه يشغل seed تلقائيًا ويفعل `--reload`.
للإنتاج استخدم `docker-compose.prod.yml`.

1. أنشئ ملف بيئة إنتاج من المثال:

```bash
cp .env.production.example .env.production
```

2. عدل القيم داخل `.env.production`، خصوصًا:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY` بقيمة عشوائية قوية لا تقل عن 32 حرفًا
- `BACKEND_CORS_ORIGINS` بدومين الواجهة الحقيقي
- `APP_DOMAIN` بدومين المنصة عند استخدام HTTPS عبر Caddy
- إعدادات rate limiting مثل `LOGIN_RATE_LIMIT` و`PASSWORD_CHANGE_RATE_LIMIT` و`BOOKING_RATE_LIMIT`
- قواعد الحجز والدفع مثل `BOOKING_CANCELLATION_CUTOFF_HOURS` و`REQUIRE_PAYMENT_BEFORE_CONFIRMATION`
- `ADMIN_EMAIL` و`ADMIN_PASSWORD` لإنشاء أول أدمن

3. شغل الخدمات:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

لتفعيل HTTPS عبر Caddy داخل نفس Compose، اضبط `APP_DOMAIN` واجعل `FRONTEND_PORT` منفذًا محليًا غير 80 مثل `127.0.0.1:8080`، ثم شغل:

```bash
docker compose --profile https --env-file .env.production -f docker-compose.prod.yml up -d --build
```

4. أنشئ أول حساب أدمن مرة واحدة بعد تشغيل قاعدة البيانات والباكند:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm backend python -m app.bootstrap_admin
```

في إعداد الإنتاج الافتراضي، الواجهة تخدم التطبيق عبر Nginx، وطلبات API تمر عبر `/api` إلى الباكند داخليًا. قاعدة البيانات لا تُفتح كمنفذ عام.

لأخذ نسخة احتياطية يدوية من PostgreSQL على السيرفر:

```bash
sh scripts/backup_postgres.sh
```

يمكن ربط السكربت بـ cron يومي ورفع مجلد `backups/postgres` إلى تخزين خارجي آمن.

## التشغيل المحلي بدون Docker

شغل PostgreSQL ثم أنشئ `backend/.env` من `backend/.env.example`.

```bash
cd backend
python -m pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

وفي نافذة أخرى:

```bash
cd frontend
npm install
npm run dev
```

## الحسابات التجريبية

كل الحسابات تستخدم كلمة المرور:

```text
Password123!
```

- Admin: `admin@masar.dev`
- Student: `student@masar.dev`
- Expert: `frontend@masar.dev`

يوجد أيضًا خبراء تجريبيون للبنية الخلفية، الأمن السيبراني، AI/Data، Mobile، DevOps، وCareer.

## أهم المسارات

- Public: `/`, `/experts`, `/experts/:id`, `/tracks`, `/sessions`, `/about`, `/contact`, `/login`, `/register`
- Legal: `/privacy`, `/terms`, `/refund-policy`
- Student: `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/:id`, `/dashboard/profile`
- Expert: `/expert/dashboard`, `/expert/bookings`, `/expert/availability`, `/expert/profile`, `/expert/session-notes/:bookingId`
- Admin: `/admin`, `/admin/experts`, `/admin/students`, `/admin/bookings`, `/admin/tracks`, `/admin/session-types`, `/admin/faqs`

## API مختصر

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`
- Experts: `GET /experts`, `GET /experts/{id}`, `GET /experts/{id}/available-slots`, `PUT /experts/profile`, `GET /expert/bookings`
- Bookings: `POST /bookings`, `GET /student/bookings`, `GET /bookings/{id}`, `PUT /bookings/{id}/status`
- Notes & Reviews: `POST /bookings/{id}/session-note`, `POST /bookings/{id}/review`
- Admin: `GET /admin/stats`, `GET /admin/users`, `GET /admin/experts`, `GET /admin/bookings`
- Content: `GET /faqs`, `POST /contact`, و CRUD للأسئلة الشائعة من الأدمن.

## ملاحظات تشغيلية

- الدفع يدوي عبر `payments.status` و`payment_method=manual` مع قابلية الربط لاحقًا بمزود دفع.
- عند تفعيل `REQUIRE_PAYMENT_BEFORE_CONFIRMATION` لا يمكن تأكيد أو إكمال الحجز قبل أن يضع الأدمن الدفع كـ `paid`.
- تغيير الدفع إلى `paid` أو `refunded` يتطلب مرجع دفع إذا كان `PAYMENT_REFERENCE_REQUIRED=true`.
- الطالب يستطيع إلغاء الحجز قبل الموعد بعدد الساعات المحدد في `BOOKING_CANCELLATION_CUTOFF_HOURS`.
- لا يمكن إكمال الجلسة أو إضافة ملخصها قبل انتهاء وقتها المجدول.
- حذف المجالات وأنواع الجلسات من لوحة الأدمن يقوم بأرشفتها/تعطيلها بدل حذفها فعليًا، حفاظًا على البيانات القديمة.
- توجد حماية rate limiting مبدئية داخل الذاكرة للمسارات الحساسة مع تنظيف دوري للمفاتيح القديمة. عند تشغيل أكثر من instance يجب نقلها إلى Redis أو مزود مركزي.
- التسجيل العام مخصص للطلاب فقط.
- حسابات الخبراء ينشئها الأدمن من `/admin/experts`، ويمكن تركها بانتظار المراجعة أو اعتمادها فورًا.
- النصوص العربية بدأت من `frontend/src/i18n/ar.ts` مع بقاء بعض نصوص الصفحات داخل المكونات لتسهيل التطوير السريع، ويمكن فصلها لاحقًا بالكامل.
- Dark Mode ليس مفعلًا في الواجهة بعد، لكن الألوان والـ Tailwind config يسمحان بإضافته لاحقًا بسهولة.
