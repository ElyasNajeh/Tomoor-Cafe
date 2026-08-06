import { useCallback, useEffect, useState } from "react"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { CategoriesApi } from "../categories.api"
import type { Category, CategoryPayload } from "../categories.types"

const PAGE_SIZE = 8

export function useCategories() {
  const { toast, confirm } = useFeedback()
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearchValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const result = await CategoriesApi.list({
        page,
        limit: PAGE_SIZE,
        search,
        is_active: statusFilter ? statusFilter === "true" : undefined,
      })
      setItems(result.items)
      setTotalPages(result.total_pages)
      setTotalItems(result.total_items)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load categories")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    // Synchronize the current query with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories()
  }, [loadCategories])

  function setSearch(value: string) {
    setSearchValue(value)
    setPage(1)
  }

  function setStatusFilter(value: string) {
    setStatusFilterValue(value)
    setPage(1)
  }

  async function saveCategory(category: Category | null, payload: CategoryPayload) {
    if (category) {
      await CategoriesApi.update(category.id, payload)
    } else {
      await CategoriesApi.create(payload)
    }

    toast.success(
      category ? "Category updated" : "Category created",
      `${payload.name_en} is ready to use.`,
    )
    await loadCategories()
  }

  async function deleteCategory(category: Category) {
    const confirmed = await confirm({
      title: "Delete category?",
      message: `Delete ${category.name_en}? Categories used by products cannot be deleted.`,
      confirmLabel: "Delete category",
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await CategoriesApi.delete(category.id)
      toast.success("Category deleted", `${category.name_en} was removed.`)
      await loadCategories()
    } catch (caught) {
      toast.error(
        "Could not delete category",
        caught instanceof Error ? caught.message : undefined,
      )
    }
  }

  async function toggleCategory(category: Category) {
    try {
      await CategoriesApi.toggle(category.id)
      toast.success(
        category.is_active ? "Category hidden" : "Category activated",
        category.is_active
          ? `${category.name_en} and all of its products are now hidden from the menu.`
          : `${category.name_en} is now visible. Its products remain hidden until you activate them.`,
      )
      await loadCategories()
    } catch (caught) {
      toast.error(
        "Status update failed",
        caught instanceof Error ? caught.message : undefined,
      )
    }
  }

  return {
    items,
    loading,
    error,
    search,
    statusFilter,
    page,
    totalPages,
    totalItems,
    setSearch,
    setStatusFilter,
    setPage,
    reload: loadCategories,
    saveCategory,
    deleteCategory,
    toggleCategory,
  }
}
