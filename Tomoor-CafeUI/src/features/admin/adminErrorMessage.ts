import { ApiError } from "@/shared/api/error"

type Translate = (key: string) => string

const API_MESSAGE_KEYS: Record<string, string> = {
  "invalid email or password": "admin.feedback.errors.invalidCredentials",
  "email already exists": "admin.feedback.errors.emailExists",
  "category already exists": "admin.feedback.errors.categoryExists",
  "product already exists": "admin.feedback.errors.productExists",
  "slider already exists": "admin.feedback.errors.sliderExists",
  "category cannot be deleted while it contains products": "admin.feedback.errors.categoryHasProducts",
  "activate the category before activating this product": "admin.feedback.errors.activateCategoryFirst",
  "display order is already used by a visible slider": "admin.feedback.errors.displayOrderUsed",
  "this slider cannot be shown because its display order is already used by a visible slider": "admin.feedback.errors.displayOrderUsed",
  "you cannot delete your own admin account": "admin.feedback.errors.cannotDeleteSelf",
  "this field is required": "admin.feedback.errors.requiredField",
  "prices must be greater than zero": "admin.feedback.errors.priceGreaterThanZero",
  "drink products require at least one size price": "admin.feedback.errors.drinkPriceRequired",
}

export function getAdminErrorMessage(error: unknown, t: Translate, fallbackKey: string): string {
  if (!(error instanceof ApiError)) {
    return t("admin.feedback.errors.network")
  }

  if (error.status === 401) return t("admin.feedback.errors.sessionExpired")
  if (error.status === 403) return t("admin.feedback.errors.forbidden")

  const messageKey = API_MESSAGE_KEYS[error.message.trim().toLowerCase()]
  return messageKey ? t(messageKey) : t(fallbackKey)
}
