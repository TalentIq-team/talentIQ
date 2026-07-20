import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { apiClient, toErrorMessage } from '@/lib/api'
import logo from '@/assets/logo.jpeg'

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

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Email is required.')
      return
    }

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
    if (!token) {
      toast.error('Verification code is required.')
      return
    }
    if (!newPassword) {
      toast.error('New password is required.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8 bg-ink">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
         <img
  src={logo}
  alt="TalentIQ Logo"
  className="mx-auto h-14 w-14 rounded-2xl object-contain bg-white p-1 shadow-lg"
/>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-head">
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
            <form className="space-y-6" onSubmit={handleRequestReset}>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <Input
                label="Email Address"
                type="email"
                disabled
                value={email}
                placeholder="you@company.com"
                className="opacity-70 cursor-not-allowed"
              />

              <Input
                label="Verification Code (6-digit)"
                type="text"
                required
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456"
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
                Reset Password
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setPhase('request')}
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
