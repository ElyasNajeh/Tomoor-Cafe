import { useState } from "react"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { useAuth } from "@/features/auth/AuthProvider"
import { Icon, type IconName } from "@/shared/components/Icon"
import logo from "@/assets/logo.png"

const links: {
  to: string
  label: string
  icon: IconName
  end?: boolean
}[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: "dashboard",
    end: true,
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: "categories",
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: "products",
  },
  {
    to: "/admin/sliders",
    label: "Sliders",
    icon: "sliders",
  },
  {
    to: "/admin/admins",
    label: "Admins",
    icon: "admins",
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: "settings",
  },
]

export function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const displayName = user?.email.split("@")[0] ?? "admin"

  async function signOut() {
    await logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className={open ? "open" : ""}>
        <Link
          className="sidebar-brand"
          to="/admin"
          onClick={() => setOpen(false)}
          aria-label="ETA Company dashboard"
        >
          <span className="sidebar-logo">
            <img
              src={logo}
              alt=""
            />
          </span>

          <div>
            <strong>ETA Company</strong>
            <small>Admin Panel</small>
          </div>
        </Link>

        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <strong>{displayName}</strong>

          <button
            className="sidebar-signOut"
            title="Sign out"
            onClick={() => void signOut()}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {open && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="menu-button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <span>
            {links.find((link) =>
              link.end
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to),
            )?.label ?? "Admin Panel"}
          </span>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
