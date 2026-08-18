import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/admin/auth/AuthProvider"
import {
  DashboardApi,
  type DashboardStats,
} from "@/features/admin/dashboard/dashboard.api"

import {
  getRandomHadith,
  type Hadith,
} from "@/features/admin/dashboard/hadith.api"

import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon, type IconName } from "@/shared/components/Icon"
import { queryKeys } from "@/shared/query/queryClient"
import helloWaveIcon from "@/assets/hello-wave-icon.png"
import { useI18n } from "@/localization/useI18n"

const STAT_CARDS: Array<{
  labelKey: string
  key: keyof DashboardStats
  icon: IconName
}> = [
  {
    labelKey: "admin.products",
    key: "products",
    icon: "products",
  },
  {
    labelKey: "admin.categories",
    key: "categories",
    icon: "categories",
  },
  {
    labelKey: "admin.sliders",
    key: "sliders",
    icon: "sliders",
  },
]

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: DashboardApi.stats,
  })
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [hadithFailed, setHadithFailed] = useState(false)

  useEffect(() => {
    getRandomHadith()
      .then(setHadith)
      .catch(() => {
        setHadithFailed(true)
      })
  }, [])

  const adminName = user?.email.split("@")[0] ?? "Admin"
  const error = statsQuery.error ? t("admin.pages.dashboardError") : ""

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.dashboardEyebrow")}
        title={
          <span className="welcome-title">
            {t("admin.pages.welcome", { name: adminName })}
            <img
              src={helloWaveIcon}
              alt=""
              aria-hidden="true"
            />
          </span>
        }
        description={t("admin.pages.dashboardDescription")}
      />

      {error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="button button--secondary" onClick={() => void statsQuery.refetch()}>
            {t("admin.common.tryAgain")}
          </button>
        </div>
      ) : (
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <article
              className={`stat-card stat-card--${card.key}`}
              key={card.key}
            >
              <span>
                <Icon name={card.icon} />
              </span>

              <div>
                <small>{t(card.labelKey)}</small>
                <strong>{statsQuery.data?.[card.key] ?? "—"}</strong>
              </div>
            </article>
          ))}
        </div>
      )}

      <HadithCard
        hadith={hadith}
        failed={hadithFailed}
      />
    </section>
  )
}

function HadithCard({
  hadith,
  failed,
}: {
  hadith: Hadith | null
  failed: boolean
}) {
  const { t, language } = useI18n()
  let content = <p>{t("admin.pages.hadithLoading")}</p>

  if (hadith) {
    content = (
      <>
        <blockquote>{hadith.arabic}</blockquote>
        {hadith.source && <small>{hadith.source}</small>}
      </>
    )
  } else if (failed) {
    content = (
      <p>
        {t("admin.pages.hadithUnavailable")}
      </p>
    )
  }

  return (
    <article
      className="hadith-card"
      dir="rtl"
      lang={language}
    >
      <span>{t("admin.pages.hadithTitle")}</span>
      {content}
    </article>
  )
}
