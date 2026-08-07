import logo from "@/assets/tomoor-images/web/logo-site.png"
import coffee from "@/assets/tomoor-images/coffe.jpg"
import drinks from "@/assets/tomoor-images/alot_of_drinks.jpg"
import products from "@/assets/tomoor-images/web/some-products.jpg"
import barista from "@/assets/tomoor-images/web/worker-making-coffee.jpg"
import member from "@/assets/tomoor-images/Member.jpg"
import retail from "@/assets/tomoor-images/Stuff.jpg"
import type { Category } from "@/entities/category/category.types"
import type { Product } from "@/entities/product/product.types"

export const photography = {
  logo,
  hero: coffee,
  story: barista,
  atmosphere: products,
  member,
  retail,
  coffee,
  cold: drinks,
  pastry: retail,
  dessert: products,
} as const

export const categoryPhotography = {
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=86",
  cold: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1200&q=86",
  pastry: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=86",
  dessert: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=86",
} as const

const now = "2026-01-01T00:00:00Z"

export const fallbackCategories: Category[] = [
  { id: 1, name_en: "Coffee", name_ar: "قهوة", image: categoryPhotography.coffee, is_active: true, created_at: now },
  { id: 2, name_en: "Cold drinks", name_ar: "مشروبات باردة", image: categoryPhotography.cold, is_active: true, created_at: now },
  { id: 3, name_en: "Fresh pastry", name_ar: "مخبوزات", image: categoryPhotography.pastry, is_active: true, created_at: now },
  { id: 4, name_en: "Desserts", name_ar: "حلويات", image: categoryPhotography.dessert, is_active: true, created_at: now },
]

export const fallbackProducts: Product[] = [
  { id: 1, category_id: 1, name_en: "Spanish latte", name_ar: "سبانيش لاتيه", description_en: "Double espresso, silky milk, and our lightly sweet house blend.", description_ar: null, image: photography.coffee, is_drink: true, is_active: true, price: null, small_price: "16", medium_price: "18", large_price: "20", created_at: now },
  { id: 2, category_id: 1, name_en: "Flat white", name_ar: "فلات وايت", description_en: "A balanced double ristretto with velvety steamed milk.", description_ar: null, image: photography.member, is_drink: true, is_active: true, price: null, small_price: "14", medium_price: "16", large_price: "18", created_at: now },
  { id: 3, category_id: 2, name_en: "Iced pistachio", name_ar: "آيس بستاشيو", description_en: "Pistachio cream, fresh milk, espresso, and lots of ice.", description_ar: null, image: photography.cold, is_drink: true, is_active: true, price: null, small_price: "19", medium_price: "21", large_price: "23", created_at: now },
  { id: 4, category_id: 2, name_en: "Cold brew tonic", name_ar: "كولد برو تونيك", description_en: "Slow-steeped coffee brightened with tonic and citrus peel.", description_ar: null, image: photography.cold, is_drink: true, is_active: true, price: null, small_price: "17", medium_price: "19", large_price: "21", created_at: now },
  { id: 5, category_id: 3, name_en: "Butter croissant", name_ar: "كرواسون زبدة", description_en: "Baked each morning, deeply golden, crisp, and flaky.", description_ar: null, image: photography.retail, is_drink: false, is_active: true, price: "12", small_price: null, medium_price: null, large_price: null, created_at: now },
  { id: 6, category_id: 3, name_en: "Almond morning bun", name_ar: "رول اللوز", description_en: "Laminated pastry, roasted almonds, and orange sugar.", description_ar: null, image: photography.pastry, is_drink: false, is_active: true, price: "15", small_price: null, medium_price: null, large_price: null, created_at: now },
  { id: 7, category_id: 4, name_en: "Date tiramisu", name_ar: "تيراميسو التمر", description_en: "Our signature: mascarpone, espresso, cocoa, and Palestinian dates.", description_ar: null, image: photography.dessert, is_drink: false, is_active: true, price: "22", small_price: null, medium_price: null, large_price: null, created_at: now },
  { id: 8, category_id: 4, name_en: "Basque cheesecake", name_ar: "تشيز كيك باسك", description_en: "Caramelized outside, softly set within, served simply.", description_ar: null, image: photography.story, is_drink: false, is_active: true, price: "20", small_price: null, medium_price: null, large_price: null, created_at: now },
]

export function resolveSiteImage(path: string) {
  if (path.startsWith("http") || path.startsWith("data:") || path.includes("/assets/")) return path
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
  return `${apiUrl}${path}`
}

export const siteDetails = {
  address: "West Bank, Ramallah",
  addressDetail: "ICON Mall · Fifth floor",
  openingDays: "Friday — Saturday",
  openingTime: "7:00 AM — 11:00 PM",
  hours: "Friday — Saturday · 7:00 AM — 11:00 PM",
  phoneDisplay: "+970 59 000 0000",
  phone: "+970590000000",
  email: "hello@tomoor.cafe",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=31.903055%2C35.195225",
  mapEmbedUrl: "https://www.google.com/maps?q=31.903055,35.195225&z=17&output=embed",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  tiktok: "https://www.tiktok.com/",
} as const
