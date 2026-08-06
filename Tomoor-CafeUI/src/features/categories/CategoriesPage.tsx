import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import type { Category } from "./categories.types"
import { CategoryFilters } from "./components/CategoryFilters"
import { CategoryFormDialog } from "./components/CategoryFormDialog"
import { CategoryTable } from "./components/CategoryTable"
import { useCategories } from "./hooks/useCategories"

type EditingCategory = Category | null | undefined

export function CategoriesPage() {
  const categories = useCategories()
  const [editingCategory, setEditingCategory] = useState<EditingCategory>(() =>
    new URLSearchParams(window.location.search).has("new") ? null : undefined,
  )

  return (
    <section>
      <PageHeader
        eyebrow="Menu organization"
        icon="categories"
        title="Categories"
        description="Organize your menu into clear, visual collections."
        actions={<button className="button" onClick={() => setEditingCategory(null)}>+ Add category</button>}
      />

      <CategoryFilters
        value={categories.search}
        status={categories.statusFilter}
        onChange={categories.setSearch}
        onStatusChange={categories.setStatusFilter}
      />

      <CategoryTable
        items={categories.items}
        loading={categories.loading}
        error={categories.error}
        onCreate={() => setEditingCategory(null)}
        onEdit={setEditingCategory}
        onToggle={(category) => void categories.toggleCategory(category)}
        onDelete={(category) => void categories.deleteCategory(category)}
        onRetry={() => void categories.reload()}
      />

      {editingCategory !== undefined && (
        <CategoryFormDialog
          key={editingCategory?.id ?? "new"}
          category={editingCategory}
          onClose={() => setEditingCategory(undefined)}
          onSave={categories.saveCategory}
        />
      )}

      {!categories.loading && !categories.error && (
        <Pagination
          page={categories.page}
          totalPages={categories.totalPages}
          totalItems={categories.totalItems}
          onChange={categories.setPage}
        />
      )}
    </section>
  )
}
