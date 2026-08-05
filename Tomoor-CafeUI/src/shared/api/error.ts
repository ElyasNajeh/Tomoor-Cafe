export class ApiError extends Error {
  status: number
  data: unknown

  constructor(
    status: number,
    message: string,
    data: unknown = null,
  ) {
    super(message)

    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong",
): string {
  if (typeof data === "string" && data.trim()) {
    return data
  }

  if (typeof data !== "object" || data === null) {
    return fallback
  }

  if (
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail
  }

  if (
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message
  }

  if (
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error
  }

  return fallback
}