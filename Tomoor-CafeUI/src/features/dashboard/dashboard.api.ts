import { apiRequest } from "@/shared/api/client"
export type DashboardStats = { categories: number; products: number; sliders: number }
export const DashboardApi = { stats: () => apiRequest<DashboardStats>("/dashboard/stats") }
