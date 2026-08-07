import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import type { Category } from "../categories.types"
import { CategoryTableRow } from "./CategoryTableRow"
import { useI18n } from "@/localization/useI18n"

type CategoryTableProps = {
  items: Category[]
  loading: boolean
  error: string
  onCreate: () => void
  onEdit: (category: Category) => void
  onToggle: (category: Category) => void
  onDelete: (category: Category) => void
  onRetry: () => void
}

export function CategoryTable(props: CategoryTableProps) {
  const { t } = useI18n()
  return (
    <LoadableContent loading={props.loading} loadingMessage={t("admin.management.loadingCategories")} error={props.error} onRetry={props.onRetry}>
      {props.items.length === 0 ? (
        <EmptyState
          title={t("admin.management.noCategories")}
          message={t("admin.management.noCategoriesMessage")}
          action={<button className="button" onClick={props.onCreate}>{t("admin.pages.addCategory")}</button>}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head category-table">
            <span>{t("admin.management.category")}</span><span>{t("admin.management.created")}</span><span>{t("admin.management.status")}</span><span>{t("admin.management.actions")}</span>
          </div>
          {props.items.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              onEdit={props.onEdit}
              onToggle={props.onToggle}
              onDelete={props.onDelete}
            />
          ))}
        </div>
      )}
    </LoadableContent>
  )
}
