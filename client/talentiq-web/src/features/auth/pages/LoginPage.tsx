import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { toErrorMessage } from '@/lib/api'
import { isValidEmail } from '@/lib/validators'
import logoMark from '@/assets/logo.jpeg'

interface FormErrors {
  email?: string
  password?: string
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectForRole = (role: string) => {
    if (role === 'Candidate') navigate('/candidate/jobs')
    else if (role === 'Recruiter') navigate('/recruiter/jobs')
    else if (role === 'HiringManager') navigate('/hiring-manager/shortlist')
    else if (role === 'Admin') navigate('/admin/analytics')
    else navigate('/')
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!email.trim()) next.email = 'Email address is required.'
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'

    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.password) passwordRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const session = await login(email, password)
      toast.success(`Logged in as ${session.email} (${session.role})`)
      redirectForRole(session.role)
    } catch (err) {
      toast.error(toErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-configured Dev Credentials for quick testing
  const devLogins = [
    { email: 'candidate@talentiq.dev', password: 'Password123!', role: 'Candidate' },
    { email: 'recruiter@talentiq.dev', password: 'Password123!', role: 'Recruiter' },
    { email: 'manager@talentiq.dev', password: 'Password123!', role: 'HiringManager' },
    { email: 'admin@talentiq.dev', password: 'Password123!', role: 'Admin' },
  ]

  const handleDevLogin = async (cred: typeof devLogins[0]) => {
    setErrors({})
    setIsSubmitting(true)
    setEmail(cred.email)
    setPassword(cred.password)
    try {
      const session = await login(cred.email, cred.password)
      toast.success(`Dev Mode: Logged in as ${session.role}`)
      redirectForRole(session.role)
    } catch {
      toast.error('Dev account login failed. Make sure the API is running and seeded.')
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
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1 shadow-lg shadow-accent/25 ring-1 ring-accent/20 overflow-hidden">
              <img src={logoMark} alt="TalentIQ" className="h-full w-full object-cover rounded-xl" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Building Better Teams Together
            </span>
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-head">Welcome back</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your recruitment workspace.
          </p>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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

            <div>
              <Input
                ref={passwordRef}
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="••••••••"
                error={errors.password}
              />
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-semibold text-m2 hover:text-head transition-all">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-m2 hover:text-head transition-all">
              Register
            </Link>
          </div>

          {/* Dev bypass option for easy local testing */}
          <div className="mt-8 border-t border-line/65 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-3 text-center">
              Dev Mode Bypass Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              {devLogins.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleDevLogin(cred)}
                  disabled={isSubmitting}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-panel-2 hover:bg-panel border border-line text-text hover:text-head hover:border-m2/40 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-[10px] text-muted">{cred.role}</div>
                  <div className="truncate font-semibold">{cred.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer Link back to Landing Page */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-head transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
