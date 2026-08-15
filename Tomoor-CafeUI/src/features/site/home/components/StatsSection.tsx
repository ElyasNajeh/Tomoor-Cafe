import { useEffect, useRef, useState } from "react"
import coffeeIcon from "@/assets/coffe-icon2.png"
import datesIcon from "@/assets/dates-icoon.png"
import happyCustomerIcon from "@/assets/happy-customer-icon.png"
import { useI18n } from "@/localization/useI18n"

const stats = [
  { value: 10000, labelKey: "site.home.stats.customers", icon: happyCustomerIcon },
  { value: 100, labelKey: "site.home.stats.products", icon: coffeeIcon },
  { value: 5, labelKey: "site.home.stats.years", icon: datesIcon },
] as const

export function StatsSection() {
  const [progress, setProgress] = useState(() => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0
  ))
  const sectionRef = useRef<HTMLElement | null>(null)
  const { direction, formatNumber, language, t } = useI18n()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const startedAt = performance.now()
      const tick = (time: number) => {
        const nextProgress = Math.min((time - startedAt) / 1100, 1)
        setProgress(1 - Math.pow(1 - nextProgress, 3))
        if (nextProgress < 1) frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.35 })

    observer.observe(section)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="site-stats" ref={sectionRef} aria-label={t("site.home.stats.label")}>
      <div className="site-container site-stats__grid">
        {stats.map((stat) => {
          const value = Math.round(stat.value * progress)
          return (
            <div className="site-stat" key={stat.labelKey}>
              <img src={stat.icon} alt="" aria-hidden="true" />
              <strong>{formatNumber(value)}+</strong>
              <span lang={language} dir={direction}>{t(stat.labelKey)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
