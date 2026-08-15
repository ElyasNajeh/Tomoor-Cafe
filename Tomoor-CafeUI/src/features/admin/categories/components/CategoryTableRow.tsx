import { getAssetUrl } from "@/shared/api/assets"
import { StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Category } from "../categories.types"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

type CategoryTableRowProps = {
  category: Category
  onEdit: (category: Category) => void
  onToggle: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryTableRow(props: CategoryTableRowProps) {
  const { category } = props
  const { language, t } = useI18n()
  const name = localizedPair(category.name_en, category.name_ar, language)

  return (
    <article className="product-table category-table">
      <div className="product-cell">
        {category.image ? (
          <img src={getAssetUrl(category.image)} alt="" />
        ) : (
          <span className="category-table__placeholder"><Icon name="categories" /></span>
        )}
        <span>
          <strong lang={name.primaryLanguage}>{name.primary}</strong>
          <small lang={name.secondaryLanguage}>{name.secondary}</small>
        </span>
      </div>
      <span>{new Date(category.created_at).toLocaleDateString(language === "ar" ? "ar-PS" : "en-PS")}</span>
      <StatusBadge active={category.is_active} />
      <div className="row-actions">
        <button className="icon-button" title={t("admin.management.edit")} onClick={() => props.onEdit(category)}>
          <Icon name="edit" />
        </button>
        <button
          className="icon-button"
          title={t(category.is_active ? "admin.management.hide" : "admin.management.activate")}
          onClick={() => props.onToggle(category)}
        >
          <Icon name={category.is_active ? "eyeOff" : "eye"} />
        </button>
        <button
          className="icon-button icon-button--danger"
          title={t("admin.management.delete")}
          onClick={() => props.onDelete(category)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </article>
  )
}
