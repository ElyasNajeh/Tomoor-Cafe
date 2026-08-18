import { useState, type FormEvent } from "react"
import { getAdminErrorMessage } from "@/features/admin/adminErrorMessage"
import { ImageUpload } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import { CategoriesApi } from "../categories.api"
import type { Category, CategoryPayload } from "../categories.types"

const EMPTY_FORM: CategoryPayload = {
  name_ar: "",
  name_en: "",
  image: "",
  is_active: true,
}

type CategoryFormDialogProps = {
  category: Category | null
  onClose: () => void
  onSave: (category: Category | null, payload: CategoryPayload) => Promise<void>
}

export function CategoryFormDialog({ category, onClose, onSave }: CategoryFormDialogProps) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState<CategoryPayload>(() => category ? {
    name_ar: category.name_ar,
    name_en: category.name_en,
    image: category.image ?? "",
    is_active: category.is_active,
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (!form.name_ar.trim() || !form.name_en.trim() || !form.image) {
      setFormError(t("admin.forms.category.validation.required"))
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await onSave(category, form)
      onClose()
    } catch (caught) {
      setFormError(getAdminErrorMessage(caught, t, "admin.forms.category.validation.saveFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form
        className="form-dialog form-dialog--wide"
        dir={direction}
        lang={language}
        noValidate
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>{t("admin.forms.category.eyebrow")}</span>
            <h2>{t(category ? "admin.forms.category.editTitle" : "admin.forms.category.newTitle")}</h2>
          </div>
          <button type="button" aria-label={t("admin.forms.common.close")} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <fieldset className="form-section">
          <legend>{t("admin.forms.category.sections.basic")}</legend>
          <div className="form-grid">
            <label>
              {t("admin.forms.fields.englishName")}
              <input
                dir="ltr"
                value={form.name_en}
                maxLength={255}
                onChange={(event) => setForm({ ...form, name_en: event.target.value })}
                disabled={saving}
                required
              />
            </label>
            <label>
              {t("admin.forms.fields.arabicName")}
              <input
                dir="rtl"
                value={form.name_ar}
                maxLength={255}
                onChange={(event) => setForm({ ...form, name_ar: event.target.value })}
                disabled={saving}
                required
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("admin.forms.category.sections.image")}</legend>
          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            upload={CategoriesApi.upload}
            disabled={saving}
          />
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("admin.forms.common.sections.status")}</legend>
          <label className="switch-row">
            <span>
              <strong>{t("admin.forms.category.activeLabel")}</strong>
              <small>{t("admin.forms.category.activeHelp")}</small>
            </span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              disabled={saving}
            />
          </label>
        </fieldset>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={saving}
          >
            {t("admin.forms.common.cancel")}
          </button>
          <button className="button" disabled={saving}>
            {saving ? t("admin.forms.common.saving") : t("admin.forms.category.save")}
          </button>
        </div>
      </form>
    </div>
  )
}
