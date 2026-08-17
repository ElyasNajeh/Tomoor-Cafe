import { useQuery } from "@tanstack/react-query"
import { categoryApi } from "@/entities/category/category.api"
import { productApi } from "@/entities/product/product.api"
import { sliderApi } from "@/entities/slider/slider.api"
import { queryKeys } from "@/shared/query/queryClient"

const SITE_LIST_LIMIT = 100

export function useSiteData() {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoryApi.list({ limit: SITE_LIST_LIMIT }),
    select: (categories) => ({
      ...categories,
      items: categories.items.filter((category) => category.is_active),
    }),
  })
  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => productApi.list({ limit: SITE_LIST_LIMIT }),
    select: (products) => ({
      ...products,
      items: products.items.filter((product) => product.is_active),
    }),
  })
  const slidersQuery = useQuery({
    queryKey: queryKeys.sliders,
    queryFn: sliderApi.list,
    select: (sliders) => sliders
      .filter((slider) => slider.is_active)
      .sort((first, second) => first.display_order - second.display_order),
  })

  return {
    categories: categoriesQuery.data?.items ?? [],
    products: productsQuery.data?.items ?? [],
    sliders: slidersQuery.data ?? [],
    isLoading: categoriesQuery.isLoading || productsQuery.isLoading,
  }
}
