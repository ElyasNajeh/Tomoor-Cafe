import { apiRequest } from "@/shared/api/client"
import type { Slider } from "./slider.types"

export const sliderApi = {
  list: () => apiRequest<Slider[]>("/sliders/"),
  listActive: () => apiRequest<Slider[]>("/sliders/activesliders"),
}
