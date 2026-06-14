import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { AuthContext } from "../hooks/authContext"
import { authAPI, TOKEN_KEY } from "../services/api"
import type { MeResponse, UserRole } from "../types/models"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refresh])

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const data = await authAPI.login(payload)
      localStorage.setItem(TOKEN_KEY, data.access_token)
      await refresh()
      return data.user
    },
    [refresh],
  )

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; role: UserRole; phone?: string }) => {
      const data = await authAPI.register(payload)
      localStorage.setItem(TOKEN_KEY, data.access_token)
      await refresh()
      return data.user
    },
    [refresh],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setMe(null)
  }, [])

  const value = useMemo(
    () => ({ user: me?.user ?? null, me, isLoading, login, register, refresh, logout }),
    [me, isLoading, login, register, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
