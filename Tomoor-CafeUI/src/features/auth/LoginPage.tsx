import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { ApiError } from "@/shared/api/error"
import { useAuth } from "./AuthProvider"
import { AuthLoader } from "./AuthLoader"
import logo from "@/assets/logo.png"
import { Icon } from "@/shared/components/Icon"

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
      await login({
        email: email.trim().toLowerCase(),
        password,
      })

      navigate("/admin", { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to sign in. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthReady) {
    return (
      <AuthLoader
        fullPage
        label="Checking admin session"
      />
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="login-screen">
      <section
        className="login-panel"
        aria-labelledby="login-title"
      >
        <Link
          className="login-logo"
          to="/admin"
          aria-label="ETA Company dashboard"
        >
          <img
            src={logo}
            alt="ETA Company"
          />
        </Link>

        <div className="login-copy">
          <p>ETA Company</p>

          <h1 id="login-title">
            Admin Panel
          </h1>

          <span>
            Sign in to manage your store
          </span>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label
            className="form-field"
            htmlFor="email"
          >
            <span>Email</span>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              required
              disabled={isSubmitting}
            />
          </label>

          <label
            className="form-field"
            htmlFor="password"
          >
            <span>Password</span>

            <span className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((shown) => !shown)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <Icon
                  name={
                    showPassword
                      ? "eye"
                      : "eyeOff"
                  }
                />
              </button>
            </span>
          </label>

          {error && (
            <p
              className="login-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <AuthLoader
                compact
                label="Signing in"
              />
            )}

            {isSubmitting
              ? "Signing in"
              : "Sign in"}
          </button>
        </form>

        <p className="login-notice">
          Authorized ETA Company administrators only.
        </p>
      </section>
    </main>
  )
}