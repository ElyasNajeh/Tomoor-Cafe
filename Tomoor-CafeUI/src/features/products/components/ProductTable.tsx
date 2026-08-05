import type { Category } from "@/features/categories/categories.types"
import { getAssetUrl } from "@/shared/api/assets"
import { EmptyState, LoadableContent, StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Product } from "../products.types"

type ProductTableProps = {
  items: Product[]
  categories: Category[]
  loading: boolean
  error: string
  onCreate: () => void
  onEdit: (product: Product) => void
  onToggle: (product: Product) => void
  onDelete: (product: Product) => void
  onRetry: () => void
}

function formatMoney(value: string | null) {
  return value ? Number(value).toFixed(2) : "—"
}

export function ProductTable(props: ProductTableProps) {
  const categoryNames = new Map(
    props.categories.map((category) => [category.id, category.name_en]),
  )

  return (
    <LoadableContent
      loading={props.loading}
      loadingMessage="Loading products…"
      error={props.error}
      onRetry={props.onRetry}
    >
      {props.items.length === 0 ? (
        <EmptyState
          title="No products yet"
          message={props.categories.length
            ? "Add your first drink or food item to the catalog."
            : "Create a category before adding products."}
          action={props.categories.length
            ? <button className="button" onClick={props.onCreate}>Add product</button>
            : undefined}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head">
            <span>Product</span>
            <span>Category</span>
            <span>Pricing</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {props.items.map((product) => (
            <article className="product-table" key={product.id}>
              <div className="product-cell">
                <img src={getAssetUrl(product.image)} alt="" />
                <span>
                  <strong>{product.name_en}</strong>
                  <small dir="rtl">{product.name_ar}</small>
                </span>
              </div>
              <span>{categoryNames.get(product.category_id) ?? "Unknown"}</span>
              <ProductPrice product={product} />
              <StatusBadge active={product.is_active} />
              <div className="row-actions">
                <button className="icon-button" title="Edit" onClick={() => props.onEdit(product)}>
                  <Icon name="edit" />
                </button>
                <button
                  className="icon-button"
                  title={product.is_active ? "Hide" : "Activate"}
                  onClick={() => props.onToggle(product)}
                >
                  <Icon name={product.is_active ? "eyeOff" : "eye"} />
                </button>
                <button
                  className="icon-button icon-button--danger"
                  title="Delete"
                  onClick={() => props.onDelete(product)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </LoadableContent>
  )
}

function ProductPrice({ product }: { product: Product }) {
  if (!product.is_drink) {
    return <span><small>Single price</small><strong>{formatMoney(product.price)}</strong></span>
  }

  return (
    <span>
      <small>Drink sizes</small>
      <strong>
        S {formatMoney(product.small_price)} · M {formatMoney(product.medium_price)} · L {formatMoney(product.large_price)}
      </strong>
    </span>
  )
}
