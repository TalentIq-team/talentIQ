import axios from 'axios'
import { env } from './env'

const TOKEN_KEY = 'talentiq.jwt'

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearStoredToken()
      // Dispatch custom event to let AuthContext clean up state
      window.dispatchEvent(new CustomEvent('talentiq-unauthorized'))
      
      // Redirect if not on public routes
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/** Normalises an Axios error into a readable message from the API's ProblemDetails payload. */
export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if ('errors' in data && data.errors && typeof data.errors === 'object') {
        const first = Object.values(data.errors)[0]
        if (Array.isArray(first) && first[0]) {
          return first[0]
        }
      }
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      if ('title' in data && typeof data.title === 'string') {
        return data.title
      }
    }
    return error.message
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}
