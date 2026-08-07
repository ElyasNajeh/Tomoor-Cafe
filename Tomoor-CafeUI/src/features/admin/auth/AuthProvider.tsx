import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  AuthApi,
} from "./auth.api"

import type {
  AdminUser,
  LoginData,
} from "./types"


import { useRequest } from "@/shared/request/RequestProvider"
import { queryPersister } from "@/shared/query/queryClient"

type AuthContextValue = {
  user: AdminUser | null

  isAuthenticated: boolean
  isAuthReady: boolean

  login: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)

  const [isAuthReady, setIsAuthReady] = useState(false)

  const { runRequest } = useRequest()
  const queryClient = useQueryClient()

  const isAuthenticated = user !== null

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await runRequest(
        () => AuthApi.getMe(),
        {
          silentStatuses: [401],
        },
      )

      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsAuthReady(true)
    }
  }, [runRequest])

  useEffect(() => {
    // Auth bootstrap synchronizes this provider with the server-side cookie session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkAuth()
  }, [checkAuth])

  const login = useCallback(async (data: LoginData) => {
    await runRequest(async () => {
      await AuthApi.login(data)

      const currentUser = await AuthApi.getMe()

      setUser(currentUser)
    })
  }, [runRequest])

  const logout = useCallback(async () => {
    try {
      await runRequest(() => AuthApi.logout())
    } finally {
      queryClient.clear()

      try {
        await queryPersister.removeClient()
      } finally {
        setUser(null)
      }
    }
  }, [queryClient, runRequest])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthReady,
      login,
      logout,
      checkAuth,
    }),
    [
      user,
      isAuthenticated,
      isAuthReady,
      checkAuth,
      login,
      logout,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    )
  }

  return context
}
