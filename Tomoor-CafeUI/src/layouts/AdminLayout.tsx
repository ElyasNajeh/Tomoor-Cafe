// src/layouts/AdminLayout.tsx

import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"

export function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  async function signOut() {
    await logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="admin-shell">
      <header>
        <strong>Tomoor Cafe Admin</strong>
        <span>{user?.username}</span>
        <button type="button" onClick={() => void signOut()}>Sign out</button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
