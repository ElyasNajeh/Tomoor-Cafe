import type { ReactNode } from "react"

export function SectionHeading({
  eyebrow,
  children,
  copy,
  light = false,
}: {
  eyebrow: string
  children: ReactNode
  copy?: string
  light?: boolean
}) {
  return (
    <div
      className={`site-section-heading${
        light ? " site-section-heading--light" : ""
      }`}
    >
      <span className="site-section-heading__eyebrow">
        {eyebrow}
      </span>

      <h2 className="site-section-heading__title">
        {children}
      </h2>

      {copy && (
        <p className="site-section-heading__copy">
          {copy}
        </p>
      )}
    </div>
  )
}