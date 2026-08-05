import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import type { Category } from "../categories.types"
import { CategoryCard } from "./CategoryCard"

type CategoryGridProps = {
  items: Category[]
  loading: boolean
  error: string
  onCreate: () => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onRetry: () => void
}

export function CategoryGrid(props: CategoryGridProps) {
  return (
    <LoadableContent
      loading={props.loading}
      loadingMessage="Loading categories…"
      error={props.error}
      onRetry={props.onRetry}
    >
      {props.items.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message="Create your first category to start building the company catalog."
          action={<button className="button" onClick={props.onCreate}>Add category</button>}
        />
      ) : (
        <div className="card-grid">
          {props.items.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={props.onEdit}
              onDelete={props.onDelete}
            />
          ))}
        </div>
      )}
    </LoadableContent>
  )
}
