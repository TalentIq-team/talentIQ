import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { toErrorMessage } from '@/lib/api'
import logo from '@/assets/logo.jpeg'
export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const session = await login(email, password)

      toast.success(`Logged in as ${session.email} (${session.role})`)

      if (session.role === 'Candidate') navigate('/candidate/jobs')
      else if (session.role === 'Recruiter') navigate('/recruiter/jobs')
      else if (session.role === 'HiringManager') navigate('/hiring-manager/shortlist')
      else if (session.role === 'Admin') navigate('/admin/analytics')
      else navigate('/')
    } catch (err) {
      toast.error(toErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const devLogins = [
    {
      email: 'candidate@talentiq.dev',
      password: 'Password123!',
      role: 'Candidate',
    },
    {
      email: 'recruiter@talentiq.dev',
      password: 'Password123!',
      role: 'Recruiter',
    },
    {
      email: 'manager@talentiq.dev',
      password: 'Password123!',
      role: 'HiringManager',
    },
    {
      email: 'admin@talentiq.dev',
      password: 'Password123!',
      role: 'Admin',
    },
  ]

  const handleDevLogin = async (cred: (typeof devLogins)[0]) => {
    setIsSubmitting(true)

    try {
      const session = await login(cred.email, cred.password)

      toast.success(`Dev Mode: Logged in as ${session.role}`)

      if (session.role === 'Candidate') navigate('/candidate/jobs')
      else if (session.role === 'Recruiter') navigate('/recruiter/jobs')
      else if (session.role === 'HiringManager') navigate('/hiring-manager/shortlist')
      else if (session.role === 'Admin') navigate('/admin/analytics')
    } catch {
      toast.error(
        'Dev account login failed. Make sure the API is running and seeded.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src={logo}
            alt="TalentIQ"
            className="mx-auto h-14 w-14 rounded-2xl"
         />

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-head">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-muted">
            Sign in to access your recruitment workspace.
          </p>
        </div>

        <Card
          variant="glass"
          className="border border-line/60 p-8 shadow-2xl backdrop-blur-xl"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <div className="flex justify-end -mt-3">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-m2 transition-all hover:text-head"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted">
              Don't have an account?{' '}
            </span>

            <Link
              to="/register"
              className="font-semibold text-m2 transition-all hover:text-head"
            >
              Register
            </Link>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-8 border-t border-line/65 pt-6">
              <span className="mb-3 block text-center text-[10px] font-bold uppercase tracking-wider text-muted">
                Dev Mode Bypass Accounts
              </span>

              <div className="grid grid-cols-2 gap-2">
                {devLogins.map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => handleDevLogin(cred)}
                    className="cursor-pointer rounded-lg border border-line bg-panel-2 px-3 py-2 text-left text-xs font-semibold text-text transition-all hover:border-m2/40 hover:bg-panel hover:text-head"
                  >
                    <div className="text-[10px] text-muted">
                      {cred.role}
                    </div>

                    <div className="truncate font-semibold">
                      {cred.email.split('@')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default LoginPage