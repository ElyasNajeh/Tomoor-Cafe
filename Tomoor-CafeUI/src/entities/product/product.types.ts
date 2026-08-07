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
