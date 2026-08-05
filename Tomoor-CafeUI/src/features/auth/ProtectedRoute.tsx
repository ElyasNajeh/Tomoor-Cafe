// src/features/auth/ProtectedRoute.tsx

import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/features/auth/AuthProvider"
import { AuthLoader } from "@/features/auth/AuthLoader"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    isAuthReady,
    isAuthenticated,
  } = useAuth()

  if (!isAuthReady) {
    return <AuthLoader fullPage label="Checking admin session" />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return children
}
