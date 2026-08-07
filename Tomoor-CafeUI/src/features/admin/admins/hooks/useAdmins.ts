import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { AdminsApi } from "../admins.api"
import type { Admin, AdminPayload } from "../admins.types"

export function useAdmins(currentAdminId: number | undefined) {
  const { toast, confirm } = useFeedback()
  const queryClient = useQueryClient()

  const adminsQuery = useQuery({
    queryKey: queryKeys.admins,
    queryFn: AdminsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: AdminsApi.create,
    onSuccess: async (_, payload) => {
      toast.success("Admin added", `${payload.email} can now sign in.`)
      await queryClient.invalidateQueries({ queryKey: queryKeys.admins })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (admin: Admin) => AdminsApi.delete(admin.id),
    onSuccess: async (_, admin) => {
      toast.success("Admin deleted", `${admin.email} no longer has access.`)
      await queryClient.invalidateQueries({ queryKey: queryKeys.admins })
    },
  })

  async function createAdmin(payload: AdminPayload) {
    await createMutation.mutateAsync(payload)
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
      await deleteMutation.mutateAsync(admin)
    } catch (caught) {
      toast.error("Could not delete admin", caught instanceof Error ? caught.message : undefined)
    }
  }

  const error = adminsQuery.error instanceof Error
    ? adminsQuery.error.message
    : adminsQuery.error
      ? "Unable to load admins"
      : ""

  return {
    items: adminsQuery.data ?? [],
    loading: adminsQuery.isPending,
    error,
    reload: adminsQuery.refetch,
    createAdmin,
    deleteAdmin,
  }
}
