import { useState, type FormEvent } from "react"
import { ApiError } from "@/shared/api/error"
import { ImageUpload } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderFormValues, SliderPayload } from "../sliders.types"

type SliderFormDialogProps = {
  slider: Slider | null
  onClose: () => void
  onSave: (slider: Slider | null, payload: SliderPayload, isActive: boolean) => Promise<void>
}

function createInitialForm(slider: Slider | null): SliderFormValues {
  return {
    title_ar: slider?.title_ar ?? "",
    title_en: slider?.title_en ?? "",
    display_order: slider ? String(slider.display_order) : "",
    is_active: slider?.is_active ?? true,
    image: slider?.image ?? "",
  }
}

export function SliderFormDialog(props: SliderFormDialogProps) {
  const [form, setForm] = useState(() => createInitialForm(props.slider))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (!form.title_ar.trim() || !form.title_en.trim() || !form.image) {
      setFormError("Arabic title, English title, and an image are required.")
      return
    }

    const displayOrder = Number(form.display_order)
    if (!Number.isInteger(displayOrder) || displayOrder < 0 || form.display_order === "") {
      setFormError("Display order must be a whole number of zero or greater.")
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await props.onSave(props.slider, {
        title_ar: form.title_ar,
        title_en: form.title_en,
        display_order: displayOrder,
        image: form.image,
      }, form.is_active)
      props.onClose()
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "Unable to save slider")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form className="form-dialog form-dialog--wide" onSubmit={(event) => void handleSave(event)}>
        <div className="form-dialog__header">
          <div><span>Home page slide</span><h2>{props.slider ? "Edit slider" : "New slider"}</h2></div>
          <button type="button" aria-label="Close" onClick={props.onClose}><Icon name="close" /></button>
        </div>

        <fieldset className="form-section">
          <legend>1. Slide Information</legend>
          <div className="form-grid">
            <label>
              English title
              <input
                value={form.title_en}
                maxLength={255}
                onChange={(event) => setForm({ ...form, title_en: event.target.value })}
                disabled={saving}
                required
              />
            </label>
            <label>
              Arabic title
              <input
                dir="rtl"
                value={form.title_ar}
                maxLength={255}
                onChange={(event) => setForm({ ...form, title_ar: event.target.value })}
                disabled={saving}
                required
              />
            </label>
          </div>
          <label className="field-label slider-order-field">
            Display order
            <input
              type="number"
              min="0"
              step="1"
              value={form.display_order}
              onChange={(event) => setForm({ ...form, display_order: event.target.value })}
              disabled={saving}
              required
            />
            <small>Each slider must use a unique order number.</small>
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Slider Image</legend>
          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            upload={SlidersApi.upload}
            disabled={saving}
          />
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Status</legend>
          <label className="switch-row">
            <span><strong>Active on home page</strong><small>Visitors can see this slider.</small></span>
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
          <button type="button" className="button button--ghost" disabled={saving} onClick={props.onClose}>Cancel</button>
          <button className="button" disabled={saving}>{saving ? "Saving…" : "Save slider"}</button>
        </div>
      </form>
    </div>
  )
}
