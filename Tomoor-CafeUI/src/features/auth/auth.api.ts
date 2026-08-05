import { apiRequest } from "@/shared/api/client"
import type {
  AdminUser,
  LoginData,
} from "./types"

export class AuthApi {
  static login(data: LoginData) {
    return apiRequest<void>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuthRefresh: true,
    })
  }

  static getMe() {
    return apiRequest<AdminUser>("/auth/me")
  }

  static logout() {
    return apiRequest<void>("/auth/logout", {
      method: "POST",
    })
  }
}