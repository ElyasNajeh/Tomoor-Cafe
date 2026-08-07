import type { ReactNode } from "react"

export function SectionHeading({ eyebrow, children, copy, light = false }: { eyebrow: string; children: ReactNode; copy?: string; light?: boolean }) {
  return (
    <div className={`site-section-heading${light ? " site-section-heading--light" : ""}`}>
      <span>{eyebrow}</span>
      <h2>{children}</h2>
      {copy && <p>{copy}</p>}
    </div>
  )
}
