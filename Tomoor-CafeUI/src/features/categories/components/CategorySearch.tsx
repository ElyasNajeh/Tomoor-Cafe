import { Icon } from "@/shared/components/Icon"

type CategorySearchProps = {
  value: string
  onChange: (value: string) => void
}

export function CategorySearch({ value, onChange }: CategorySearchProps) {
  return (
    <div className="filters filters--categories">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label="Search categories"
          placeholder="Search categories…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  )
}
