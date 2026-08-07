import { apiRequest } from "@/shared/api/client"
import { createQueryString, type PageResult, type PaginationParams } from "@/shared/api/pagination"
import type { Product } from "./product.types"

type ProductListParams = PaginationParams & {
  category_id?: number
  is_active?: boolean
}

export const productApi = {
  list(params: ProductListParams = {}) {
    const query = createQueryString(params)
    return apiRequest<PageResult<Product>>(`/products/?${query}`)
  },
  listActive: () =>
    apiRequest<PageResult<Product>>("/products/?page=1&limit=100&is_active=true"),
}
