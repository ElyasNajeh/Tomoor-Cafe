import { apiRequest } from "@/shared/api/client"
import type { Slider, SliderPayload } from "./sliders.types"

export const SlidersApi = {
  list: () => apiRequest<Slider[]>("/sliders/"),
  create(data: SliderPayload) {
    return apiRequest<Slider>("/sliders/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update(id: number, data: SliderPayload) {
    return apiRequest<Slider>(`/sliders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  delete: (id: number) => apiRequest<void>(`/sliders/${id}`, { method: "DELETE" }),
  toggle: (id: number) => apiRequest<Slider>(`/sliders/${id}/toggle-status`, { method: "PATCH" }),
  async upload(file: File) {
    const body = new FormData()
    body.append("file", file)

    const result = await apiRequest<{ url: string }>("/sliders/upload-image", {
      method: "POST",
      body,
    })

    return result.url
  },
}
