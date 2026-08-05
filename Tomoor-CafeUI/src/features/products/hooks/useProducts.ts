import { useCallback, useEffect, useState } from "react"
import { CategoriesApi } from "@/features/categories/categories.api"
import type { Category } from "@/features/categories/categories.types"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { ProductsApi } from "../products.api"
import type { Product, ProductPayload } from "../products.types"

const PAGE_SIZE = 10

export function useProducts() {
  const { toast, confirm } = useFeedback()
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearchValue] = useState("")
  const [categoryFilter, setCategoryFilterValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        ProductsApi.list({
          page,
          limit: PAGE_SIZE,
          search,
          category_id: categoryFilter ? Number(categoryFilter) : undefined,
          is_active: statusFilter ? statusFilter === "true" : undefined,
        }),
        CategoriesApi.list({ limit: 100 }),
      ])

      setItems(productsResult.items)
      setTotalPages(productsResult.total_pages)
      setTotalItems(productsResult.total_items)
      setCategories(categoriesResult.items)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load products")
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, page, search, statusFilter])

  useEffect(() => {
    // Synchronize the current query with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts()
  }, [loadProducts])

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function saveProduct(product: Product | null, payload: ProductPayload) {
    if (product) {
      await ProductsApi.update(product.id, payload)
    } else {
      await ProductsApi.create(payload)
    }

    toast.success(
      product ? "Product updated" : "Product created",
      `${payload.name_en} was saved successfully.`,
    )
    await loadProducts()
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
      await ProductsApi.delete(product.id)
      toast.success("Product deleted", `${product.name_en} was removed.`)
      await loadProducts()
    } catch (caught) {
      toast.error("Could not delete product", caught instanceof Error ? caught.message : undefined)
    }
  }

  async function toggleProduct(product: Product) {
    try {
      await ProductsApi.toggle(product.id)
      toast.success(
        product.is_active ? "Product hidden" : "Product activated",
        `${product.name_en} is now ${product.is_active ? "hidden from" : "visible on"} the menu.`,
      )
      await loadProducts()
    } catch (caught) {
      toast.error("Status update failed", caught instanceof Error ? caught.message : undefined)
    }
  }

  return {
    items,
    categories,
    loading,
    error,
    search,
    categoryFilter,
    statusFilter,
    page,
    totalPages,
    totalItems,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setCategoryFilter: (value: string) => updateFilter(setCategoryFilterValue, value),
    setStatusFilter: (value: string) => updateFilter(setStatusFilterValue, value),
    setPage,
    reload: loadProducts,
    saveProduct,
    deleteProduct,
    toggleProduct,
  }
}
