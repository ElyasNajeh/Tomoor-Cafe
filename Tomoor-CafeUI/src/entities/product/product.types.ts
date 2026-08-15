export type ProductType = "FOOD" | "DRINK"

export type Product = {
  id: number
  category_id: number
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  image: string
  is_active: boolean
  created_at: string
  product_type: ProductType
  food: { price: string } | null
  drink: { small_price: string | null; medium_price: string | null; large_price: string | null } | null
}
