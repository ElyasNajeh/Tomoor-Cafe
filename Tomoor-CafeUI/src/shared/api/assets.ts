export function getAssetUrl(path: string) {
  if (path.startsWith("http")) {
    return path
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
  return `${apiUrl}${path}`
}
