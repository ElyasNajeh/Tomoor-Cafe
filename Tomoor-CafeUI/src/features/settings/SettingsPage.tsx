import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"

const THEMES = [
  { name: "Light", icon: "sun" as const, description: "A bright, clean workspace", className: "light" },
  { name: "Dark", icon: "moon" as const, description: "A calm, low-light workspace", className: "dark" },
]

export function SettingsPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Preferences"
        icon="settings"
        title="Settings"
        description="Personalize how the ETA Company admin panel looks."
      />
      <div className="settings-grid settings-grid--single">
        <article className="settings-card appearance-card">
          <div className="settings-card__title">
            <span><Icon name="settings" /></span>
            <div><h2>Appearance</h2><p>Theme selection is coming soon.</p></div>
          </div>
          <div className="appearance-options" aria-label="Appearance themes">
            {THEMES.map((theme) => (
              <div className={`appearance-option appearance-option--${theme.className}`} aria-disabled="true" key={theme.name}>
                <span className="appearance-option__icon"><Icon name={theme.icon} size={30} /></span>
                <strong>{theme.name}</strong>
                <small>{theme.description}</small>
                <em>Coming soon</em>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
