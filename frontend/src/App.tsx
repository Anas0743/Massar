import {
  CalendarClock,
  ClipboardList,
  FileQuestion,
  LayoutDashboard,
  ListChecks,
  Route,
  Settings,
  UserCog,
  UserRound,
  Users,
} from "lucide-react"
import { lazy, Suspense, type ComponentType } from "react"
import { Navigate, Route as RouterRoute, Routes } from "react-router-dom"
import { LoadingState } from "./components/LoadingState"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Seo } from "./components/Seo"
import { DashboardShell } from "./layouts/DashboardShell"
import { PublicLayout } from "./layouts/PublicLayout"

function lazyPage<T extends Record<string, ComponentType>>(loader: () => Promise<T>, exportName: keyof T) {
  return lazy(async () => ({ default: (await loader())[exportName] }))
}

const AdminBookingsPage = lazyPage(() => import("./pages/admin/AdminBookingsPage"), "AdminBookingsPage")
const AdminDashboardPage = lazyPage(() => import("./pages/admin/AdminDashboardPage"), "AdminDashboardPage")
const AdminExpertsPage = lazyPage(() => import("./pages/admin/AdminExpertsPage"), "AdminExpertsPage")
const AdminFaqsPage = lazyPage(() => import("./pages/admin/AdminFaqsPage"), "AdminFaqsPage")
const AdminSessionTypesPage = lazyPage(() => import("./pages/admin/AdminSessionTypesPage"), "AdminSessionTypesPage")
const AdminStudentsPage = lazyPage(() => import("./pages/admin/AdminStudentsPage"), "AdminStudentsPage")
const AdminTracksPage = lazyPage(() => import("./pages/admin/AdminTracksPage"), "AdminTracksPage")
const ExpertAvailabilityPage = lazyPage(() => import("./pages/expert/ExpertAvailabilityPage"), "ExpertAvailabilityPage")
const ExpertBookingsPage = lazyPage(() => import("./pages/expert/ExpertBookingsPage"), "ExpertBookingsPage")
const ExpertDashboardPage = lazyPage(() => import("./pages/expert/ExpertDashboardPage"), "ExpertDashboardPage")
const ExpertProfilePage = lazyPage(() => import("./pages/expert/ExpertProfilePage"), "ExpertProfilePage")
const SessionNotesPage = lazyPage(() => import("./pages/expert/SessionNotesPage"), "SessionNotesPage")
const AboutPage = lazyPage(() => import("./pages/public/AboutPage"), "AboutPage")
const ContactPage = lazyPage(() => import("./pages/public/ContactPage"), "ContactPage")
const ExpertDetailsPage = lazyPage(() => import("./pages/public/ExpertDetailsPage"), "ExpertDetailsPage")
const ExpertsPage = lazyPage(() => import("./pages/public/ExpertsPage"), "ExpertsPage")
const HomePage = lazyPage(() => import("./pages/public/HomePage"), "HomePage")
const LoginPage = lazyPage(() => import("./pages/public/LoginPage"), "LoginPage")
const PrivacyPage = lazyPage(() => import("./pages/public/PrivacyPage"), "PrivacyPage")
const RefundPolicyPage = lazyPage(() => import("./pages/public/RefundPolicyPage"), "RefundPolicyPage")
const RegisterPage = lazyPage(() => import("./pages/public/RegisterPage"), "RegisterPage")
const SessionsPage = lazyPage(() => import("./pages/public/SessionsPage"), "SessionsPage")
const TermsPage = lazyPage(() => import("./pages/public/TermsPage"), "TermsPage")
const TracksPage = lazyPage(() => import("./pages/public/TracksPage"), "TracksPage")
const BookingDetailsPage = lazyPage(() => import("./pages/student/BookingDetailsPage"), "BookingDetailsPage")
const StudentBookingsPage = lazyPage(() => import("./pages/student/StudentBookingsPage"), "StudentBookingsPage")
const StudentDashboardPage = lazyPage(() => import("./pages/student/StudentDashboardPage"), "StudentDashboardPage")
const StudentProfilePage = lazyPage(() => import("./pages/student/StudentProfilePage"), "StudentProfilePage")

const studentNav = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, end: true },
  { to: "/dashboard/bookings", label: "حجوزاتي", icon: ClipboardList },
  { to: "/dashboard/profile", label: "ملفي", icon: UserRound },
]

const expertNav = [
  { to: "/expert/dashboard", label: "الرئيسية", icon: LayoutDashboard, end: true },
  { to: "/expert/bookings", label: "الحجوزات", icon: CalendarClock },
  { to: "/expert/availability", label: "التوفر", icon: ListChecks },
  { to: "/expert/profile", label: "ملفي", icon: UserCog },
]

const adminNav = [
  { to: "/admin", label: "الإحصاءات", icon: LayoutDashboard, end: true },
  { to: "/admin/experts", label: "الخبراء", icon: UserCog },
  { to: "/admin/students", label: "الطلاب", icon: Users },
  { to: "/admin/bookings", label: "الحجوزات", icon: CalendarClock },
  { to: "/admin/tracks", label: "المجالات", icon: Route },
  { to: "/admin/session-types", label: "الجلسات", icon: Settings },
  { to: "/admin/faqs", label: "FAQ", icon: FileQuestion },
]

function App() {
  return (
    <>
      <Seo />
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <RouterRoute element={<PublicLayout />}>
            <RouterRoute path="/" element={<HomePage />} />
            <RouterRoute path="/experts" element={<ExpertsPage />} />
            <RouterRoute path="/experts/:id" element={<ExpertDetailsPage />} />
            <RouterRoute path="/tracks" element={<TracksPage />} />
            <RouterRoute path="/sessions" element={<SessionsPage />} />
            <RouterRoute path="/about" element={<AboutPage />} />
            <RouterRoute path="/contact" element={<ContactPage />} />
            <RouterRoute path="/privacy" element={<PrivacyPage />} />
            <RouterRoute path="/terms" element={<TermsPage />} />
            <RouterRoute path="/refund-policy" element={<RefundPolicyPage />} />
            <RouterRoute path="/login" element={<LoginPage />} />
            <RouterRoute path="/register" element={<RegisterPage />} />
          </RouterRoute>

          <RouterRoute element={<ProtectedRoute roles={["student"]} />}>
            <RouterRoute element={<DashboardShell title="لوحة الطالب" navItems={studentNav} />}>
              <RouterRoute path="/dashboard" element={<StudentDashboardPage />} />
              <RouterRoute path="/dashboard/bookings" element={<StudentBookingsPage />} />
              <RouterRoute path="/dashboard/bookings/:id" element={<BookingDetailsPage />} />
              <RouterRoute path="/dashboard/profile" element={<StudentProfilePage />} />
            </RouterRoute>
          </RouterRoute>

          <RouterRoute element={<ProtectedRoute roles={["expert"]} />}>
            <RouterRoute element={<DashboardShell title="لوحة الخبير" navItems={expertNav} />}>
              <RouterRoute path="/expert/dashboard" element={<ExpertDashboardPage />} />
              <RouterRoute path="/expert/bookings" element={<ExpertBookingsPage />} />
              <RouterRoute path="/expert/availability" element={<ExpertAvailabilityPage />} />
              <RouterRoute path="/expert/profile" element={<ExpertProfilePage />} />
              <RouterRoute path="/expert/session-notes/:bookingId" element={<SessionNotesPage />} />
            </RouterRoute>
          </RouterRoute>

          <RouterRoute element={<ProtectedRoute roles={["admin"]} />}>
            <RouterRoute element={<DashboardShell title="لوحة الأدمن" navItems={adminNav} />}>
              <RouterRoute path="/admin" element={<AdminDashboardPage />} />
              <RouterRoute path="/admin/experts" element={<AdminExpertsPage />} />
              <RouterRoute path="/admin/students" element={<AdminStudentsPage />} />
              <RouterRoute path="/admin/bookings" element={<AdminBookingsPage />} />
              <RouterRoute path="/admin/tracks" element={<AdminTracksPage />} />
              <RouterRoute path="/admin/session-types" element={<AdminSessionTypesPage />} />
              <RouterRoute path="/admin/faqs" element={<AdminFaqsPage />} />
            </RouterRoute>
          </RouterRoute>

          <RouterRoute path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
