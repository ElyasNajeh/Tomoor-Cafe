import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useSiteData } from "../hooks/useSiteData"
import { MenuCategoryTabs } from "./MenuCategoryTabs"
import { MenuGrid } from "./MenuGrid"
import { productElementId } from "./productElementId"
import { resolveSiteImage } from "../siteContent"
import { useI18n } from "@/localization/useI18n"
import type { Product } from "@/entities/product/product.types"

type PriceFilter = "all" | "under15" | "between15And20" | "over20"

const priceFilters: PriceFilter[] = ["all", "under15", "between15And20", "over20"]

function parsePrice(value: unknown) {
  if (value === null || value === undefined) return null
  const normalized = String(value).replace(/[^\d.]/g, "")
  if (!normalized) return null
  const price = Number.parseFloat(normalized)
  return Number.isFinite(price) ? price : null
}

function productPrices(product: Product) {
  const prices = product.product_type === "FOOD"
    ? [product.food?.price]
    : [product.drink?.small_price, product.drink?.medium_price, product.drink?.large_price]
  return prices
    .map(parsePrice)
    .filter((price): price is number => price !== null)
}

function matchesPriceFilter(product: Product, filter: PriceFilter) {
  if (filter === "all") return true
  const prices = productPrices(product)
  if (!prices.length) return false
  if (filter === "under15") return prices.some((price) => price <= 15)
  if (filter === "between15And20") return prices.some((price) => price > 15 && price <= 20)
  return prices.some((price) => price > 20)
}

export function MenuPage() {
  const { categories, products, isLoading, isUsingPreviewData } = useSiteData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [priceFilterOpen, setPriceFilterOpen] = useState(false)
  const [showCategoryReturn, setShowCategoryReturn] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const { direction, language, t, formatNumber } = useI18n()
  const rawCategory = searchParams.get("category")
  const selectedCategory = rawCategory ? Number(rawCategory) : null
  const activeId = selectedCategory && categories.some((category) => category.id === selectedCategory) ? selectedCategory : null
  const searchedProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    return products.filter((product) => {
      if (activeId && product.category_id !== activeId) return false
      if (!query) return true

      const category = categories.find((item) => item.id === product.category_id)
      return [product.name_en, product.name_ar, category?.name_en, category?.name_ar]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(query))
    })
  }, [activeId, categories, products, search])
  const visibleProducts = useMemo(() => (
    searchedProducts.filter((product) => matchesPriceFilter(product, priceFilter))
  ), [priceFilter, searchedProducts])
  const searchResults = search.trim() ? visibleProducts.slice(0, 6) : []

  const selectCategory = (id: number | null) => {
    setSearchParams(id ? { category: String(id) } : {}, { replace: true })
    window.requestAnimationFrame(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }
  const resultHeading = search.trim() ? t("menu.resultsFor", { query: search.trim() }) : t("menu.allMenu")
  const hasActivePriceFilter = priceFilter !== "all"

  useEffect(() => {
    let frame = 0
    const updateCategoryReturn = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const categoryBottom = categoriesRef.current?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY
        const footerTop = document.querySelector(".site-footer")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
        setShowCategoryReturn(categoryBottom < 90 && footerTop > window.innerHeight - 8)
      })
    }

    updateCategoryReturn()
    window.addEventListener("scroll", updateCategoryReturn, { passive: true })
    window.addEventListener("resize", updateCategoryReturn)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", updateCategoryReturn)
      window.removeEventListener("resize", updateCategoryReturn)
    }
  }, [])

  const returnToCategories = () => categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  const scrollToProduct = (product: Product) => {
    setPriceFilterOpen(false)
    window.requestAnimationFrame(() => {
      document.getElementById(productElementId(product.id))?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  return (
    <div className="full-menu-page">
      <header className="full-menu-page__header site-container">
        <Link to="/" aria-label={t("menu.backHome")}><span className="directional-arrow" aria-hidden="true">←</span><span lang={language} dir={direction}>{t("menu.home")}</span></Link>
        <div className="full-menu-page__title">
          <small>Tomoor Café</small>
          <h1 lang={language} dir={direction}>{t("menu.title")}</h1>
          <span lang={language} dir={direction}>{t("menu.subtitle")}</span>
        </div>
        <div className={`full-menu-search${priceFilterOpen ? " is-filter-open" : ""}`} role="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          <label className="full-menu-search__label" htmlFor="menu-search" lang={language} dir={direction}>{t("menu.searchLabel")}</label>
          <input
            id="menu-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("menu.searchPlaceholder")}
            lang={language}
            dir={direction}
            autoComplete="off"
          />
          {search && <button className="full-menu-search__clear" type="button" aria-label={t("menu.clearSearch")} onClick={() => setSearch("")}>×</button>}
          <button
            className={`full-menu-search__filter${hasActivePriceFilter ? " is-active" : ""}`}
            type="button"
            aria-label={t("menu.priceFilter")}
            aria-expanded={priceFilterOpen}
            onClick={() => setPriceFilterOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          </button>
          {priceFilterOpen && (
            <div className="full-menu-price-filter">
              {priceFilters.map((filter) => (
                <button
                  className={filter === priceFilter ? "is-active" : ""}
                  type="button"
                  key={filter}
                  onClick={() => {
                    setPriceFilter(filter)
                    setPriceFilterOpen(false)
                  }}
                >
                  <span lang={language} dir={direction}>{t(`menu.priceFilters.${filter}`)}</span>
                </button>
              ))}
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="full-menu-search-results">
              {searchResults.map((product) => (
                <button type="button" key={product.id} onClick={() => scrollToProduct(product)}>
                  <img src={resolveSiteImage(product.image)} alt="" />
                  <span className="full-menu-search-results__copy">
                    <strong lang="en" dir="ltr">{product.name_en}</strong>
                    <small lang="ar" dir="rtl">{product.name_ar}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <section className="full-menu-content">
        <div className="site-container">
          <div className="full-menu-categories-section" ref={categoriesRef}>
            <div className="full-menu-content__intro"><small lang={language} dir={direction}>{t("menu.findFavourite")}</small><h2 lang={language} dir={direction}>{t("menu.categories")}</h2></div>
            <MenuCategoryTabs categories={categories} activeId={activeId} onChange={selectCategory} />
          </div>
          {isUsingPreviewData && <div className="full-menu-preview-note" lang={language} dir={direction}>{t("menu.preview")}</div>}
          <div className="full-menu-products" ref={productsRef}>
            {activeId === null && (
              <div className="full-menu-results-heading">
                <div><small lang={language} dir={direction}>{t("menu.ourMenu")}</small><h2 lang={language} dir={direction}>{resultHeading}</h2></div>
                {!isLoading && <span lang={language} dir={direction}>{formatNumber(visibleProducts.length)} {t(visibleProducts.length === 1 ? "common.item" : "common.items")}</span>}
              </div>
            )}
            {isLoading
              ? <div className="full-menu-loading"><i /><span lang={language} dir={direction}>{t("menu.preparing")}</span></div>
              : <MenuGrid products={visibleProducts} categories={categories} grouped hasSearch={Boolean(search.trim())} />}
          </div>
        </div>
      </section>
      <button
        className={`full-menu-category-return${showCategoryReturn ? " is-visible" : ""}`}
        type="button"
        aria-label={t("menu.backCategories")}
        aria-hidden={!showCategoryReturn}
        tabIndex={showCategoryReturn ? 0 : -1}
        onClick={returnToCategories}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
      </button>
    </div>
  )
}
