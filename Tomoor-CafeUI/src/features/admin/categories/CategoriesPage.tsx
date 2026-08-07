import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import type { Category } from "./categories.types"
import { CategoryFilters } from "./components/CategoryFilters"
import { CategoryFormDialog } from "./components/CategoryFormDialog"
import { CategoryTable } from "./components/CategoryTable"
import { useCategories } from "./hooks/useCategories"
import { useI18n } from "@/localization/useI18n"

type EditingCategory = Category | null | undefined

export function CategoriesPage() {
  const categories = useCategories()
  const { t } = useI18n()
  const [editingCategory, setEditingCategory] = useState<EditingCategory>(() =>
    new URLSearchParams(window.location.search).has("new") ? null : undefined,
  )

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.categoriesEyebrow")}
        icon="categories"
        title={t("admin.categories")}
        description={t("admin.pages.categoriesDescription")}
        actions={<button className="button" onClick={() => setEditingCategory(null)}>+ {t("admin.pages.addCategory")}</button>}
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
