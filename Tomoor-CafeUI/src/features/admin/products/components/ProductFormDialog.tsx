import { useState, type FormEvent, type ReactNode } from "react"
import type { Category } from "@/features/admin/categories/categories.types"
import { getAdminErrorMessage } from "@/features/admin/adminErrorMessage"
import { ImageUpload } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
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
    product_type: product?.product_type ?? "DRINK",
    is_active: product?.is_active ?? true,
    price: product?.food?.price ?? "",
    small_price: product?.drink?.small_price ?? "",
    medium_price: product?.drink?.medium_price ?? "",
    large_price: product?.drink?.large_price ?? "",
  }
}

function toPayload(form: ProductFormValues): ProductPayload {
  const isDrink = form.product_type === "DRINK"
  const numberOrNull = (value: string) => value === "" ? null : Number(value)
  return {
    category_id: Number(form.category_id),
    name_ar: form.name_ar,
    name_en: form.name_en,
    description_ar: form.description_ar || null,
    description_en: form.description_en || null,
    image: form.image,
    is_active: form.is_active,
    product_type: form.product_type,
    food: isDrink ? null : { price: Number(form.price) },
    drink: isDrink ? {
      small_price: numberOrNull(form.small_price),
      medium_price: numberOrNull(form.medium_price),
      large_price: numberOrNull(form.large_price),
    } : null,
  }
}

function validateForm(form: ProductFormValues, t: (key: string) => string) {
  if (!form.category_id || !form.name_ar.trim() || !form.name_en.trim() || !form.image) {
    return t("admin.forms.product.validation.required")
  }

  const hasDrinkPrice = [form.small_price, form.medium_price, form.large_price]
    .some((value) => Number(value) > 0)

  if (form.product_type === "DRINK" && !hasDrinkPrice) {
    return t("admin.forms.product.validation.drinkPrice")
  }

  if (form.product_type === "FOOD" && !(Number(form.price) > 0)) {
    return t("admin.forms.product.validation.singlePrice")
  }

  return ""
}

export function ProductFormDialog(props: ProductFormDialogProps) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState(() => createInitialForm(props.product, props.categories))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    const validationError = validateForm(form, t)

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
      setFormError(getAdminErrorMessage(caught, t, "admin.forms.product.validation.saveFailed"))
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
          <div><span>{t("admin.forms.product.eyebrow")}</span><h2>{t(props.product ? "admin.forms.product.editTitle" : "admin.forms.product.newTitle")}</h2></div>
          <button type="button" aria-label={t("admin.forms.common.close")} onClick={props.onClose}><Icon name="close" /></button>
        </div>

        <FormSection title={t("admin.forms.product.sections.basic")}>
          <ProductBasicFields form={form} categories={props.categories} onChange={setForm} />
        </FormSection>
        <FormSection title={t("admin.forms.product.sections.image")}>
          <ImageUpload value={form.image} onChange={(image) => setForm({ ...form, image })} upload={ProductsApi.upload} disabled={saving} />
        </FormSection>
        <FormSection title={t("admin.forms.product.sections.type")}>
          <ProductTypeFields form={form} onChange={setForm} />
        </FormSection>
        <FormSection title={t("admin.forms.product.sections.pricing")}>
          <ProductPriceFields form={form} onChange={setForm} />
        </FormSection>
        <FormSection title={t("admin.forms.product.sections.status")}>
          <label className="switch-row">
            <span><strong>{t("admin.forms.product.activeLabel")}</strong><small>{t("admin.forms.product.activeHelp")}</small></span>
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          </label>
        </FormSection>

        {formError && <p className="form-error">{formError}</p>}
        <div className="form-actions">
          <button type="button" className="button button--ghost" disabled={saving} onClick={props.onClose}>{t("admin.forms.common.cancel")}</button>
          <button className="button" disabled={saving}>{saving ? t("admin.forms.common.saving") : t("admin.forms.product.save")}</button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <fieldset className="form-section"><legend>{title}</legend>{children}</fieldset>
}
