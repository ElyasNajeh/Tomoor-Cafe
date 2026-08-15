import type { Category } from "@/features/admin/categories/categories.types"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import type { ProductFormValues } from "../products.types"

type ProductFormFieldsProps = {
  form: ProductFormValues
  categories: Category[]
  onChange: (form: ProductFormValues) => void
}

export function ProductBasicFields({ form, categories, onChange }: ProductFormFieldsProps) {
  const { t, language } = useI18n()

  return (
    <div className="form-grid">
      <label>{t("admin.forms.fields.englishName")}<input dir="ltr" value={form.name_en} onChange={(event) => onChange({ ...form, name_en: event.target.value })} required /></label>
      <label>{t("admin.forms.fields.arabicName")}<input dir="rtl" value={form.name_ar} onChange={(event) => onChange({ ...form, name_ar: event.target.value })} required /></label>
      <label>
        {t("admin.forms.fields.category")}
        <select value={form.category_id} onChange={(event) => onChange({ ...form, category_id: event.target.value })} required>
          <option value="">{t("admin.forms.product.chooseCategory")}</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {language === "ar" ? category.name_ar : category.name_en}
            </option>
          ))}
        </select>
      </label>
      <span />
      <label>{t("admin.forms.fields.englishDescription")}<textarea dir="ltr" value={form.description_en} onChange={(event) => onChange({ ...form, description_en: event.target.value })} /></label>
      <label>{t("admin.forms.fields.arabicDescription")}<textarea dir="rtl" value={form.description_ar} onChange={(event) => onChange({ ...form, description_ar: event.target.value })} /></label>
    </div>
  )
}

export function ProductTypeFields({ form, onChange }: Omit<ProductFormFieldsProps, "categories">) {
  const { t } = useI18n()

  return (
    <div className="choice-cards">
      <label className={form.product_type === "DRINK" ? "selected" : ""}>
        <input type="radio" checked={form.product_type === "DRINK"} onChange={() => onChange({ ...form, product_type: "DRINK", price: "" })} />
        <Icon name="drink" />
        <span><strong>{t("admin.forms.product.drink")}</strong><small>{t("admin.forms.product.drinkHelp")}</small></span>
      </label>
      <label className={form.product_type === "FOOD" ? "selected" : ""}>
        <input type="radio" checked={form.product_type === "FOOD"} onChange={() => onChange({ ...form, product_type: "FOOD", small_price: "", medium_price: "", large_price: "" })} />
        <Icon name="food" />
        <span><strong>{t("admin.forms.product.food")}</strong><small>{t("admin.forms.product.foodHelp")}</small></span>
      </label>
    </div>
  )
}

export function ProductPriceFields({ form, onChange }: Omit<ProductFormFieldsProps, "categories">) {
  const { t } = useI18n()

  if (form.product_type === "FOOD") {
    return (
      <label className="price-field">
        {t("admin.forms.fields.price")}
        <input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => onChange({ ...form, price: event.target.value })} placeholder="0.00" required />
      </label>
    )
  }

  return (
    <div className="form-grid form-grid--three">
      <PriceInput label={t("admin.forms.product.smallPrice")} value={form.small_price} onChange={(small_price) => onChange({ ...form, small_price })} />
      <PriceInput label={t("admin.forms.product.mediumPrice")} value={form.medium_price} onChange={(medium_price) => onChange({ ...form, medium_price })} />
      <PriceInput label={t("admin.forms.product.largePrice")} value={form.large_price} onChange={(large_price) => onChange({ ...form, large_price })} />
    </div>
  )
}

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label>{label}<input type="number" min="0.01" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" /></label>
}
