import { useState } from "react"
import { useAuth } from "@/features/auth/AuthProvider"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { AdminFormDialog } from "./components/AdminFormDialog"
import { AdminList } from "./components/AdminList"
import { useAdmins } from "./hooks/useAdmins"

export function AdminsPage() {
  const { user } = useAuth()
  const admins = useAdmins(user?.id)
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <section>
      <PageHeader
        eyebrow="Access control"
        icon="admins"
        title="Admins"
        description="Manage who can access the ETA Company admin panel."
        actions={(
          <button className="button" onClick={() => setIsFormOpen(true)}>
            <Icon name="plus" />Add admin
          </button>
        )}
      />

      <AdminList
        admins={admins.items}
        currentAdminId={user?.id}
        loading={admins.loading}
        error={admins.error}
        onDelete={(admin) => void admins.deleteAdmin(admin)}
        onRetry={() => void admins.reload()}
      />

      {isFormOpen && (
        <AdminFormDialog
          onClose={() => setIsFormOpen(false)}
          onSave={admins.createAdmin}
        />
      )}
    </section>
  )
}
