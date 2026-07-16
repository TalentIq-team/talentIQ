import React, { createContext, useState, useEffect } from 'react'
import { apiClient, getStoredToken, setStoredToken, clearStoredToken } from '@/lib/api'
import type { UserRole, UserSession } from '@/types/auth'

export interface AuthContextType {
  user: {
    userId: string
    email: string
    role: UserRole
  } | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<UserSession>
  register: (email: string, password: string) => Promise<UserSession>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ userId: string; email: string; role: UserRole } | null>(null)
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [isLoading, setIsLoading] = useState(true)

  const handleUnauthorized = () => {
    setUser(null)
    setToken(null)
    clearStoredToken()
    localStorage.removeItem('talentiq.refreshToken')
    localStorage.removeItem('talentiq.user')
  }

  useEffect(() => {
    // Initialise auth state from storage
    const storedToken = getStoredToken()
    const storedUser = localStorage.getItem('talentiq.user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        handleUnauthorized()
      }
    }
    
    setIsLoading(false)

    // Listen for axios 401 interceptor notifications
    window.addEventListener('talentiq-unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('talentiq-unauthorized', handleUnauthorized)
    }
  }, [])

  const saveSession = (session: UserSession) => {
    const userData = {
      userId: session.userId,
      email: session.email,
      role: session.role,
    }
    
    setUser(userData)
    setToken(session.accessToken)
    setStoredToken(session.accessToken)
    localStorage.setItem('talentiq.refreshToken', session.refreshToken)
    localStorage.setItem('talentiq.user', JSON.stringify(userData))
  }

  const login = async (email: string, password: string): Promise<UserSession> => {
    const { data } = await apiClient.post<UserSession>('/api/v1/auth/login', { email, password })
    saveSession(data)
    return data
  }

  const register = async (email: string, password: string): Promise<UserSession> => {
    const { data } = await apiClient.post<UserSession>('/api/v1/auth/register', { email, password })
    saveSession(data)
    return data
  }

  const logout = async () => {
    const rt = localStorage.getItem('talentiq.refreshToken')
    if (rt) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refreshToken: rt })
      } catch {
        // Continue logout even if API call fails
      }
    }
    handleUnauthorized()
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
