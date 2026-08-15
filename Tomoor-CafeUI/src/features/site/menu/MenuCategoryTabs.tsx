import type { Category } from "@/entities/category/category.types"
import { photography } from "../siteContent"
import { resolveCategoryImage } from "./menuCategoryImage"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"
import { getMessage } from "@/localization/i18n"

export function MenuCategoryTabs({ categories, activeId, onChange }: { categories: Category[]; activeId: number | null; onChange: (id: number | null) => void }) {
  const { language, t } = useI18n()
  const all = localizedPair(getMessage("en", "common.all"), getMessage("ar", "common.all"), language)

  return (
    <div className="full-menu-categories" role="tablist" aria-label={t("menu.categoryTabs")}>
      <button className={activeId === null ? "active" : ""} type="button" role="tab" aria-selected={activeId === null} onClick={() => onChange(null)}>
        <span className="full-menu-category__image"><img src={photography.logo} alt="" /></span>
        <span className="full-menu-category__copy"><strong lang={all.primaryLanguage}>{all.primary}</strong><small lang={all.secondaryLanguage}>{all.secondary}</small></span>
      </button>
      {categories.map((category, index) => {
        const name = localizedPair(category.name_en, category.name_ar, language)
        return (
          <button className={activeId === category.id ? "active" : ""} key={category.id} type="button" role="tab" aria-selected={activeId === category.id} onClick={() => onChange(category.id)}>
            <span className="full-menu-category__image"><img src={resolveCategoryImage(category, index)} alt="" loading="lazy" /></span>
            <span className="full-menu-category__copy"><strong lang={name.primaryLanguage}>{name.primary}</strong><small lang={name.secondaryLanguage}>{name.secondary}</small></span>
          </button>
        )
      })}
    </div>
  )
}
