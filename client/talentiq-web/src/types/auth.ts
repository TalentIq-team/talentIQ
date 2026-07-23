export type UserRole = 'Candidate' | 'Recruiter' | 'HiringManager' | 'Admin'

export interface UserSession {
  userId: string
  email: string
  role: UserRole
  accessToken: string
  refreshToken: string
  expiresAt: string
  candidateProfileId?: string | null
}

export interface AuthState {
  user: {
    userId: string
    email: string
    role: UserRole
  } | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}