import { apiRequest } from "@/shared/api/client"
import type { Admin, AdminPayload } from "./admins.types"

export type { Admin, AdminPayload } from "./admins.types"

export const AdminsApi = {
  list: () => apiRequest<Admin[]>("/admins/"),
  create: (data: AdminPayload) => apiRequest<Admin>("/admins/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<Admin>(`/admins/${id}`, { method: "DELETE" }),
}
