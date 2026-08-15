import type { Category } from "@/features/admin/categories/categories.types"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

type ProductFiltersProps = {
  categories: Category[]
  search: string
  category: string
  status: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function ProductFilters(props: ProductFiltersProps) {
  const { language, t } = useI18n()
  return (
    <div className="filters">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label={t("admin.management.searchProducts")}
          placeholder={t("admin.management.searchProducts")}
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
      </label>
      <select
        aria-label={t("admin.management.filterCategory")}
        value={props.category}
        onChange={(event) => props.onCategoryChange(event.target.value)}
      >
        <option value="">{t("admin.management.allCategories")}</option>
        {props.categories.map((category) => (
          <option value={category.id} key={category.id}>{localizedPair(category.name_en, category.name_ar, language).primary}</option>
        ))}
      </select>
      <select
        aria-label={t("admin.management.filterStatus")}
        value={props.status}
        onChange={(event) => props.onStatusChange(event.target.value)}
      >
        <option value="">{t("admin.management.allStatuses")}</option>
        <option value="true">{t("admin.common.active")}</option>
        <option value="false">{t("admin.common.hidden")}</option>
      </select>
    </div>
  )
}
