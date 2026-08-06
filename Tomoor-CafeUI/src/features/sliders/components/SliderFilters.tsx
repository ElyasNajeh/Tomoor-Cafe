import { Icon } from "@/shared/components/Icon"

type SliderFiltersProps = {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function SliderFilters(props: SliderFiltersProps) {
  return (
    <div className="filters filters--sliders">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label="Search sliders"
          placeholder="Search sliders…"
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
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
