type AuthLoaderProps = { fullPage?: boolean; compact?: boolean; label?: string }

export function AuthLoader({ fullPage = false, compact = false, label = "Loading" }: AuthLoaderProps) {
  const loader = (
    <span className={`auth-loader${compact ? " auth-loader--compact" : ""}`} role="status" aria-label={label}>
      <span className="auth-loader__ring" aria-hidden="true" />
      {!compact && <span className="auth-loader__mark" aria-hidden="true">T</span>}
    </span>
  )
  return fullPage ? <main className="auth-loader-page">{loader}</main> : loader
}
