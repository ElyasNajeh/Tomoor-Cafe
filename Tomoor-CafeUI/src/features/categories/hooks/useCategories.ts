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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const result = await CategoriesApi.list({ page, limit: PAGE_SIZE, search })
      setItems(result.items)
      setTotalPages(result.total_pages)
      setTotalItems(result.total_items)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load categories")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    // Synchronize the current query with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories()
  }, [loadCategories])

  function setSearch(value: string) {
    setSearchValue(value)
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

  return {
    items,
    loading,
    error,
    search,
    page,
    totalPages,
    totalItems,
    setSearch,
    setPage,
    reload: loadCategories,
    saveCategory,
    deleteCategory,
  }
}
