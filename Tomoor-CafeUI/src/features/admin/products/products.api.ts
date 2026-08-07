import { apiRequest } from "@/shared/api/client"
import { createQueryString, type PageResult, type PaginationParams } from "@/shared/api/pagination"
import type { Product, ProductPayload } from "./products.types"

export type { Product, ProductPayload } from "./products.types"

type ProductListParams = PaginationParams & {
  category_id?: number
  is_active?: boolean
}

export const ProductsApi = {
  list(params: ProductListParams = {}) {
    const query = createQueryString(params)
    return apiRequest<PageResult<Product>>(`/products/?${query}`)
  },
  create(data: ProductPayload) {
    return apiRequest<Product>("/products/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: number, data: ProductPayload) {
    return apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (id: number) => apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
  toggle: (id: number) => apiRequest<Product>(`/products/${id}/toggle-status`, { method: "PATCH" }),
  async upload(file: File) {
    const body = new FormData()
    body.append("file", file)
    const result = await apiRequest<{ url: string }>("/products/upload-image", {
      method: "POST",
      body,
    })
    return result.url
  },
}
