import { apiRequest } from "@/shared/api/client"
import { createQueryString, type PageResult, type PaginationParams } from "@/shared/api/pagination"
import type { Category } from "./category.types"

type CategoryListParams = PaginationParams & {
  is_active?: boolean
}

export const categoryApi = {
  list(params: CategoryListParams = {}) {
    const query = createQueryString(params)
    return apiRequest<PageResult<Category>>(`/categories/?${query}`)
  },
  listActive: () =>
    apiRequest<PageResult<Category>>("/categories/?page=1&limit=100&is_active=true"),
}
