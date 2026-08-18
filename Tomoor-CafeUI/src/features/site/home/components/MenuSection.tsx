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

const SLIDER_SCROLL_DURATION_MS = 1150

function easeSliderMovement(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10)
}

function cancelSliderAnimation(
  animationRef: { current: number | null },
  carousel?: HTMLDivElement | null,
) {
  if (animationRef.current === null) return
  window.cancelAnimationFrame(animationRef.current)
  animationRef.current = null
  carousel?.classList.remove("is-animating")
}

function gentlyCenterSlider(
  carousel: HTMLDivElement | null,
  card: HTMLAnchorElement | null,
  animationRef: { current: number | null },
) {
  if (!carousel || !card) return

  cancelSliderAnimation(animationRef, carousel)

  const carouselBounds = carousel.getBoundingClientRect()
  const cardBounds = card.getBoundingClientRect()
  const distance = cardBounds.left + cardBounds.width / 2
    - (carouselBounds.left + carouselBounds.width / 2)
  const start = carousel.scrollLeft

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    carousel.scrollLeft = start + distance
    animationRef.current = null
    return
  }

  carousel.classList.add("is-animating")
  const startedAt = performance.now()
  const animate = (now: number) => {
    const progress = Math.min((now - startedAt) / SLIDER_SCROLL_DURATION_MS, 1)
    const easedProgress = easeSliderMovement(progress)
    carousel.scrollLeft = start + distance * easedProgress

    if (progress < 1) {
      animationRef.current = window.requestAnimationFrame(animate)
    } else {
      animationRef.current = null
      carousel.classList.remove("is-animating")
    }
  }

  animationRef.current = window.requestAnimationFrame(animate)
}

export function MenuSection({ sliders }: { sliders: Slider[] }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [activeSlider, setActiveSlider] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [sliderPaused, setSliderPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const sliderRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const activeSliderRef = useRef(0)
  const sliderAnimationRef = useRef<number | null>(null)
  const { direction, language, t } = useI18n()
  const sliderCards = [...sliders].sort((first, second) => first.display_order - second.display_order)

  useEffect(() => {
    if (heroPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [heroPaused, slideIndex])

  useEffect(() => {
    if (!sliderCards.length) return

    activeSliderRef.current = 0
    sliderRefs.current[0]?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    })
  }, [sliderCards.length])

  useEffect(() => {
    if (sliderPaused || sliderCards.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const carousel = carouselRef.current
    const interval = window.setInterval(() => {
      const nextIndex = (activeSliderRef.current + 1) % sliderCards.length
      activeSliderRef.current = nextIndex
      setActiveSlider(nextIndex)
      gentlyCenterSlider(carousel, sliderRefs.current[nextIndex], sliderAnimationRef)
    }, 2500)

    return () => {
      window.clearInterval(interval)
      cancelSliderAnimation(sliderAnimationRef, carousel)
    }
  }, [sliderCards.length, sliderPaused])

  const moveSlider = (amount: number) => {
    if (!sliderCards.length) return
    setSliderPaused(true)
    const nextIndex = Math.min(Math.max(activeSlider + amount, 0), sliderCards.length - 1)
    activeSliderRef.current = nextIndex
    setActiveSlider(nextIndex)
    gentlyCenterSlider(carouselRef.current, sliderRefs.current[nextIndex], sliderAnimationRef)
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
          <Link className="home-hero__menu-button" to="/menu" lang={language} dir={direction}>{t("site.home.viewMenu")}</Link>
        </div>
      </div>

      {sliderCards.length > 0 && <div className="home-category-dock" aria-label={t("site.home.featuredSliders")}>
        <button
          className="home-category-nav home-category-nav--next"
          type="button"
          aria-label={t("site.home.nextSlider")}
          disabled={activeSlider >= sliderCards.length - 1}
          onClick={() => moveSlider(1)}
        >
          <span className="directional-arrow">→</span>
        </button>
        <div className="home-category-carousel" ref={carouselRef}>
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
      </div>}
    </section>
  )
}
