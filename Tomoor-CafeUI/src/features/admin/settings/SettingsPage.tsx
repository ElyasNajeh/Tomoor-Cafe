import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import coffeeIcon from "@/assets/coffe-icon1.png"
import datesIcon from "@/assets/dates-icoon.png"
import tomoorLogo from "@/assets/tomoor-images/web/logo-site.png"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { applyTheme, getInitialTheme, type Theme } from "@/shared/theme"
import { useI18n } from "@/localization/useI18n"

const THEMES = [
  { nameKey: "admin.pages.light", icon: "sun" as const, descriptionKey: "admin.pages.lightDescription", value: "light" as const },
  { nameKey: "admin.pages.dark", icon: "moon" as const, descriptionKey: "admin.pages.darkDescription", value: "dark" as const },
]

function getMenuUrl() {
  const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim()
  const baseUrl = configuredSiteUrl || window.location.origin
  const normalizedUrl = baseUrl.replace(/\/+$/, "")

  return normalizedUrl.endsWith("/menu") ? normalizedUrl : `${normalizedUrl}/menu`
}

export function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getInitialTheme)
  const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false)
  const { t } = useI18n()
  const menuUrl = getMenuUrl()

  function selectTheme(theme: Theme) {
    setSelectedTheme(theme)
    applyTheme(theme)
  }

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.settingsEyebrow")}
        icon="settings"
        title={t("admin.settings")}
        description={t("admin.pages.settingsDescription")}
      />
      <div className="settings-grid">
        <article className="settings-card appearance-card">
          <div className="settings-card__title">
            <span><Icon name="settings" /></span>
            <div><h2>{t("admin.pages.appearance")}</h2><p>{t("admin.pages.appearanceDescription")}</p></div>
          </div>
          <div className="appearance-options" role="radiogroup" aria-label={t("admin.pages.appearanceThemes")}>
            {THEMES.map((theme) => {
              const selected = selectedTheme === theme.value

              return (
                <label
                  className={`appearance-option appearance-option--${theme.value}${selected ? " selected" : ""}`}
                  key={theme.nameKey}
                >
                  <input
                    type="radio"
                    name="appearance-theme"
                    value={theme.value}
                    checked={selected}
                    onChange={() => selectTheme(theme.value)}
                  />
                  <span className="appearance-option__icon"><Icon name={theme.icon} size={30} /></span>
                  <strong>{t(theme.nameKey)}</strong>
                  <small>{t(theme.descriptionKey)}</small>
                  <em>{t(selected ? "admin.common.active" : "admin.pages.select")}</em>
                </label>
              )
            })}
          </div>
        </article>

        <article className="settings-card menu-qr-card">
          <div className="settings-card__title">
            <span><Icon name="menu" /></span>
            <div><h2>{t("admin.pages.menuQr")}</h2><p>{t("admin.pages.menuQrDescription")}</p></div>
          </div>
          <div className="menu-qr-card__body">
            <button className="button menu-qr-card__button" type="button" onClick={() => setIsQrPreviewOpen(true)}>
              <Icon name="menu" />
              {t("admin.pages.generatePrintMenuQr")}
            </button>
          </div>
        </article>
      </div>

      {isQrPreviewOpen && (
        <div className="dialog-backdrop menu-qr-preview-backdrop">
          <section className="form-dialog menu-qr-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-qr-preview-title">
            <div className="form-dialog__header">
              <div><span>{t("admin.pages.menuQr")}</span><h2 id="menu-qr-preview-title">{t("admin.pages.menuQrPreview")}</h2></div>
              <button type="button" aria-label={t("admin.forms.common.close")} onClick={() => setIsQrPreviewOpen(false)}><Icon name="close" /></button>
            </div>
            <div className="menu-qr-preview-stage">
              <div className="menu-qr-print-area">
                <MenuQrPaper
                  heading={t("admin.pages.tomoorMenuQrHeading")}
                  logoAlt={t("admin.pages.menuQrLogoAlt")}
                  menuUrl={menuUrl}
                  scanLabel={t("admin.pages.scanForMenu")}
                />
              </div>
            </div>
            <div className="form-actions menu-qr-dialog__actions">
              <button type="button" className="button button--ghost" onClick={() => setIsQrPreviewOpen(false)}>{t("admin.forms.common.close")}</button>
              <button type="button" className="button" onClick={() => window.print()}>{t("admin.pages.printMenuQr")}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

function MenuQrPaper({ heading, logoAlt, menuUrl, scanLabel }: { heading: string; logoAlt: string; menuUrl: string; scanLabel: string }) {
  return (
    <article className="menu-qr-paper">
      <img className="menu-qr-paper__logo" src={tomoorLogo} alt={logoAlt} />
      <h3>{heading}</h3>
      <div className="menu-qr-paper__code">
        <QRCodeSVG value={menuUrl} size={220} level="M" fgColor="#2a1512" bgColor="transparent" includeMargin />
      </div>
      <p>{scanLabel}</p>
      <div className="menu-qr-paper__ornament" aria-hidden="true">
        <img src={coffeeIcon} alt="" />
        <span />
        <img src={datesIcon} alt="" />
      </div>
    </article>
  )
}
