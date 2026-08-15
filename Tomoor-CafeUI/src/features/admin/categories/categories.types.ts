export type Category = {
  id: number
  name_ar: string
  name_en: string
  image: string | null
  is_active: boolean
  created_at: string
}

export type CategoryPayload = {
  name_ar: string
  name_en: string
  image: string
  is_active: boolean
}
