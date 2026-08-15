import { SiteIcon } from "../../SiteIcon"
import { siteDetails } from "../../siteContent"
import { useI18n } from "@/localization/useI18n"

const socials = [
  ["Instagram", "instagram", siteDetails.instagram],
  ["Facebook", "facebook", siteDetails.facebook],
  ["TikTok", "tiktok", siteDetails.tiktok],
] as const

export function ConnectSection() {
  const { direction, language, t } = useI18n()
  return (
    <section className="site-contact" id="contact">
      <div className="site-container">
        <h2 lang={language} dir={direction}>{t("site.home.contact")}</h2>
        <div className="site-contact__content">
          <div className="site-contact__links">
            <a href={`tel:${siteDetails.phone}`}><span><SiteIcon name="phone" /></span><strong>{siteDetails.phoneDisplay}</strong></a>
            <a href={`mailto:${siteDetails.email}`}><span><SiteIcon name="email" /></span><strong>{siteDetails.email}</strong></a>
            <a href={`https://wa.me/${siteDetails.phone.replace("+", "")}`} target="_blank" rel="noreferrer"><span><SiteIcon name="whatsapp" /></span><strong>WhatsApp</strong></a>
          </div>
          <div className="site-contact__socials">
            {socials.map(([name, icon, href]) => <a key={name} href={href} target="_blank" rel="noreferrer"><SiteIcon name={icon} /><span>{name}</span></a>)}
          </div>
        </div>
      </div>
    </section>
  )
}
