import { Navigate, Outlet, useLocation } from "react-router-dom"
import { LoadingState } from "./LoadingState"
import { useAuth } from "../hooks/useAuth"
import type { UserRole } from "../types/models"

const roleHome: Record<UserRole, string> = {
  student: "/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin",
}

export function ProtectedRoute({ roles }: { roles: UserRole[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingState label="نتحقق من الجلسة..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!roles.includes(user.role)) return <Navigate to={roleHome[user.role]} replace />

  return <Outlet />
}
