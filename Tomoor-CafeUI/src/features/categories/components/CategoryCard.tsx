import { getAssetUrl } from "@/shared/api/assets"
import { Icon } from "@/shared/components/Icon"
import type { Category } from "../categories.types"

type CategoryCardProps = {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <article className="category-card">
      <div className="category-card__image">
        {category.image ? (
          <img src={getAssetUrl(category.image)} alt="" />
        ) : (
          <span><Icon name="categories" size={32} /></span>
        )}
      </div>
      <div>
        <small>{new Date(category.created_at).toLocaleDateString()}</small>
        <h2>{category.name_en}</h2>
        <p dir="rtl">{category.name_ar}</p>
        <div className="row-actions">
          <button
            className="button button--small button--secondary"
            onClick={() => onEdit(category)}
          >
            <Icon name="edit" />Edit
          </button>
          <button
            className="button button--small button--text-danger"
            onClick={() => onDelete(category)}
          >
            <Icon name="trash" />Delete
          </button>
        </div>
      </div>
    </article>
  )
}
