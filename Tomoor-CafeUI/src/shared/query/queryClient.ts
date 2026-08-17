import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 1,
    },
  },
})

export const queryKeys = {
  categories: ["categories"] as const,
  products: ["products"] as const,
  sliders: ["sliders"] as const,
  branches: ["branches"] as const,
  settings: ["settings"] as const,
  admins: ["admins"] as const,
  dashboardStats: ["dashboard", "stats"] as const,
}
