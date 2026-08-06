// src/app/router.tsx

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom"

import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { LoginPage } from "@/features/auth/LoginPage"

import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { CategoriesPage } from "@/features/categories/CategoriesPage"
import { ProductsPage } from "@/features/products/ProductsPage"
import { SlidersPage } from "@/features/sliders/SlidersPage"
import { AdminsPage } from "@/features/admins/AdminsPage"
import { SettingsPage } from "@/features/settings/SettingsPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <main className="public-placeholder"><h1>ETA Company</h1><p>Our public experience is coming soon.</p></main>,
  },
  {
    path: "/login",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      { path: "categories", element: <CategoriesPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "sliders", element: <SlidersPage /> },
      { path: "admins", element: <AdminsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
])
