import { useState, type FormEvent, type ReactNode } from "react"
import type { Category } from "@/features/categories/categories.types"
import { ApiError } from "@/shared/api/error"
import { ImageUpload } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { ProductsApi } from "../products.api"
import type { Product, ProductFormValues, ProductPayload } from "../products.types"
import { ProductBasicFields, ProductPriceFields, ProductTypeFields } from "./ProductFormFields"

type ProductFormDialogProps = {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSave: (product: Product | null, payload: ProductPayload) => Promise<void>
}

function createInitialForm(product: Product | null, categories: Category[]): ProductFormValues {
  return {
    category_id: product ? String(product.category_id) : String(categories[0]?.id ?? ""),
    name_ar: product?.name_ar ?? "",
    name_en: product?.name_en ?? "",
    description_ar: product?.description_ar ?? "",
    description_en: product?.description_en ?? "",
    image: product?.image ?? "",
    is_drink: product?.is_drink ?? true,
    is_active: product?.is_active ?? true,
    price: product?.price ?? "",
    small_price: product?.small_price ?? "",
    medium_price: product?.medium_price ?? "",
    large_price: product?.large_price ?? "",
  }
}

function toPayload(form: ProductFormValues): ProductPayload {
  const numberOrNull = (value: string) => value === "" ? null : Number(value)

  return {
    category_id: Number(form.category_id),
    name_ar: form.name_ar,
    name_en: form.name_en,
    description_ar: form.description_ar || null,
    description_en: form.description_en || null,
    image: form.image,
    is_drink: form.is_drink,
    is_active: form.is_active,
    price: form.is_drink ? null : numberOrNull(form.price),
    small_price: form.is_drink ? numberOrNull(form.small_price) : null,
    medium_price: form.is_drink ? numberOrNull(form.medium_price) : null,
    large_price: form.is_drink ? numberOrNull(form.large_price) : null,
  }
}

function validateForm(form: ProductFormValues) {
  if (!form.category_id || !form.name_ar.trim() || !form.name_en.trim() || !form.image) {
    return "Category, both product names, and an image are required."
  }

  const hasDrinkPrice = [form.small_price, form.medium_price, form.large_price]
    .some((value) => Number(value) > 0)

  if (form.is_drink && !hasDrinkPrice) {
    return "Add at least one size price greater than zero."
  }

  if (!form.is_drink && !(Number(form.price) > 0)) {
    return "Add a price greater than zero."
  }

  return ""
}

export function ProductFormDialog(props: ProductFormDialogProps) {
  const [form, setForm] = useState(() => createInitialForm(props.product, props.categories))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    const validationError = validateForm(form)

    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await props.onSave(props.product, toPayload(form))
      props.onClose()
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : "Unable to save product")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form className="form-dialog form-dialog--wide" onSubmit={(event) => void handleSave(event)}>
        <div className="form-dialog__header">
          <div><span>Menu item</span><h2>{props.product ? "Edit product" : "New product"}</h2></div>
          <button type="button" aria-label="Close" onClick={props.onClose}><Icon name="close" /></button>
        </div>

        <FormSection title="1. Basic Information">
          <ProductBasicFields form={form} categories={props.categories} onChange={setForm} />
        </FormSection>
        <FormSection title="2. Product Image">
          <ImageUpload value={form.image} onChange={(image) => setForm({ ...form, image })} upload={ProductsApi.upload} disabled={saving} />
        </FormSection>
        <FormSection title="3. Product Type">
          <ProductTypeFields form={form} onChange={setForm} />
        </FormSection>
        <FormSection title="4. Pricing">
          <ProductPriceFields form={form} onChange={setForm} />
        </FormSection>
        <FormSection title="5. Status">
          <label className="switch-row">
            <span><strong>Active on menu</strong><small>Customers can see and order this product.</small></span>
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          </label>
        </FormSection>

        {formError && <p className="form-error">{formError}</p>}
        <div className="form-actions">
          <button type="button" className="button button--ghost" disabled={saving} onClick={props.onClose}>Cancel</button>
          <button className="button" disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset className="form-section"><legend>{title}</legend>{children}</fieldset>
}
