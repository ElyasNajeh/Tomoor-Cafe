import { getAssetUrl } from "@/shared/api/assets"
import { StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Category } from "../categories.types"

type CategoryTableRowProps = {
  category: Category
  onEdit: (category: Category) => void
  onToggle: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryTableRow(props: CategoryTableRowProps) {
  const { category } = props

  return (
    <article className="product-table category-table">
      <div className="product-cell">
        {category.image ? (
          <img src={getAssetUrl(category.image)} alt="" />
        ) : (
          <span className="category-table__placeholder"><Icon name="categories" /></span>
        )}
        <span>
          <strong>{category.name_en}</strong>
          <small dir="rtl">{category.name_ar}</small>
        </span>
      </div>
      <span>{new Date(category.created_at).toLocaleDateString()}</span>
      <StatusBadge active={category.is_active} />
      <div className="row-actions">
        <button className="icon-button" title="Edit" onClick={() => props.onEdit(category)}>
          <Icon name="edit" />
        </button>
        <button
          className="icon-button"
          title={category.is_active ? "Hide" : "Activate"}
          onClick={() => props.onToggle(category)}
        >
          <Icon name={category.is_active ? "eyeOff" : "eye"} />
        </button>
        <button
          className="icon-button icon-button--danger"
          title="Delete"
          onClick={() => props.onDelete(category)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </article>
  )
}
