import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface AdminUser {
  id: string
  email: string
  role: string
  organizationId: string
  departmentId: string | null
  isActive: boolean
  lastLoginAt: string | null
}

export const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient()
  
  // Creation state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Recruiter')
  const [deptId, setDeptId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Query users
  const { data: users = [], isLoading, isError } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/admin/users')
      return data
    },
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async () => {
      setError(null)
      setSuccess(null)
      const payload = {
        email,
        password,
        role,
        organizationId: '00000000-0000-0000-0000-000000000000',
        departmentId: deptId ? deptId : null,
      }
      await apiClient.post('/api/v1/admin/users', payload)
    },
    onSuccess: () => {
      setSuccess('User created successfully.')
      setEmail('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => setError(toErrorMessage(err)),
  })

  // Change user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: string }) => {
      await apiClient.patch(`/api/v1/admin/users/${id}/role`, { role: newRole })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => setError(toErrorMessage(err)),
  })

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/admin/users/${id}/deactivate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => setError(toErrorMessage(err)),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUserMutation.mutate()
  }

  if (isLoading) return <Spinner label="Loading user directory..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">User Management</h1>
        <p className="text-xs text-muted mt-1">Manage system authentication roles, access controls, and organization mappings.</p>
      </header>

      {success && (
        <Card variant="borderless" className="bg-ok/10 border border-ok/20 px-4 py-3 text-xs text-head font-medium">
          {success}
        </Card>
      )}

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create user form */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="p-6 border border-line">
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4 pb-2 border-b border-line">
              Add Corporate User
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="staff.name@talentiq.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Initial Password"
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Select
                label="System Authorization Role"
                options={[
                  { value: 'Recruiter', label: 'Recruiter' },
                  { value: 'HiringManager', label: 'Hiring Manager' },
                  { value: 'Admin', label: 'Administrator' },
                  { value: 'Candidate', label: 'Candidate Profile' },
                ]}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <div className="pt-2 border-t border-line/45 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  isLoading={createUserMutation.isPending}
                >
                  Provision Account
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Directory table card */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6 border border-line">
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">
              System Accounts Directory ({users.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-muted uppercase font-bold tracking-wider text-[9px]">
                    <th className="py-2.5">User Email</th>
                    <th className="py-2.5">Access Role</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-panel-2/20 transition-colors">
                      <td className="py-3 font-semibold text-head">{item.email}</td>
                      <td className="py-3">
                        <select
                          value={item.role}
                          onChange={(e) =>
                            changeRoleMutation.mutate({ id: item.id, newRole: e.target.value })
                          }
                          className="bg-panel-2 border border-line text-[11px] text-text rounded-lg px-2 py-1 outline-none focus:border-m2"
                        >
                          <option value="Candidate">Candidate</option>
                          <option value="Recruiter">Recruiter</option>
                          <option value="HiringManager">HiringManager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.isActive
                              ? 'bg-ok/10 text-ok border border-ok/20'
                              : 'bg-alert/10 text-alert border border-alert/20'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {item.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] py-1 h-7 border-alert/30 text-alert hover:bg-alert/10 hover:border-alert/50"
                            onClick={() => deactivateMutation.mutate(item.id)}
                            isLoading={deactivateMutation.isPending}
                          >
                            Deactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
