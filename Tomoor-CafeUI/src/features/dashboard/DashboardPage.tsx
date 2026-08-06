import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/AuthProvider"
import { DashboardApi, type DashboardStats } from "@/features/dashboard/dashboard.api"
import { getRandomHadith, type Hadith } from "@/features/dashboard/hadith.api"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon, type IconName } from "@/shared/components/Icon"
import helloWaveIcon from "@/assets/hello-wave-icon.png"

const STAT_CARDS: Array<{ label: string; key: keyof DashboardStats; icon: IconName }> = [
  { label: "Products", key: "products", icon: "products" },
  { label: "Categories", key: "categories", icon: "categories" },
  { label: "Sliders", key: "sliders", icon: "sliders" },
]

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState("")
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [hadithFailed, setHadithFailed] = useState(false)

  useEffect(() => {
    DashboardApi.stats()
      .then(setStats)
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load dashboard")
      })
  }, [])

  useEffect(() => {
    getRandomHadith()
      .then(setHadith)
      .catch(() => setHadithFailed(true))
  }, [])

  const adminName = user?.email.split("@")[0] ?? "Admin"

  return (
    <section>
      <PageHeader
        eyebrow="Overview"
        title={<span className="welcome-title">Welcome Back, {adminName}<img src={helloWaveIcon} alt="" aria-hidden="true" /></span>}
        description="Manage your store from one place."
      />

      {error ? (
        <div className="error-state"><p>{error}</p></div>
      ) : (
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <article className={`stat-card stat-card--${card.key}`} key={card.key}>
              <span><Icon name={card.icon} /></span>
              <div><small>{card.label}</small><strong>{stats?.[card.key] ?? "—"}</strong></div>
            </article>
          ))}
        </div>
      )}

      <HadithCard hadith={hadith} failed={hadithFailed} />
    </section>
  )
}

function HadithCard({ hadith, failed }: { hadith: Hadith | null; failed: boolean }) {
  let content = <p>جارٍ تحميل الحديث…</p>

  if (hadith) {
    content = <><blockquote>{hadith.arabic}</blockquote>{hadith.source && <small>{hadith.source}</small>}</>
  } else if (failed) {
    content = <p>تعذّر تحميل الحديث اليوم. يمكنك متابعة إدارة النظام بشكل طبيعي.</p>
  }

  return <article className="hadith-card" dir="rtl"><span>حديث اليوم</span>{content}</article>
}
