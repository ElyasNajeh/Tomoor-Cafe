import type { Category } from "@/features/categories/categories.types"
import { Icon } from "@/shared/components/Icon"
import type { ProductFormValues } from "../products.types"

type ProductFormFieldsProps = {
  form: ProductFormValues
  categories: Category[]
  onChange: (form: ProductFormValues) => void
}

export function ProductBasicFields({ form, categories, onChange }: ProductFormFieldsProps) {
  return (
    <div className="form-grid">
      <label>English name<input value={form.name_en} onChange={(event) => onChange({ ...form, name_en: event.target.value })} required /></label>
      <label>Arabic name<input dir="rtl" value={form.name_ar} onChange={(event) => onChange({ ...form, name_ar: event.target.value })} required /></label>
      <label>
        Category
        <select value={form.category_id} onChange={(event) => onChange({ ...form, category_id: event.target.value })} required>
          <option value="">Choose category</option>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name_en}</option>)}
        </select>
      </label>
      <span />
      <label>English description<textarea value={form.description_en} onChange={(event) => onChange({ ...form, description_en: event.target.value })} /></label>
      <label>Arabic description<textarea dir="rtl" value={form.description_ar} onChange={(event) => onChange({ ...form, description_ar: event.target.value })} /></label>
    </div>
  )
}

export function ProductTypeFields({ form, onChange }: Omit<ProductFormFieldsProps, "categories">) {
  return (
    <div className="choice-cards">
      <label className={form.is_drink ? "selected" : ""}>
        <input type="radio" checked={form.is_drink} onChange={() => onChange({ ...form, is_drink: true, price: "" })} />
        <Icon name="drink" />
        <span><strong>Drink</strong><small>Small, medium and large pricing</small></span>
      </label>
      <label className={!form.is_drink ? "selected" : ""}>
        <input type="radio" checked={!form.is_drink} onChange={() => onChange({ ...form, is_drink: false, small_price: "", medium_price: "", large_price: "" })} />
        <Icon name="food" />
        <span><strong>Food / Other</strong><small>One standard price</small></span>
      </label>
    </div>
  )
}

export function ProductPriceFields({ form, onChange }: Omit<ProductFormFieldsProps, "categories">) {
  if (!form.is_drink) {
    return (
      <label className="price-field">
        Price
        <input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => onChange({ ...form, price: event.target.value })} placeholder="0.00" required />
      </label>
    )
  }

  return (
    <div className="form-grid form-grid--three">
      <PriceInput label="Small price" value={form.small_price} onChange={(small_price) => onChange({ ...form, small_price })} />
      <PriceInput label="Medium price" value={form.medium_price} onChange={(medium_price) => onChange({ ...form, medium_price })} />
      <PriceInput label="Large price" value={form.large_price} onChange={(large_price) => onChange({ ...form, large_price })} />
    </div>
  )
}

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label>{label}<input type="number" min="0.01" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0.00" /></label>
}
