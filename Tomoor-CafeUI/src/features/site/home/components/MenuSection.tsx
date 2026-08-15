import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import coffeeIcon1 from "@/assets/coffe-icon1.png"
import memberImage from "@/assets/tomoor-images/Member.jpg"
import shopEntranceImage from "@/assets/tomoor-images/shop_entrance.png"
import baristaImage from "@/assets/tomoor-images/worker_making_coffe.png"
import type { Slider } from "@/entities/slider/slider.types"
import { resolveSiteImage } from "../../siteContent"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

const heroSlides = [
  { image: shopEntranceImage, titleKey: "site.home.slides.oneTitle", subtitleKey: "site.home.slides.oneSubtitle", position: "center center" },
  { image: memberImage, titleKey: "site.home.slides.twoTitle", subtitleKey: "site.home.slides.twoSubtitle", position: "center 58%" },
  { image: baristaImage, titleKey: "site.home.slides.threeTitle", subtitleKey: "site.home.slides.threeSubtitle", position: "center center" },
] as const

const fallbackSliderCards = heroSlides.map((slide, index) => ({
  id: -index - 1,
  title_en: `Tomoor Café ${index + 1}`,
  title_ar: `مقهى تمور ${index + 1}`,
  display_order: index,
  is_active: true,
  image: slide.image,
  created_at: "",
})) satisfies Slider[]

export function MenuSection({ sliders }: { sliders: Slider[] }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [activeSlider, setActiveSlider] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const sliderRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const { direction, language, t } = useI18n()
  const sliderCards = sliders.length
    ? [...sliders].sort((first, second) => first.display_order - second.display_order)
    : fallbackSliderCards

  useEffect(() => {
    if (heroPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [heroPaused, slideIndex])

  const moveSlider = (amount: number) => {
    if (!sliderCards.length) return
    const nextIndex = Math.min(Math.max(activeSlider + amount, 0), sliderCards.length - 1)
    setActiveSlider(nextIndex)
    sliderRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }

  const syncActiveSlider = () => {
    const carousel = carouselRef.current
    if (!carousel) return
    const carouselCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY
    sliderRefs.current.forEach((card, index) => {
      if (!card) return
      const bounds = card.getBoundingClientRect()
      const distance = Math.abs(bounds.left + bounds.width / 2 - carouselCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    setActiveSlider(closestIndex)
  }

  return (
    <section className="home-hero-menu" id="menu">
      <div
        className="home-hero"
        aria-label={t("site.home.heroLabel")}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {heroSlides.map((slide, index) => (
          <div className={`home-hero__slide${index === slideIndex ? " is-active" : ""}`} aria-hidden={index !== slideIndex} key={slide.image}>
            <img src={slide.image} alt="" style={{ objectPosition: slide.position }} />
          </div>
        ))}
        <div className="home-hero__shade" />
        <div className="home-hero__content" aria-live="polite">
          <img className="home-hero__badge-icon" src={coffeeIcon1} alt="" aria-hidden="true" />
          <p lang={language} dir={direction}>{t(heroSlides[slideIndex].subtitleKey)}</p>
          <h1 lang={language} dir={direction}>{t(heroSlides[slideIndex].titleKey)}</h1>
        </div>
        <div className="home-hero__dots" aria-label={t("site.home.heroImages")}>
          {heroSlides.map((slide, index) => (
            <button
              className={index === slideIndex ? "is-active" : ""}
              type="button"
              aria-label={t("site.home.showImage", { number: index + 1 })}
              aria-current={index === slideIndex ? "true" : undefined}
              onClick={() => setSlideIndex(index)}
              key={slide.image}
            />
          ))}
        </div>
      </div>

      <div className="home-category-dock" aria-label={t("site.home.featuredSliders")}>
        <button
          className="home-category-nav home-category-nav--next"
          type="button"
          aria-label={t("site.home.nextSlider")}
          disabled={activeSlider >= sliderCards.length - 1}
          onClick={() => moveSlider(1)}
        >
          <span className="directional-arrow">→</span>
        </button>
        <div className="home-category-carousel" ref={carouselRef} onScroll={syncActiveSlider}>
          <div className="home-category-track">
            {sliderCards.map((slider, index) => {
              const title = localizedPair(slider.title_en, slider.title_ar, language)
              return <Link
                className={`home-category-card${index === activeSlider ? " is-active" : ""}`}
                key={slider.id}
                ref={(element) => { sliderRefs.current[index] = element }}
                to="/menu"
              >
                <span className="home-category-card__copy">
                  <strong lang={title.primaryLanguage}>{title.primary}</strong>
                  <small lang={title.secondaryLanguage}>{title.secondary}</small>
                  <i />
                </span>
                <span className="home-category-card__image">
                  <img src={resolveSiteImage(slider.image)} alt="" />
                </span>
              </Link>
            })}
          </div>
        </div>
        <button
          className="home-category-nav home-category-nav--previous"
          type="button"
          aria-label={t("site.home.previousSlider")}
          disabled={activeSlider <= 0}
          onClick={() => moveSlider(-1)}
        >
          <span className="directional-arrow">←</span>
        </button>
      </div>
    </section>
  )
}
