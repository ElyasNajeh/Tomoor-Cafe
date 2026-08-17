import logo from "@/assets/tomoor-images/web/logo-site.png"
import coffee from "@/assets/tomoor-images/coffe.jpg"
import drinks from "@/assets/tomoor-images/alot_of_drinks.jpg"
import products from "@/assets/tomoor-images/web/some-products.jpg"
import barista from "@/assets/tomoor-images/web/worker-making-coffee.jpg"
import member from "@/assets/tomoor-images/Member.jpg"
import retail from "@/assets/tomoor-images/Stuff.jpg"

export const photography = {
  logo,
  hero: coffee,
  story: barista,
  atmosphere: products,
  member,
  retail,
  coffee,
  cold: drinks,
  pastry: retail,
  dessert: products,
} as const

export function resolveSiteImage(path: string) {
  if (path.startsWith("http") || path.startsWith("data:") || path.includes("/assets/")) return path
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
  return `${apiUrl}${path}`
}

export const siteDetails = {
  address: "West Bank, Ramallah",
  addressDetail: "ICON Mall · Fifth floor",
  openingDays: "Friday — Saturday",
  openingTime: "7:00 AM — 11:00 PM",
  hours: "Friday — Saturday · 7:00 AM — 11:00 PM",
  phoneDisplay: "+970 59 000 0000",
  phone: "+970590000000",
  email: "hello@tomoor.cafe",
  mapsUrl: "https://www.google.com/maps/place/Icon+mall/@31.9362665,35.1923851,18.4z/data=!4m12!1m5!3m4!2zMzHCsDU0JzExLjAiTiAzNcKwMTEnNDIuOCJF!8m2!3d31.903055!4d35.195225!3m5!1s0x151d2bebd24bb9e3:0x64a33dcba83da8e0!8m2!3d31.9363385!4d35.1926023!16s%2Fg%2F11sv1d1x_l?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D",
  mapEmbedUrl: "https://www.google.com/maps?q=31.9362665,35.1923851&z=17&output=embed",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/profile.php?id=100080025204845",
  tiktok: "https://www.tiktok.com/",
} as const
