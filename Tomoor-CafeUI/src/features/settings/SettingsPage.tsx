import { useState } from "react"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { applyTheme, getInitialTheme, type Theme } from "@/shared/theme"

const THEMES = [
  { name: "Light", icon: "sun" as const, description: "A bright, clean workspace", value: "light" as const },
  { name: "Dark", icon: "moon" as const, description: "A calm, low-light workspace", value: "dark" as const },
]

export function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getInitialTheme)

  function selectTheme(theme: Theme) {
    setSelectedTheme(theme)
    applyTheme(theme)
  }

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
            <div><h2>Appearance</h2><p>Choose how the admin workspace looks on this device.</p></div>
          </div>
          <div className="appearance-options" role="radiogroup" aria-label="Appearance themes">
            {THEMES.map((theme) => {
              const selected = selectedTheme === theme.value

              return (
                <label
                  className={`appearance-option appearance-option--${theme.value}${selected ? " selected" : ""}`}
                  key={theme.name}
                >
                  <input
                    type="radio"
                    name="appearance-theme"
                    value={theme.value}
                    checked={selected}
                    onChange={() => selectTheme(theme.value)}
                  />
                  <span className="appearance-option__icon"><Icon name={theme.icon} size={30} /></span>
                  <strong>{theme.name}</strong>
                  <small>{theme.description}</small>
                  <em>{selected ? "Active" : "Select"}</em>
                </label>
              )
            })}
          </div>
        </article>
      </div>
    </section>
  )
}
