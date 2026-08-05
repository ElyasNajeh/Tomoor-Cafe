import { useCallback, useEffect, useState } from "react"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { AdminsApi } from "../admins.api"
import type { Admin, AdminPayload } from "../admins.types"

export function useAdmins(currentAdminId: number | undefined) {
  const { toast, confirm } = useFeedback()
  const [items, setItems] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      setItems(await AdminsApi.list())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load admins")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Synchronize this protected route with the server-side admin list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAdmins()
  }, [loadAdmins])

  async function createAdmin(payload: AdminPayload) {
    await AdminsApi.create(payload)
    toast.success("Admin added", `${payload.email} can now sign in.`)
    await loadAdmins()
  }

  async function deleteAdmin(admin: Admin) {
    if (admin.id === currentAdminId) {
      return
    }

    const confirmed = await confirm({
      title: "Delete admin?",
      message: `Remove access for ${admin.email}? They will no longer be able to sign in.`,
      confirmLabel: "Delete admin",
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await AdminsApi.delete(admin.id)
      toast.success("Admin deleted", `${admin.email} no longer has access.`)
      await loadAdmins()
    } catch (caught) {
      toast.error("Could not delete admin", caught instanceof Error ? caught.message : undefined)
    }
  }

  return {
    items,
    loading,
    error,
    reload: loadAdmins,
    createAdmin,
    deleteAdmin,
  }
}
