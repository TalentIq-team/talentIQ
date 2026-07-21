import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { toErrorMessage } from '@/lib/api'

export const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

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
    <div className="flex min-h-screen items-center justify-center bg-radial-gradient px-4 py-12 sm:px-6 lg:px-8 bg-ink">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-m2 text-button-primary-text font-bold text-xl shadow-lg shadow-m2/25">
            IQ
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-head">Create your account</h2>
          <p className="mt-2 text-sm text-muted">
            Register to start applying for positions.
          </p>
        </div>

        <Card variant="glass" className="p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
