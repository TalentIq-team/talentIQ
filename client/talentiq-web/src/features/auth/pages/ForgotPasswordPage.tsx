import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { apiClient, toErrorMessage } from '@/lib/api'
import { isValidEmail, getPasswordError } from '@/lib/validators'
import logoMark from '@/assets/logo.jpeg'

const TOKEN_PATTERN = /^\d{6}$/

interface RequestErrors {
  email?: string
}

interface ResetErrors {
  token?: string
  newPassword?: string
  confirmPassword?: string
}

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast()
  const navigate = useNavigate()

  // Phase state: 'request' or 'reset'
  const [phase, setPhase] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const [requestErrors, setRequestErrors] = useState<RequestErrors>({})
  const [resetErrors, setResetErrors] = useState<ResetErrors>({})

  const validateRequest = (): boolean => {
    const next: RequestErrors = {}
    if (!email.trim()) next.email = 'Email address is required.'
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.'

    setRequestErrors(next)
    if (next.email) emailRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const validateReset = (): boolean => {
    const next: ResetErrors = {}
    if (!token) next.token = 'Verification code is required.'
    else if (!TOKEN_PATTERN.test(token)) next.token = 'Enter the 6-digit code.'

    const passwordError = getPasswordError(newPassword)
    if (passwordError) next.newPassword = passwordError

    if (!confirmPassword) next.confirmPassword = 'Please confirm your new password.'
    else if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match.'

    setResetErrors(next)
    if (next.token) tokenRef.current?.focus()
    else if (next.newPassword) newPasswordRef.current?.focus()
    else if (next.confirmPassword) confirmRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRequest()) return

    setIsSubmitting(true)
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email })
      toast.success('If your email is registered, you will receive a reset code.')
      setPhase('reset')
    } catch (err) {
      toast.error(toErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateReset()) return

    setIsSubmitting(true)
    try {
      const response = await apiClient.post('/api/v1/auth/reset-password', {
        email,
        token,
        newPassword,
      })
      toast.success(response.data?.message || 'Password reset successfully.')
      navigate('/login')
    } catch (err) {
      toast.error(toErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = () => {
    setToken('')
    setNewPassword('')
    setConfirmPassword('')
    setResetErrors({})
    setPhase('request')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8 bg-ink relative">
      {/* Top Left Back Navigation */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-head bg-surface/50 border border-line px-3.5 py-2 rounded-xl transition-all hover:bg-panel-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1 shadow-lg shadow-accent/25 ring-1 ring-accent/20">
              <img src={logoMark} alt="TalentIQ" className="h-full w-full object-contain" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Building Better Teams Together
            </span>
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-head">
            {phase === 'request' ? 'Reset your password' : 'Enter reset details'}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {phase === 'request'
              ? 'Enter your email address and we will send you a reset code.'
              : 'Enter the verification code sent to your email and your new password.'}
          </p>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl">
          {phase === 'request' ? (
            <form className="space-y-6" onSubmit={handleRequestReset} noValidate>
              <Input
                ref={emailRef}
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (requestErrors.email) setRequestErrors({})
                }}
                placeholder="you@company.com"
                error={requestErrors.email}
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword} noValidate>
              <Input
                label="Email Address"
                type="email"
                disabled
                readOnly
                value={email}
                placeholder="you@company.com"
                className="opacity-70 cursor-not-allowed"
              />

              <Input
                ref={tokenRef}
                label="Verification Code (6-digit)"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                  if (resetErrors.token) setResetErrors((prev) => ({ ...prev, token: undefined }))
                }}
                placeholder="123456"
                error={resetErrors.token}
              />

              <Input
                ref={newPasswordRef}
                label="New Password"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (resetErrors.newPassword) setResetErrors((prev) => ({ ...prev, newPassword: undefined }))
                }}
                placeholder="••••••••"
                error={resetErrors.newPassword}
              />

              <Input
                ref={confirmRef}
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (resetErrors.confirmPassword) setResetErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
                placeholder="••••••••"
                error={resetErrors.confirmPassword}
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
                Reset Password
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-semibold text-m2 hover:text-head transition-all cursor-pointer"
                >
                  Resend verification code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs">
            <span className="text-muted">Remembered your password? </span>
            <Link to="/login" className="font-semibold text-m2 hover:text-head transition-all">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage