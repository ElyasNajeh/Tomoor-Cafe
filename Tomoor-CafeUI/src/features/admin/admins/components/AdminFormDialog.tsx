import { useState, type FormEvent } from "react"
import { ApiError } from "@/shared/api/error"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import type { AdminPayload } from "../admins.types"

type AdminFormDialogProps = {
  onClose: () => void
  onSave: (payload: AdminPayload) => Promise<void>
}

export function AdminFormDialog({
  onClose,
  onSave,
}: AdminFormDialogProps) {
  const { t, direction, language } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (saving) {
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setFormError(t("admin.forms.admin.validation.required"))
      return
    }

    if (password.length < 4) {
      setFormError(t("admin.forms.admin.validation.passwordLength"))
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await onSave({
        email: normalizedEmail,
        password,
      })

      onClose()
    } catch (caught) {
      setFormError(
        language === "en" && caught instanceof ApiError
          ? caught.message
          : t("admin.forms.admin.validation.saveFailed"),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form
        className="form-dialog admin-form"
        dir={direction}
        lang={language}
        noValidate
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>{t("admin.forms.admin.eyebrow")}</span>
            <h2>{t("admin.forms.admin.newTitle")}</h2>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label={t("admin.forms.common.close")}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="form-grid form-grid--single">
          <label>
            {t("admin.forms.admin.email")}

            <input
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={saving}
            />
          </label>

          <label>
            {t("admin.forms.admin.temporaryPassword")}

            <input
              type="password"
              autoComplete="new-password"
              minLength={4}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={saving}
            />

            <small>{t("admin.forms.admin.passwordHelp")}</small>
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
            {t("admin.forms.common.cancel")}
          </button>

          <button
            className="button"
            disabled={saving}
          >
            {saving ? t("admin.forms.admin.adding") : t("admin.forms.admin.save")}
          </button>
        </div>
      </form>
    </div>
  )
}
