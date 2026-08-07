import { photography } from "../../siteContent"
import workerImage from "@/assets/tomoor-images/worker_image.png"
import { SectionHeading } from "./SectionHeading"
import { useI18n } from "@/localization/useI18n"

export function StorySection() {
  const { direction, language, t } = useI18n()
  return (
    <section className="site-story" id="story">
      <div className="site-story__divider" aria-hidden="true">
        <span />
        <img src={photography.logo} alt="" />
        <span />
      </div>
      <div className="site-container site-story__grid">
        <div className="site-story__visual">
          <img src={workerImage} alt={t("site.home.baristaAlt")} />
          <div className="site-story__stamp"><span lang={language} dir={direction}>{t("site.home.established")}</span><strong>2024</strong><span lang={language} dir={direction}>{t("site.details.city")}</span></div>
        </div>
        <div className="site-story__copy">
          <span className="site-story__eyebrow" lang={language} dir={direction}>{t("site.home.storyEyebrow")}</span>
          <SectionHeading eyebrow="">Tomoor<br /><em>Café</em></SectionHeading>
          <p className="site-story__lead" lang={language} dir={direction}>{t("site.home.storyLead")}</p>
        </div>
      </div>
    </section>
  )
}
