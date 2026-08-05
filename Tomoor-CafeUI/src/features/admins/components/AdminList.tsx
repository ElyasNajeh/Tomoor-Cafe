import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Admin } from "../admins.types"

type AdminListProps = {
  admins: Admin[]
  currentAdminId: number | undefined
  loading: boolean
  error: string
  onDelete: (admin: Admin) => void
  onRetry: () => void
}

export function AdminList(props: AdminListProps) {
  return (
    <LoadableContent
      loading={props.loading}
      loadingMessage="Loading admins…"
      error={props.error}
      onRetry={props.onRetry}
    >
      {props.admins.length === 0 ? (
        <EmptyState
          title="No admins found"
          message="Add an administrator to provide secure access."
        />
      ) : (
        <div className="admin-list">
          {props.admins.map((admin) => {
            const isCurrentAdmin = admin.id === props.currentAdminId

            return (
              <article className="admin-card" key={admin.id}>
                <span className="admin-avatar">{admin.email[0].toUpperCase()}</span>
                <div>
                  <strong>{admin.email.split("@")[0]}</strong>
                  <small>{admin.email}</small>
                  {isCurrentAdmin && <span className="current-admin">Current account</span>}
                </div>
                <button
                  className="button button--small button--text-danger"
                  disabled={isCurrentAdmin}
                  title={isCurrentAdmin ? "You cannot delete your own account" : "Delete admin"}
                  onClick={() => props.onDelete(admin)}
                >
                  <Icon name="trash" />Delete
                </button>
              </article>
            )
          })}
        </div>
      )}
    </LoadableContent>
  )
}
