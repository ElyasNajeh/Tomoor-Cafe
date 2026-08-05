import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import type { Category } from "./categories.types"
import { CategoryFormDialog } from "./components/CategoryFormDialog"
import { CategoryGrid } from "./components/CategoryGrid"
import { CategorySearch } from "./components/CategorySearch"
import { useCategories } from "./hooks/useCategories"

type EditingCategory = Category | null | undefined

function getInitialEditingCategory(): EditingCategory {
  return new URLSearchParams(window.location.search).has("new") ? null : undefined
}

export function CategoriesPage() {
  const categories = useCategories()
  const [editingCategory, setEditingCategory] = useState<EditingCategory>(
    getInitialEditingCategory,
  )

  function openCreateDialog() {
    setEditingCategory(null)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
  }

  function closeDialog() {
    setEditingCategory(undefined)
  }

  return (
    <section>
      <PageHeader
        eyebrow="Menu organization"
        icon="categories"
        title="Categories"
        description="Organize your menu into clear, visual collections."
        actions={<button className="button" onClick={openCreateDialog}>+ Add category</button>}
      />

      <CategorySearch
        value={categories.search}
        onChange={categories.setSearch}
      />

      <CategoryGrid
        items={categories.items}
        loading={categories.loading}
        error={categories.error}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onDelete={(category) => void categories.deleteCategory(category)}
        onRetry={() => void categories.reload()}
      />

      {editingCategory !== undefined && (
        <CategoryFormDialog
          key={editingCategory?.id ?? "new"}
          category={editingCategory}
          onClose={closeDialog}
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
