export type Category = {
  id: number
  name_ar: string
  name_en: string
  image: string | null
  created_at: string
}

export type CategoryPayload = {
  name_ar: string
  name_en: string
  image: string
}
