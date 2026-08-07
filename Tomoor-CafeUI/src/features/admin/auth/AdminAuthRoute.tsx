import { Outlet } from "react-router-dom"

import { AuthProvider } from "./AuthProvider"

export function AdminAuthRoute() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
