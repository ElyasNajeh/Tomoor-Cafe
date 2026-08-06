import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import type { Category } from "../categories.types"
import { CategoryTableRow } from "./CategoryTableRow"

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
  return (
    <LoadableContent loading={props.loading} loadingMessage="Loading categories…" error={props.error} onRetry={props.onRetry}>
      {props.items.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message="Create your first category to start building the company catalog."
          action={<button className="button" onClick={props.onCreate}>Add category</button>}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head category-table">
            <span>Category</span><span>Created</span><span>Status</span><span>Actions</span>
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
