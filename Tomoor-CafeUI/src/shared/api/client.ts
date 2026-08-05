// src/shared/api/client.ts

import {
  ApiError,
  getApiErrorMessage,
} from "./error"

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export type ApiRequestOptions = RequestInit & {
  /**
   * Prevent this request from trying to refresh
   * when it gets a 401.
   */
  skipAuthRefresh?: boolean
}

/**
 * Only ONE refresh request should exist at a time.
 *
 * If 5 requests all receive 401 simultaneously,
 * they will all wait for the same refresh request.
 */
let refreshPromise: Promise<boolean> | null = null

function createHeaders(options: RequestInit): Headers {
  const headers = new Headers(options.headers)

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData

  if (
    options.body &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  return headers
}


async function rawRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,

    credentials: "include",

    headers: createHeaders(options),
  })
}


async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}


async function createApiError(
  response: Response,
): Promise<ApiError> {
  const data = await readResponseBody(response)

  const message = getApiErrorMessage(
    data,
    response.statusText ||
      `Request failed with status ${response.status}`,
  )

  return new ApiError(
    response.status,
    message,
    data,
  )
}


async function refreshAccessToken(): Promise<boolean> {
  /**
   * Someone else is already refreshing.
   *
   * Reuse their Promise instead of creating
   * another refresh request.
   */
  if (refreshPromise) {
    return refreshPromise
  }

  // we do a raw request after refreshing, so we dont go on infinite refreshing
  refreshPromise = (async () => {
    const response = await rawRequest(
      "/auth/refresh",
      {
        method: "POST",
      },
    )

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return false
    }

    if (!response.ok) {
      throw await createApiError(response)
    }

    return true
  })()

  try {
    return await refreshPromise
  } finally {
    /**
     * Once refresh finishes,
     * allow a future refresh request.
     */
    refreshPromise = null
  }
}


export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    skipAuthRefresh = false,
    ...fetchOptions
  } = options


  let response = await rawRequest(
    path,
    fetchOptions,
  )

  /**
   * Login and refresh should NEVER trigger
   * automatic refresh behavior.
   */
  const isAuthInfrastructureRequest =
    path === "/auth/login" ||
    path === "/auth/refresh"

  const shouldTryRefresh =
    response.status === 401 &&
    !skipAuthRefresh &&
    !isAuthInfrastructureRequest


  if (shouldTryRefresh) {
    const refreshed =
      await refreshAccessToken()

    if (refreshed) {
      response = await rawRequest(
        path,
        fetchOptions,
      )
    }
  }


  if (!response.ok) {
    throw await createApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data =
    await readResponseBody(response)

  return data as T
}