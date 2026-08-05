import type { Category } from "@/features/categories/categories.types"
import { Icon } from "@/shared/components/Icon"

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
  return (
    <div className="filters">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label="Search products"
          placeholder="Search products…"
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
      </label>
      <select
        aria-label="Filter by category"
        value={props.category}
        onChange={(event) => props.onCategoryChange(event.target.value)}
      >
        <option value="">All categories</option>
        {props.categories.map((category) => (
          <option value={category.id} key={category.id}>{category.name_en}</option>
        ))}
      </select>
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
