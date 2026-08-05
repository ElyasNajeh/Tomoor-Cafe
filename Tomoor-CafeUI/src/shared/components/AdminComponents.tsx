import { useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { getAssetUrl } from "@/shared/api/assets"
import { Icon, type IconName } from "./Icon"

export function PageHeader({ eyebrow, title, description, actions, icon }: { eyebrow?: string; title: ReactNode; description?: string; actions?: ReactNode; icon?: IconName }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1 className={icon ? "page-title-with-icon" : undefined}>{icon && <span className="page-title-icon"><Icon name={icon} size={30} /></span>}{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span><Icon name="store" size={30} /></span>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  )
}

type LoadableContentProps = {
  loading: boolean
  loadingMessage: string
  error: string
  onRetry?: () => void
  children: ReactNode
}

export function LoadableContent(props: LoadableContentProps) {
  if (props.loading) {
    return <div className="loading-panel">{props.loadingMessage}</div>
  }

  if (props.error) {
    return (
      <div className="error-state">
        <p>{props.error}</p>
        {props.onRetry && (
          <button className="button button--secondary" onClick={props.onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }

  return props.children
}

export function StatusBadge({ active }: { active: boolean }) {
  const className = active ? "status-badge--active" : "status-badge--hidden"

  return (
    <span className={`status-badge ${className}`}>
      <i />
      {active ? "Active" : "Hidden"}
    </span>
  )
}

export function Pagination({ page, totalPages, totalItems, onChange }: { page: number; totalPages: number; totalItems: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((value) => (
      value === 1 || value === totalPages || Math.abs(value - page) <= 1
    ))

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__total">{totalItems} items</span>
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      <div className="pagination__pages">
        {pages.map((value, index) => (
          <span key={value}>
            {index > 0 && value - pages[index - 1] > 1 && <i>…</i>}
            <button
              className={value === page ? "active" : ""}
              aria-current={value === page ? "page" : undefined}
              onClick={() => onChange(value)}
            >
              {value}
            </button>
          </span>
        ))}
      </div>
      <strong>Page {page} of {totalPages}</strong>
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  )
}

export function ImageUpload({ value, onChange, upload, disabled }: { value: string; onChange: (url: string) => void; upload: (file: File) => Promise<string>; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setError("")
    setUploading(true)
    try {
      onChange(await upload(file))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image upload failed")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }
  return <div className="image-upload">
    <div className="image-upload__preview">{value ? <img src={getAssetUrl(value)} alt="Upload preview" /> : <span>Image preview</span>}</div>
    <div>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => void select(event)}
      />
      <button
        className="button button--secondary"
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : value ? "Replace image" : "Choose image"}
      </button>
      <small>JPEG, PNG, WebP or GIF. Maximum 5 MB.</small>
      {error && <p className="field-error">{error}</p>}
    </div>
  </div>
}
