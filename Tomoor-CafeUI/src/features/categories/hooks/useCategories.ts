import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { CategoriesApi } from "../categories.api"
import type { Category, CategoryPayload } from "../categories.types"

const PAGE_SIZE = 8

export function useCategories() {
  const { toast, confirm } = useFeedback()
  const queryClient = useQueryClient()
  const [search, setSearchValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const categoryParams = {
    page,
    limit: PAGE_SIZE,
    search,
    is_active: statusFilter ? statusFilter === "true" : undefined,
  }

  const categoriesQuery = useQuery({
    queryKey: [...queryKeys.categories, categoryParams],
    queryFn: () => CategoriesApi.list(categoryParams),
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      category,
      payload,
    }: {
      category: Category | null
      payload: CategoryPayload
    }) => category
      ? CategoriesApi.update(category.id, payload)
      : CategoriesApi.create(payload),
    onSuccess: async (_, { category, payload }) => {
      toast.success(
        category ? "Category updated" : "Category created",
        `${payload.name_en} is ready to use.`,
      )

      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
      ]

      if (category) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        )
      } else {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
        )
      }

      await Promise.all(invalidations)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (category: Category) => CategoriesApi.delete(category.id),
    onSuccess: async (_, category) => {
      toast.success("Category deleted", `${category.name_en} was removed.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
      ])
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (category: Category) => CategoriesApi.toggle(category.id),
    onSuccess: async (_, category) => {
      toast.success(
        category.is_active ? "Category hidden" : "Category activated",
        category.is_active
          ? `${category.name_en} and all of its products are now hidden from the menu.`
          : `${category.name_en} is now visible. Its products remain hidden until you activate them.`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      ])
    },
  })

  function setSearch(value: string) {
    setSearchValue(value)
    setPage(1)
  }

  function setStatusFilter(value: string) {
    setStatusFilterValue(value)
    setPage(1)
  }

  async function saveCategory(category: Category | null, payload: CategoryPayload) {
    await saveMutation.mutateAsync({ category, payload })
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
      await deleteMutation.mutateAsync(category)
    } catch (caught) {
      toast.error(
        "Could not delete category",
        caught instanceof Error ? caught.message : undefined,
      )
    }
  }

  async function toggleCategory(category: Category) {
    try {
      await toggleMutation.mutateAsync(category)
    } catch (caught) {
      toast.error(
        "Status update failed",
        caught instanceof Error ? caught.message : undefined,
      )
    }
  }

  const error = categoriesQuery.error instanceof Error
    ? categoriesQuery.error.message
    : categoriesQuery.error
      ? "Unable to load categories"
      : ""

  return {
    items: categoriesQuery.data?.items ?? [],
    loading: categoriesQuery.isPending,
    error,
    search,
    statusFilter,
    page,
    totalPages: categoriesQuery.data?.total_pages ?? 1,
    totalItems: categoriesQuery.data?.total_items ?? 0,
    setSearch,
    setStatusFilter,
    setPage,
    reload: categoriesQuery.refetch,
    saveCategory,
    deleteCategory,
    toggleCategory,
  }
}
