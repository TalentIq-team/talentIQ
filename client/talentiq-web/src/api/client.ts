import axios from 'axios'

const TOKEN_STORAGE_KEY = 'talentiq.jwt'

/**
 * Axios instance for the TalentIQ API. Base URL comes from VITE_API_BASE_URL
 * (defaults to the local API). A request interceptor attaches the JWT bearer
 * token issued by the Identity module.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7001',
  headers: { 'Content-Type': 'application/json' },
})

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Normalises an Axios error into a readable message from the API's ProblemDetails payload. */
export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { title?: string; errors?: Record<string, string[]> }
      | undefined
    if (data?.errors) {
      const first = Object.values(data.errors)[0]?.[0]
      if (first) return first
    }
    if (data?.title) return data.title
    return error.message
  }
  return 'An unexpected error occurred.'
}
