import { Icon } from "@/shared/components/Icon"

type CategoryFiltersProps = {
  value: string
  status: string
  onChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function CategoryFilters(props: CategoryFiltersProps) {
  return (
    <div className="filters filters--categories">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label="Search categories"
          placeholder="Search categories…"
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
        />
      </label>
      <select
        aria-label="Filter by status"
        value={props.status}
        onChange={(event) => props.onStatusChange(event.target.value)}
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Hidden</option>
      </select>
    </div>
  )
}
