import { useState } from "react"
import largeIcon from "@/assets/large-icon.png"
import mediumIcon from "@/assets/meduim-icon.png"
import smallIcon from "@/assets/small-icon.png"
import type { Product } from "@/entities/product/product.types"
import { resolveSiteImage } from "../siteContent"
import { useI18n } from "@/localization/useI18n"
import { localizedOptional, localizedPair } from "@/localization/localizedContent"
import { productElementId } from "./productElementId"

const sizes = [
  { nameKey: "menu.small", icon: smallIcon, key: "small_price" },
  { nameKey: "menu.medium", icon: mediumIcon, key: "medium_price" },
  { nameKey: "menu.large", icon: largeIcon, key: "large_price" },
] as const

function ProductPrice({ product }: { product: Product }) {
  const { direction, language, t } = useI18n()
  if (product.product_type === "FOOD") {
    return <span className="menu-item-card__single-price"><strong>{product.food?.price ?? "—"}</strong><span lang={language} dir={direction}>{t("common.currency")}</span></span>
  }

  const availableSizes = sizes.filter((size) => {
    const price = product.drink?.[size.key]
    return price !== null && price !== undefined && String(price).trim() !== ""
  })
  if (!availableSizes.length) {
    return <span className="menu-item-card__single-price"><strong>—</strong><span lang={language} dir={direction}>{t("common.currency")}</span></span>
  }

  return (
    <span className="menu-item-card__sizes" aria-label={t("menu.availableSizes")}>
      {availableSizes.map((size) => (
        <span className="menu-item-card__size" key={size.nameKey} title={t(size.nameKey)}>
          <img src={size.icon} alt="" />
          <span className="site-visually-hidden">{t(size.nameKey)}</span>
          <strong>{String(product.drink?.[size.key])}</strong><small lang={language} dir={direction}>{t("common.currency")}</small>
        </span>
      ))}
    </span>
  )
}

export function MenuItemCard({ product, index }: { product: Product; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { direction, language, t } = useI18n()
  const name = localizedPair(product.name_en, product.name_ar, language)
  const description = localizedOptional(product.description_en, product.description_ar, language)
  const primaryDescription = description.primary || t("menu.fallbackDescription")
  const primaryDescriptionLanguage = description.primary ? description.primaryLanguage : language

  return (
    <button
      id={productElementId(product.id)}
      className={`menu-item-card${isFlipped ? " is-flipped" : ""}`}
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
      type="button"
      aria-pressed={isFlipped}
      aria-label={`${name.primary}. ${t(isFlipped ? "menu.showPrices" : "menu.showDescription")}`}
      onClick={() => setIsFlipped((value) => !value)}
    >
      <span className="menu-item-card__inner">
        <span className="menu-item-card__face menu-item-card__front" aria-hidden={isFlipped}>
          <span className="menu-item-card__image"><img src={resolveSiteImage(product.image)} alt="" loading="lazy" /></span>
          <span className="menu-item-card__body">
            <span className="menu-item-card__names"><strong lang={name.primaryLanguage}>{name.primary}</strong><span lang={name.secondaryLanguage}>{name.secondary}</span></span>
            <ProductPrice product={product} />
            <small className="menu-item-card__tap"><span lang={language} dir={direction}>{t("menu.tapDetails")}</span></small>
          </span>
        </span>
        <span className="menu-item-card__face menu-item-card__back" aria-hidden={!isFlipped}>
          <span className="menu-item-card__back-heading"><strong lang={name.primaryLanguage}>{name.primary}</strong><span lang={name.secondaryLanguage}>{name.secondary}</span></span>
          <span className="menu-item-card__description" lang={primaryDescriptionLanguage}>{primaryDescription}</span>
          {description.secondary && <span className="menu-item-card__description menu-item-card__description--secondary" lang={description.secondaryLanguage}>{description.secondary}</span>}
          <small className="menu-item-card__tap"><span lang={language} dir={direction}>{t("menu.tapPrices")}</span></small>
        </span>
      </span>
    </button>
  )
}
