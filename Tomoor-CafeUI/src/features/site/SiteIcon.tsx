import type { SVGProps } from "react"

type IconName = "arrow" | "clock" | "close" | "email" | "facebook" | "instagram" | "location" | "menu" | "phone" | "tiktok" | "whatsapp"

const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z"/>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2c-3.5-1.5-6.5-4.5-8-8l2-2-2-4Z"/>,
  tiktok: <path d="M15 4c.7 2 2 3.3 4 4v4c-1.5 0-2.8-.4-4-1.2V16a6 6 0 1 1-6-6h1v4H9a2 2 0 1 0 2 2V3h4v1Z"/>,
  whatsapp: <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2 2 3.5 4 4l1.2-1 2 1.2c-.5 2-2 2.3-3.3 2-3-.7-5.7-3.4-6.4-6.4-.3-1.3 0-2.8 2-3.3L9.7 7 9 8.5Z"/></>,
}

export function SiteIcon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const className = [props.className, name === "arrow" ? "directional-arrow" : ""].filter(Boolean).join(" ")
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} className={className || undefined}>{paths[name]}</svg>
}
