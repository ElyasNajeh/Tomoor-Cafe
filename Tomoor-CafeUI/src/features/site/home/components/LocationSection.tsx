import { SiteIcon } from "../../SiteIcon"
import shopEntrance from "@/assets/tomoor-images/shop_entrance.png"
import { siteDetails } from "../../siteContent"
import { SectionHeading } from "./SectionHeading"
import { useI18n } from "@/localization/useI18n"

export function LocationSection() {
  const { direction, language, t } = useI18n()
  return (
    <section className="site-location" id="visit">
      <img className="site-location__background" src={shopEntrance} alt="" />
      <div className="site-location__overlay" />
      <div className="site-container">
        <SectionHeading eyebrow=""><span lang={language} dir={direction}>{t("site.home.visit")}</span></SectionHeading>
        <div className="site-location__grid">
          <div className="site-location__details">
            <div><SiteIcon name="location" /><span><small lang={language} dir={direction}>{t("site.home.address")}</small><strong lang={language} dir={direction}>{t("site.details.address")}</strong><em lang={language} dir={direction}>{t("site.details.addressDetail")}</em></span></div>
            <div><SiteIcon name="clock" /><span><small lang={language} dir={direction}>{t("site.home.openingHours")}</small><strong lang={language} dir={direction}>{t("site.details.hours")}</strong></span></div>
            <div><SiteIcon name="phone" /><span><small lang={language} dir={direction}>{t("site.home.callAhead")}</small><a href={`tel:${siteDetails.phone}`}>{siteDetails.phoneDisplay}</a></span></div>
          </div>
          <div className="site-map">
            <iframe
              title={t("site.home.mapTitle")}
              src={siteDetails.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a className="site-map__link" href={siteDetails.mapsUrl} target="_blank" rel="noreferrer" aria-label={t("site.home.openMapLabel")}>
              <span className="site-map__cta"><span lang={language} dir={direction}>{t("site.home.openMap")}</span><SiteIcon name="arrow" /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
