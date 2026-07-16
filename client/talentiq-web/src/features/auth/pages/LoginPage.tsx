import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { toErrorMessage } from '@/lib/api'

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
      
      // Role aware redirection
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

  // Pre-configured Dev Credentials for quick testing
  const devLogins = [
    { email: 'candidate@talentiq.dev', password: 'Password123!', role: 'Candidate' },
    { email: 'recruiter@talentiq.dev', password: 'Password123!', role: 'Recruiter' },
    { email: 'manager@talentiq.dev', password: 'Password123!', role: 'HiringManager' },
    { email: 'admin@talentiq.dev', password: 'Password123!', role: 'Admin' },
  ]

  const handleDevLogin = async (cred: typeof devLogins[0]) => {
    setIsSubmitting(true)
    setEmail(cred.email)
    setPassword(cred.password)
    try {
      const session = await login(cred.email, cred.password)
      toast.success(`Dev Mode: Logged in as ${session.role}`)
      
      if (session.role === 'Candidate') navigate('/candidate/jobs')
      else if (session.role === 'Recruiter') navigate('/recruiter/jobs')
      else if (session.role === 'HiringManager') navigate('/hiring-manager/shortlist')
      else if (session.role === 'Admin') navigate('/admin/analytics')
    } catch (err) {
      toast.error('Dev account login failed. Make sure the API is running and seeded.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8 bg-ink">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-m2 text-white font-bold text-xl shadow-lg shadow-m2/20">
            IQ
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-head">Welcome back</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your recruitment workspace.
          </p>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          {/* Dev bypass option for easy local testing */}
          <div className="mt-8 border-t border-line/65 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-3 text-center">
              Dev Mode Bypass Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              {devLogins.map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => handleDevLogin(cred)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-panel-2 hover:bg-panel border border-line text-text hover:text-head hover:border-m2/40 transition-all text-left cursor-pointer"
                >
                  <div className="text-[10px] text-muted">{cred.role}</div>
                  <div className="truncate font-semibold">{cred.email.split('@')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
export default LoginPage
