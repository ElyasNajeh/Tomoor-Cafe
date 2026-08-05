import { useAuth } from "@/features/auth/AuthProvider"

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <section>
      <h2>Dashboard</h2>

      <p>
        Welcome {user?.email}
      </p>
    </section>
  )
}