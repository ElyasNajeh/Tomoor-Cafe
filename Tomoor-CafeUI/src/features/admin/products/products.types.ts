export type Product = {
  id: number
  category_id: number
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  image: string
  is_drink: boolean
  is_active: boolean
  price: string | null
  small_price: string | null
  medium_price: string | null
  large_price: string | null
  created_at: string
}

export type ProductPayload = {
  category_id: number
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  image: string
  is_drink: boolean
  is_active: boolean
  price: number | null
  small_price: number | null
  medium_price: number | null
  large_price: number | null
}

export type ProductFormValues = {
  category_id: string
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  image: string
  is_drink: boolean
  is_active: boolean
  price: string
  small_price: string
  medium_price: string
  large_price: string
}
