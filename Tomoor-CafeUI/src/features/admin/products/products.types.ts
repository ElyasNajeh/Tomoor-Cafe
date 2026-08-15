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

export type ProductPayload = {
  category_id: number
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  image: string
  is_active: boolean
  product_type: ProductType
  food: { price: number } | null
  drink: { small_price: number | null; medium_price: number | null; large_price: number | null } | null
}

export type ProductFormValues = {
  category_id: string
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  image: string
  product_type: ProductType
  is_active: boolean
  price: string
  small_price: string
  medium_price: string
  large_price: string
}
