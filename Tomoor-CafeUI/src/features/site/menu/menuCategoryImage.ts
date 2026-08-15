import type { Category } from "@/entities/category/category.types"
import { categoryPhotography, resolveSiteImage } from "../siteContent"

export function resolveCategoryImage(category: Category, index: number) {
  if (category.image) return resolveSiteImage(category.image)

  const name = `${category.name_en} ${category.name_ar}`.toLocaleLowerCase()
  if (name.includes("cold") || name.includes("juice") || name.includes("drink")) return categoryPhotography.cold
  if (name.includes("pastr") || name.includes("bak") || name.includes("croissant")) return categoryPhotography.pastry
  if (name.includes("dessert") || name.includes("cake") || name.includes("sweet")) return categoryPhotography.dessert
  if (name.includes("coffee") || name.includes("hot") || name.includes("matcha")) return categoryPhotography.coffee

  return Object.values(categoryPhotography)[index % Object.values(categoryPhotography).length]
}
