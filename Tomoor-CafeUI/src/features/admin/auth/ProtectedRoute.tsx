// src/features/auth/ProtectedRoute.tsx

import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/features/admin/auth/AuthProvider"
import { AuthLoader } from "@/features/admin/auth/AuthLoader"
import { useI18n } from "@/localization/useI18n"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { t } = useI18n()
  const {
    isAuthReady,
    isAuthenticated,
  } = useAuth()

  if (!isAuthReady) {
    return <AuthLoader fullPage label={t("admin.login.checking")} />
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
