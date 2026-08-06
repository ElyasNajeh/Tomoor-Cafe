import { useState, type FormEvent } from "react"
import { ApiError } from "@/shared/api/error"
import { Icon } from "@/shared/components/Icon"
import type { AdminPayload } from "../admins.types"

type AdminFormDialogProps = {
  onClose: () => void
  onSave: (payload: AdminPayload) => Promise<void>
}

export function AdminFormDialog({
  onClose,
  onSave,
}: AdminFormDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (saving) {
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await onSave({
        email: email.trim().toLowerCase(),
        password,
      })

      onClose()
    } catch (caught) {
      setFormError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to add admin",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form
        className="form-dialog admin-form"
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>New account</span>
            <h2>Add admin</h2>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="form-grid form-grid--single">
          <label>
            Email

            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={saving}
            />
          </label>

          <label>
            Temporary password

            <input
              type="password"
              autoComplete="new-password"
              minLength={4}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={saving}
            />

            <small>At least 4 characters.</small>
          </label>
        </div>

        {formError && (
          <p className="form-error">{formError}</p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="button"
            disabled={saving}
          >
            {saving ? "Adding…" : "Add admin"}
          </button>
        </div>
      </form>
    </div>
  )
}