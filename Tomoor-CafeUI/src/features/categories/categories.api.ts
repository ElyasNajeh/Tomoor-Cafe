import { apiRequest } from "@/shared/api/client"
import { createQueryString, type PageResult, type PaginationParams } from "@/shared/api/pagination"
import type { Category, CategoryPayload } from "./categories.types"

export type { Category, CategoryPayload } from "./categories.types"

export const CategoriesApi = {
  list(params: PaginationParams = {}) {
    const query = createQueryString(params)
    return apiRequest<PageResult<Category>>(`/categories/?${query}`)
  },
  create(data: CategoryPayload) {
    return apiRequest<Category>("/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: number, data: CategoryPayload) {
    return apiRequest<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (id: number) => apiRequest<void>(`/categories/${id}`, { method: "DELETE" }),
  async upload(file: File) {
    const body = new FormData()
    body.append("file", file)

    const result = await apiRequest<{ url: string }>("/categories/upload-image", {
      method: "POST",
      body,
    })

    return result.url
  },
}
