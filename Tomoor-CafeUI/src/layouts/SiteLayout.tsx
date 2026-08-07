import { useEffect, useState } from "react"
import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom"

import { SiteIcon } from "@/features/site/SiteIcon"
import {
  photography,
  siteDetails,
} from "@/features/site/siteContent"
import { LanguageSwitcher } from "@/localization/LanguageSwitcher"
import { useI18n } from "@/localization/useI18n"

const navItems = [
  {
    labelKey: "site.nav.story",
    section: "story",
  },
  {
    labelKey: "site.nav.menu",
    to: "/menu",
  },
  {
    labelKey: "site.nav.visit",
    section: "visit",
  },
  {
    labelKey: "site.nav.contact",
    section: "contact",
  },
] as const

function Brand({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { t } = useI18n()

  return (
    <Link
      className="site-brand"
      to="/"
      aria-label={t("site.brandHome")}
      onClick={onNavigate}
    >
      <img
        src={photography.logo}
        alt=""
      />
    </Link>
  )
}

function HeaderSocials() {
  const { t } = useI18n()

  return (
    <div
      className="site-header__socials"
      aria-label={t("site.socials")}
    >
      <a
        href={siteDetails.instagram}
        target="_blank"
        rel="noreferrer"
      >
        Instagram
      </a>

      <a
        href={siteDetails.facebook}
        target="_blank"
        rel="noreferrer"
      >
        Facebook
      </a>

      <a
        href={siteDetails.tiktok}
        target="_blank"
        rel="noreferrer"
      >
        TikTok
      </a>
    </div>
  )
}

export function SiteLayout() {
  const [menuOpen, setMenuOpen] =
    useState(false)

  const [scrolled, setScrolled] =
    useState(false)

  const location = useLocation()

  const {
    direction,
    language,
    t,
  } = useI18n()

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 24)

    onScroll()

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    )

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      )
  }, [])

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(
            location.hash.slice(1)
          )
          ?.scrollIntoView({
            behavior: "smooth",
          })
      })

      return
    }

    window.scrollTo({
      top: 0,
      behavior: "instant",
    })
  }, [
    location.hash,
    location.pathname,
  ])

  const sectionHref = (
    section: string
  ) =>
    location.pathname === "/"
      ? `#${section}`
      : `/#${section}`

  return (
    <div id="top">
      <header
        className={`site-header${
          scrolled
            ? " is-scrolled"
            : ""
        }${
          menuOpen
            ? " is-open"
            : ""
        }`}
      >
        <Brand
          onNavigate={() =>
            setMenuOpen(false)
          }
        />

        <nav
          className="site-nav"
          aria-label={t(
            "site.nav.label"
          )}
        >
          {navItems.map((item) =>
            "to" in item ? (
              <Link
                key={item.labelKey}
                to={item.to}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <a
                key={item.section}
                href={sectionHref(
                  item.section
                )}
              >
                {t(item.labelKey)}
              </a>
            )
          )}
        </nav>

        <a
          className="site-header__location"
          href={siteDetails.mapsUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t(
            "site.directions"
          )}
        >
          <SiteIcon name="location" />
        </a>

        <LanguageSwitcher />

        <HeaderSocials />

        <button
          className="site-menu-button"
          type="button"
          aria-label={
            menuOpen
              ? t("site.nav.close")
              : t("site.nav.open")
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
        >
          <SiteIcon
            name={
              menuOpen
                ? "close"
                : "menu"
            }
          />
        </button>

        <div className="site-menu-panel">
          <nav
            aria-label={t(
              "site.nav.label"
            )}
          >
            {navItems.map(
              (item, index) =>
                "to" in item ? (
                  <Link
                    key={item.labelKey}
                    to={item.to}
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    <span>
                      0{index + 1}
                    </span>

                    {t(item.labelKey)}
                  </Link>
                ) : (
                  <a
                    key={item.section}
                    href={sectionHref(
                      item.section
                    )}
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    <span>
                      0{index + 1}
                    </span>

                    {t(item.labelKey)}
                  </a>
                )
            )}
          </nav>

          <div className="site-menu-panel__hours">
            <span
              lang={language}
              dir={direction}
            >
              {t(
                "site.details.openingDays"
              )}
            </span>

            <span
              lang={language}
              dir={direction}
            >
              {t(
                "site.details.openingTime"
              )}
            </span>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__top">
          <Brand />

          <p
            lang={language}
            dir={direction}
          >
            {t(
              "site.details.hours"
            )}
          </p>

          <a href="#top">
            <span
              lang={language}
              dir={direction}
            >
              {t(
                "site.footer.backToTop"
              )}
            </span>

            <span className="site-footer__back-icon">
              ↑
            </span>
          </a>
        </div>

        <div className="site-footer__bottom">
          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            Tomoor Café
          </span>

          <span
            lang={language}
            dir={direction}
          >
            {t(
              "site.footer.madeWithCare"
            )}
          </span>

          <Link
            to="/admin/login"
            lang={language}
            dir={direction}
          >
            {t(
              "site.footer.teamLogin"
            )}
          </Link>
        </div>
      </footer>
    </div>
  )
}