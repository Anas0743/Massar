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
import { Navigate, Route as RouterRoute, Routes } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardShell } from "./layouts/DashboardShell"
import { PublicLayout } from "./layouts/PublicLayout"
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage"
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage"
import { AdminExpertsPage } from "./pages/admin/AdminExpertsPage"
import { AdminFaqsPage } from "./pages/admin/AdminFaqsPage"
import { AdminSessionTypesPage } from "./pages/admin/AdminSessionTypesPage"
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage"
import { AdminTracksPage } from "./pages/admin/AdminTracksPage"
import { ExpertAvailabilityPage } from "./pages/expert/ExpertAvailabilityPage"
import { ExpertBookingsPage } from "./pages/expert/ExpertBookingsPage"
import { ExpertDashboardPage } from "./pages/expert/ExpertDashboardPage"
import { ExpertProfilePage } from "./pages/expert/ExpertProfilePage"
import { SessionNotesPage } from "./pages/expert/SessionNotesPage"
import { AboutPage } from "./pages/public/AboutPage"
import { ContactPage } from "./pages/public/ContactPage"
import { ExpertDetailsPage } from "./pages/public/ExpertDetailsPage"
import { ExpertsPage } from "./pages/public/ExpertsPage"
import { HomePage } from "./pages/public/HomePage"
import { LoginPage } from "./pages/public/LoginPage"
import { RegisterPage } from "./pages/public/RegisterPage"
import { SessionsPage } from "./pages/public/SessionsPage"
import { TracksPage } from "./pages/public/TracksPage"
import { BookingDetailsPage } from "./pages/student/BookingDetailsPage"
import { StudentBookingsPage } from "./pages/student/StudentBookingsPage"
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage"
import { StudentProfilePage } from "./pages/student/StudentProfilePage"

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
    <Routes>
      <RouterRoute element={<PublicLayout />}>
        <RouterRoute path="/" element={<HomePage />} />
        <RouterRoute path="/experts" element={<ExpertsPage />} />
        <RouterRoute path="/experts/:id" element={<ExpertDetailsPage />} />
        <RouterRoute path="/tracks" element={<TracksPage />} />
        <RouterRoute path="/sessions" element={<SessionsPage />} />
        <RouterRoute path="/about" element={<AboutPage />} />
        <RouterRoute path="/contact" element={<ContactPage />} />
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
  )
}

export default App
