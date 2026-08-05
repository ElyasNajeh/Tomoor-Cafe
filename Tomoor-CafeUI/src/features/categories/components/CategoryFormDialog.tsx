import { useState, type FormEvent } from "react"
import { ApiError } from "@/shared/api/error"
import { ImageUpload } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { CategoriesApi } from "../categories.api"
import type { Category, CategoryPayload } from "../categories.types"

const EMPTY_FORM: CategoryPayload = {
  name_ar: "",
  name_en: "",
  image: "",
}

type CategoryFormDialogProps = {
  category: Category | null
  onClose: () => void
  onSave: (category: Category | null, payload: CategoryPayload) => Promise<void>
}

export function CategoryFormDialog({ category, onClose, onSave }: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryPayload>(() => category ? {
    name_ar: category.name_ar,
    name_en: category.name_en,
    image: category.image ?? "",
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (!form.name_ar.trim() || !form.name_en.trim() || !form.image) {
      setFormError("Arabic name, English name, and an image are required.")
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await onSave(category, form)
      onClose()
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "Unable to save category")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form className="form-dialog" onSubmit={(event) => void handleSave(event)}>
        <div className="form-dialog__header">
          <div>
            <span>Category details</span>
            <h2>{category ? "Edit category" : "New category"}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="form-grid">
          <label>
            English name
            <input
              value={form.name_en}
              maxLength={255}
              onChange={(event) => setForm({ ...form, name_en: event.target.value })}
              disabled={saving}
              required
            />
          </label>
          <label>
            Arabic name
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

        <label className="field-label">
          Category image
          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            upload={CategoriesApi.upload}
            disabled={saving}
          />
        </label>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="button" disabled={saving}>
            {saving ? "Saving…" : "Save category"}
          </button>
        </div>
      </form>
    </div>
  )
}
