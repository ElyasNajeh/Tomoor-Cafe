// src/app/router.tsx

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom"

import { ProtectedRoute } from "@/features/admin/auth/ProtectedRoute"
import { LoginPage } from "@/features/admin/auth/LoginPage"

import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/features/admin/dashboard/DashboardPage"
import { CategoriesPage } from "@/features/admin/categories/CategoriesPage"
import { ProductsPage } from "@/features/admin/products/ProductsPage"
import { SlidersPage } from "@/features/admin/sliders/SlidersPage"
import { AdminsPage } from "@/features/admin/admins/AdminsPage"
import { SettingsPage } from "@/features/admin/settings/SettingsPage"
import { SiteLayout } from "@/layouts/SiteLayout"
import { HomePage } from "@/features/site/home/HomePage"
import { MenuPage } from "@/features/site/menu/MenuPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "menu", element: <MenuPage /> },
    ],
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
