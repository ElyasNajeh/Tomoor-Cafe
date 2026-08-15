import type { Category } from "@/features/admin/categories/categories.types"
import { getAssetUrl } from "@/shared/api/assets"
import { EmptyState, LoadableContent, StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Product } from "../products.types"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

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
  const { language, t } = useI18n()
  const categoryNames = new Map(
    props.categories.map((category) => [category.id, localizedPair(category.name_en, category.name_ar, language).primary]),
  )

  return (
    <LoadableContent
      loading={props.loading}
      loadingMessage={t("admin.management.loadingProducts")}
      error={props.error}
      onRetry={props.onRetry}
    >
      {props.items.length === 0 ? (
        <EmptyState
          title={t("admin.management.noProducts")}
          message={props.categories.length
            ? t("admin.management.noProductsMessage")
            : t("admin.management.categoryRequired")}
          action={props.categories.length
            ? <button className="button" onClick={props.onCreate}>{t("admin.pages.addProduct")}</button>
            : undefined}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head">
            <span>{t("admin.management.product")}</span>
            <span>{t("admin.management.category")}</span>
            <span>{t("admin.management.pricing")}</span>
            <span>{t("admin.management.status")}</span>
            <span>{t("admin.management.actions")}</span>
          </div>
          {props.items.map((product) => {
            const name = localizedPair(product.name_en, product.name_ar, language)
            return (
            <article className="product-table" key={product.id}>
              <div className="product-cell">
                <img src={getAssetUrl(product.image)} alt="" />
                <span>
                  <strong lang={name.primaryLanguage}>{name.primary}</strong>
                  <small lang={name.secondaryLanguage}>{name.secondary}</small>
                </span>
              </div>
              <span>{categoryNames.get(product.category_id) ?? t("admin.management.unknown")}</span>
              <ProductPrice product={product} />
              <StatusBadge active={product.is_active} />
              <div className="row-actions">
                <button className="icon-button" title={t("admin.management.edit")} onClick={() => props.onEdit(product)}>
                  <Icon name="edit" />
                </button>
                <button
                  className="icon-button"
                  title={t(product.is_active ? "admin.management.hide" : "admin.management.activate")}
                  onClick={() => props.onToggle(product)}
                >
                  <Icon name={product.is_active ? "eyeOff" : "eye"} />
                </button>
                <button
                  className="icon-button icon-button--danger"
                  title={t("admin.management.delete")}
                  onClick={() => props.onDelete(product)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </article>
            )
          })}
        </div>
      )}
    </LoadableContent>
  )
}

function ProductPrice({ product }: { product: Product }) {
  const { t } = useI18n()
  if (product.product_type === "FOOD") {
    return <span><small>{t("admin.management.singlePrice")}</small><strong>{formatMoney(product.food?.price ?? null)}</strong></span>
  }

  return (
    <span>
      <small>{t("admin.management.drinkSizes")}</small>
      <strong>
        S {formatMoney(product.drink?.small_price ?? null)} · M {formatMoney(product.drink?.medium_price ?? null)} · L {formatMoney(product.drink?.large_price ?? null)}
      </strong>
    </span>
  )
}
