import type { Category } from "@/entities/category/category.types"
import type { Product } from "@/entities/product/product.types"
import coldDrinkIcon from "@/assets/cold-drink-icon.png"
import { MenuItemCard } from "./MenuItemCard"
import { resolveSiteImage } from "../siteContent"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

function ProductCards({ products }: { products: Product[] }) {
  return <div className="full-menu-grid">{products.map((product, index) => <MenuItemCard key={product.id} product={product} index={index} />)}</div>
}

export function MenuGrid({ products, categories = [], grouped = false, hasSearch = false }: { products: Product[]; categories?: Category[]; grouped?: boolean; hasSearch?: boolean }) {
  const { direction, language, t, formatNumber } = useI18n()
  if (!products.length) return <div className="full-menu-empty"><img className="full-menu-empty__icon" src={coldDrinkIcon} alt="" aria-hidden="true" /><h2 lang={language} dir={direction}>{t("menu.nothingFound")}</h2><p lang={language} dir={direction}>{t(hasSearch ? "menu.tryAnother" : "menu.chooseAnother")}</p></div>
  if (!grouped) return <ProductCards products={products} />

  const groups = categories
    .map((category) => ({ category, products: products.filter((product) => product.category_id === category.id) }))
    .filter((group) => group.products.length)

  return (
    <div className="full-menu-groups">
      {groups.map(({ category, products: categoryProducts }) => {
        const name = localizedPair(category.name_en, category.name_ar, language)
        return (
          <section className="full-menu-group" key={category.id} aria-labelledby={`menu-group-${category.id}`}>
            <header className="full-menu-group__header">
              {category.image && <span className="full-menu-group__image"><img src={resolveSiteImage(category.image)} alt="" loading="lazy" /></span>}
              <span className="full-menu-group__title">
                <strong id={`menu-group-${category.id}`} lang={name.primaryLanguage}>{name.primary}</strong>
                <span lang={name.secondaryLanguage}>{name.secondary}</span>
              </span>
              <span className="full-menu-group__count">{formatNumber(categoryProducts.length)}</span>
            </header>
            <ProductCards products={categoryProducts} />
          </section>
        )
      })}
    </div>
  )
}
