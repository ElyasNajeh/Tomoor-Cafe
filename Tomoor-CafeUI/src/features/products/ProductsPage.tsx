import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import { ProductFilters } from "./components/ProductFilters"
import { ProductFormDialog } from "./components/ProductFormDialog"
import { ProductTable } from "./components/ProductTable"
import { useProducts } from "./hooks/useProducts"
import type { Product } from "./products.types"

type EditingProduct = Product | null | undefined

function getInitialEditingProduct(): EditingProduct {
  return new URLSearchParams(window.location.search).has("new") ? null : undefined
}

export function ProductsPage() {
  const products = useProducts()
  const [editingProduct, setEditingProduct] = useState<EditingProduct>(getInitialEditingProduct)

  function openCreateDialog() {
    setEditingProduct(null)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
  }

  function closeDialog() {
    setEditingProduct(undefined)
  }

  return (
    <section>
      <PageHeader
        eyebrow="Cafe menu"
        icon="products"
        title="Products"
        description="Manage menu items, pricing, availability, and imagery."
        actions={(
          <button className="button" onClick={openCreateDialog} disabled={!products.categories.length}>
            + Add product
          </button>
        )}
      />

      <ProductFilters
        categories={products.categories}
        search={products.search}
        category={products.categoryFilter}
        status={products.statusFilter}
        onSearchChange={products.setSearch}
        onCategoryChange={products.setCategoryFilter}
        onStatusChange={products.setStatusFilter}
      />

      <ProductTable
        items={products.items}
        categories={products.categories}
        loading={products.loading}
        error={products.error}
        onCreate={openCreateDialog}
        onEdit={openEditDialog}
        onToggle={(product) => void products.toggleProduct(product)}
        onDelete={(product) => void products.deleteProduct(product)}
        onRetry={() => void products.reload()}
      />

      {editingProduct !== undefined && (
        <ProductFormDialog
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          categories={products.categories}
          onClose={closeDialog}
          onSave={products.saveProduct}
        />
      )}

      {!products.loading && !products.error && (
        <Pagination
          page={products.page}
          totalPages={products.totalPages}
          totalItems={products.totalItems}
          onChange={products.setPage}
        />
      )}
    </section>
  )
}
