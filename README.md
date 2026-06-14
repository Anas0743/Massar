# مسار - Masar

منصة SaaS/Marketplace لإرشاد واستشارات طلاب وخريجي أقسام IT. الـ MVP يحتوي على طلاب، خبراء، أدمن، حجوزات، توفر أسبوعي، ملخصات جلسات، تقييمات، دفع يدوي، ومحتوى أساسي قابل للإدارة.

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
- Student: `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/:id`, `/dashboard/profile`
- Expert: `/expert/dashboard`, `/expert/bookings`, `/expert/availability`, `/expert/profile`, `/expert/session-notes/:bookingId`
- Admin: `/admin`, `/admin/experts`, `/admin/students`, `/admin/bookings`, `/admin/tracks`, `/admin/session-types`, `/admin/faqs`

## API مختصر

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Experts: `GET /experts`, `GET /experts/{id}`, `PUT /experts/profile`, `GET /expert/bookings`
- Bookings: `POST /bookings`, `GET /student/bookings`, `GET /bookings/{id}`, `PUT /bookings/{id}/status`
- Notes & Reviews: `POST /bookings/{id}/session-note`, `POST /bookings/{id}/review`
- Admin: `GET /admin/stats`, `GET /admin/users`, `GET /admin/experts`, `GET /admin/bookings`
- Content: `GET /faqs`, `POST /contact`, و CRUD للأسئلة الشائعة من الأدمن.

## ملاحظات MVP

- الدفع يدوي عبر `payments.status` و`payment_method=manual`.
- التسجيل العام مخصص للطلاب فقط.
- حسابات الخبراء ينشئها الأدمن من `/admin/experts`، ويمكن تركها بانتظار المراجعة أو اعتمادها فورًا.
- النصوص العربية بدأت من `frontend/src/i18n/ar.ts` مع بقاء بعض نصوص الصفحات داخل المكونات لتسهيل التطوير السريع، ويمكن فصلها لاحقًا بالكامل.
- Dark Mode ليس مفعلًا في الواجهة بعد، لكن الألوان والـ Tailwind config يسمحان بإضافته لاحقًا بسهولة.
