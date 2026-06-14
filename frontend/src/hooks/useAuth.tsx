import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { authAPI, TOKEN_KEY } from "../services/api"
import type { MeResponse, User, UserRole } from "../types/models"

interface AuthContextValue {
  user: User | null
  me: MeResponse | null
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<User>
  register: (payload: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<User>
  refresh: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setMe(null)
      setIsLoading(false)
      return
    }
    try {
      const data = await authAPI.me()
      setMe(data)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setMe(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const login = async (payload: { email: string; password: string }) => {
    const data = await authAPI.login(payload)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    await refresh()
    return data.user
  }

  const register = async (payload: { name: string; email: string; password: string; role: UserRole; phone?: string }) => {
    const data = await authAPI.register(payload)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    await refresh()
    return data.user
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setMe(null)
  }

  const value = useMemo(
    () => ({ user: me?.user ?? null, me, isLoading, login, register, refresh, logout }),
    [me, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
