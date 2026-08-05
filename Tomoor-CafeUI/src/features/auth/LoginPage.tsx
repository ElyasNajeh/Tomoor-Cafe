import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { ApiError } from "@/shared/api/error"
import { useAuth } from "./AuthProvider"
import { AuthLoader } from "./AuthLoader"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated, isAuthReady } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError("")
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate("/admin", { replace: true })
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to sign in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthReady) return <AuthLoader fullPage label="Checking admin session" />
  if (isAuthenticated) return <Navigate to="/admin" replace />

  return (
    <main className="login-screen">
      <div className="login-orbit" aria-hidden="true" />
      <section className="login-panel" aria-labelledby="login-title">
        <div className="admin-wordmark" aria-label="Tomoor Cafe Admin">
          <span className="admin-wordmark__monogram" aria-hidden="true">T</span>
          <span><strong>Tomoor Cafe</strong><small>Administration</small></span>
        </div>
        <div className="login-copy">
          <p>Private management portal</p>
          <h1 id="login-title">Welcome back</h1>
          <span>Sign in to manage the cafe menu and content.</span>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="email"><span>Email address</span>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required disabled={isSubmitting} />
          </label>
          <label className="form-field" htmlFor="password"><span>Password</span>
            <span className="password-field">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={isSubmitting} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
            </span>
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting && <AuthLoader compact label="Signing in" />}
            {isSubmitting ? "Signing in" : "Sign in"}
          </button>
        </form>
        <p className="login-notice">Authorized Tomoor Cafe administrators only.</p>
      </section>
    </main>
  )
}
