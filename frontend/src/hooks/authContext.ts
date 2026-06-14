import { createContext } from "react"
import type { MeResponse, User, UserRole } from "../types/models"

export interface AuthContextValue {
  user: User | null
  me: MeResponse | null
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<User>
  register: (payload: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<User>
  refresh: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
