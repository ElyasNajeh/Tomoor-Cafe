import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CategoriesApi } from "@/features/categories/categories.api"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { ProductsApi } from "../products.api"
import type { Product, ProductPayload } from "../products.types"

const PAGE_SIZE = 10
const CATEGORY_LIMIT = 100

export function useProducts() {
  const { toast, confirm } = useFeedback()
  const queryClient = useQueryClient()
  const [search, setSearchValue] = useState("")
  const [categoryFilter, setCategoryFilterValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const productParams = {
    page,
    limit: PAGE_SIZE,
    search,
    category_id: categoryFilter ? Number(categoryFilter) : undefined,
    is_active: statusFilter ? statusFilter === "true" : undefined,
  }

  const productsQuery = useQuery({
    queryKey: [...queryKeys.products, productParams],
    queryFn: () => ProductsApi.list(productParams),
  })

  const categoriesQuery = useQuery({
    queryKey: [...queryKeys.categories, { limit: CATEGORY_LIMIT }],
    queryFn: () => CategoriesApi.list({ limit: CATEGORY_LIMIT }),
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      product,
      payload,
    }: {
      product: Product | null
      payload: ProductPayload
    }) => product
      ? ProductsApi.update(product.id, payload)
      : ProductsApi.create(payload),
    onSuccess: async (_, { product, payload }) => {
      toast.success(
        product ? "Product updated" : "Product created",
        `${payload.name_en} was saved successfully.`,
      )

      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      ]

      if (!product) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
        )
      }

      await Promise.all(invalidations)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (product: Product) => ProductsApi.delete(product.id),
    onSuccess: async (_, product) => {
      toast.success("Product deleted", `${product.name_en} was removed.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
      ])
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (product: Product) => ProductsApi.toggle(product.id),
    onSuccess: async (_, product) => {
      toast.success(
        product.is_active ? "Product hidden" : "Product activated",
        `${product.name_en} is now ${product.is_active ? "hidden from" : "visible on"} the menu.`,
      )
      await queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function reload() {
    await Promise.all([
      productsQuery.refetch(),
      categoriesQuery.refetch(),
    ])
  }

  async function saveProduct(product: Product | null, payload: ProductPayload) {
    await saveMutation.mutateAsync({ product, payload })
  }

  async function deleteProduct(product: Product) {
    const confirmed = await confirm({
      title: "Delete product?",
      message: `Permanently delete ${product.name_en}? This cannot be undone.`,
      confirmLabel: "Delete product",
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(product)
    } catch (caught) {
      toast.error("Could not delete product", caught instanceof Error ? caught.message : undefined)
    }
  }

  async function toggleProduct(product: Product) {
    try {
      await toggleMutation.mutateAsync(product)
    } catch (caught) {
      toast.error("Status update failed", caught instanceof Error ? caught.message : undefined)
    }
  }

  const errorValue = productsQuery.error ?? categoriesQuery.error
  const error = errorValue instanceof Error
    ? errorValue.message
    : errorValue
      ? "Unable to load products"
      : ""

  return {
    items: productsQuery.data?.items ?? [],
    categories: categoriesQuery.data?.items ?? [],
    loading: productsQuery.isPending || categoriesQuery.isPending,
    error,
    search,
    categoryFilter,
    statusFilter,
    page,
    totalPages: productsQuery.data?.total_pages ?? 1,
    totalItems: productsQuery.data?.total_items ?? 0,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setCategoryFilter: (value: string) => updateFilter(setCategoryFilterValue, value),
    setStatusFilter: (value: string) => updateFilter(setStatusFilterValue, value),
    setPage,
    reload,
    saveProduct,
    deleteProduct,
    toggleProduct,
  }
}
