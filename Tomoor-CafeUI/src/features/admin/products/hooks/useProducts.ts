import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CategoriesApi } from "@/features/admin/categories/categories.api"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { ProductsApi } from "../products.api"
import { useI18n } from "@/localization/useI18n"
import type { Product, ProductPayload } from "../products.types"

const PAGE_SIZE = 10
const LIST_LIMIT = 100

export function useProducts() {
  const { toast, confirm } = useFeedback()
  const { t, language } = useI18n()
  const queryClient = useQueryClient()
  const [search, setSearchValue] = useState("")
  const [categoryFilter, setCategoryFilterValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => ProductsApi.list({ limit: LIST_LIMIT }),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => CategoriesApi.list({ limit: LIST_LIMIT }),
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
        t(product ? "admin.feedback.product.updated" : "admin.feedback.product.created"),
        t("admin.feedback.product.savedMessage", { name: language === "ar" ? payload.name_ar : payload.name_en }),
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
      toast.success(t("admin.feedback.product.deleted"), t("admin.feedback.product.deletedMessage", { name: language === "ar" ? product.name_ar : product.name_en }))
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
        t(product.is_active ? "admin.feedback.product.hidden" : "admin.feedback.product.activated"),
        t(product.is_active ? "admin.feedback.product.hiddenMessage" : "admin.feedback.product.activatedMessage", { name: language === "ar" ? product.name_ar : product.name_en }),
      )
      await queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    const selectedCategoryId = categoryFilter ? Number(categoryFilter) : undefined
    const selectedStatus = statusFilter ? statusFilter === "true" : undefined

    return (productsQuery.data?.items ?? []).filter((product) => {
      const matchesSearch = !term
        || product.name_en.toLocaleLowerCase().includes(term)
        || product.name_ar.toLocaleLowerCase().includes(term)
      const matchesCategory = !selectedCategoryId || product.category_id === selectedCategoryId
      const matchesStatus = selectedStatus === undefined || product.is_active === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [categoryFilter, productsQuery.data, search, statusFilter])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const items = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
      title: t("admin.feedback.product.deleteTitle"),
      message: t("admin.feedback.product.deleteMessage", { name: language === "ar" ? product.name_ar : product.name_en }),
      confirmLabel: t("admin.feedback.product.deleteConfirm"),
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(product)
    } catch {
      toast.error(t("admin.feedback.product.deleteError"), t("admin.feedback.requestFailed"))
    }
  }

  async function toggleProduct(product: Product) {
    try {
      await toggleMutation.mutateAsync(product)
    } catch {
      toast.error(t("admin.feedback.statusError"), t("admin.feedback.requestFailed"))
    }
  }

  const errorValue = productsQuery.error ?? categoriesQuery.error
  const error = errorValue ? t("admin.feedback.product.loadError") : ""

  return {
    items,
    categories: categoriesQuery.data?.items ?? [],
    loading: productsQuery.isPending || categoriesQuery.isPending,
    error,
    search,
    categoryFilter,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
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
