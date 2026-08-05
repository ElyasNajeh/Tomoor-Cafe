// src/app/router.tsx

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom"

import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { LoginPage } from "@/features/auth/LoginPage"

import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/features/admin/DashboardPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <main className="public-placeholder"><h1>Tomoor Cafe</h1><p>Our public cafe experience is coming soon.</p></main>,
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
    ],
  },
])
