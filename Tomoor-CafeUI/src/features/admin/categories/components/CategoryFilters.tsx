import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"

type CategoryFiltersProps = {
  value: string
  status: string
  onChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function CategoryFilters(props: CategoryFiltersProps) {
  const { t } = useI18n()
  return (
    <div className="filters filters--categories">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label={t("admin.management.searchCategories")}
          placeholder={t("admin.management.searchCategories")}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
        />
      </label>
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
