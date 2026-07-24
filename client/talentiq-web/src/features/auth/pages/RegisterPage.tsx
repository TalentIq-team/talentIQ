import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { toErrorMessage } from '@/lib/api'
import { isValidEmail, getPasswordError } from '@/lib/validators'
import logoMark from '@/assets/logo.jpeg'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!email.trim()) next.email = 'Email address is required.'
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.'

    const passwordError = getPasswordError(password)
    if (passwordError) next.password = passwordError

    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.'

    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()
    else if (next.confirmPassword) confirmRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register(email, password)
      toast.success('Registration successful. Please sign in to continue.')
      navigate('/login')
    } catch (err) {
      toast.error(toErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
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
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-head">Create your account</h2>
          <p className="mt-2 text-sm text-muted">
            Register to start applying for positions.
          </p>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              ref={emailRef}
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="you@company.com"
              error={errors.email}
            />

            <Input
              ref={passwordRef}
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              placeholder="••••••••"
              error={errors.password}
            />
            {!errors.password && (
              <p className="text-xs text-muted -mt-3">Use at least 8 characters.</p>
            )}

            <Input
              ref={confirmRef}
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              Get Started
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="font-semibold text-m2 hover:text-head transition-all">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
export default RegisterPage