import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Department {
  id: string
  name: string
  code: string
  head: string
  employeeCount: number
}

export const OrgDeptPage: React.FC = () => {
  const [orgName, setOrgName] = useState('TalentIQ Enterprise Solutions')
  const [domain, setDomain] = useState('talentiq.dev')
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Engineering & Technology', code: 'ENG', head: 'Alex Tech (Tech Lead)', employeeCount: 42 },
    { id: '2', name: 'Product & Design', code: 'PRD', head: 'Sarah Ops (Director)', employeeCount: 18 },
    { id: '3', name: 'Sales & Marketing', code: 'SLS', head: 'Michael Brand (VP)', employeeCount: 25 },
    { id: '4', name: 'People Operations (HR)', code: 'POP', head: 'Jane Smith (VP)', employeeCount: 10 },
  ])

  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptCode, setNewDeptCode] = useState('')
  const [newDeptHead, setNewDeptHead] = useState('')

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptName || !newDeptCode) return
    const newDept: Department = {
      id: crypto.randomUUID(),
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      head: newDeptHead || 'Unassigned',
      employeeCount: 0,
    }
    setDepartments([...departments, newDept])
    setNewDeptName('')
    setNewDeptCode('')
    setNewDeptHead('')
    setSuccess('Department added successfully.')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    setSuccess('Organization details updated.')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Organization & Departments</h1>
        <p className="text-xs text-muted mt-1">Configure company division metadata, structure mappings, and department nodes.</p>
      </header>

      {success && (
        <Card variant="borderless" className="bg-ok/10 border border-ok/20 px-4 py-3 text-xs text-head font-medium">
          {success}
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Organization settings card */}
        <div className="md:col-span-1 space-y-4">
          <Card variant="glass" className="p-6 border border-line">
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4 pb-2 border-b border-line">
              Company Profile
            </h3>
            {isEditing ? (
              <form onSubmit={handleSaveOrg} className="space-y-4">
                <Input
                  label="Organization Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <Input
                  label="Corporate Domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Corporate Name</span>
                  <span className="font-semibold text-head">{orgName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Primary Domain</span>
                  <span className="font-semibold text-head">{domain}</span>
                </div>
                <div className="pt-4 border-t border-line/45">
                  <Button size="sm" variant="outline" className="w-full text-[10px]" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Add department form */}
          <Card variant="glass" className="p-6 border border-line">
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4 pb-2 border-b border-line">
              Create Department Node
            </h3>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <Input
                label="Department Name"
                required
                placeholder="e.g. Finance & Accounting"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code"
                  required
                  placeholder="e.g. FIN"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                />
                <Input
                  label="Head of Unit"
                  placeholder="e.g. John Doe"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" variant="primary" className="w-full">
                Add Node
              </Button>
            </form>
          </Card>
        </div>

        {/* Departments tree/table list */}
        <div className="md:col-span-2">
          <Card variant="glass" className="p-6 border border-line">
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">
              Department Configuration Nodes
            </h3>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/20 hover:border-m2/30 transition-all duration-150"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-m2/10 text-m2 border border-m2/10 rounded-md">
                        {dept.code}
                      </span>
                      <h4 className="text-xs font-bold text-head">{dept.name}</h4>
                    </div>
                    <p className="text-[10px] text-muted">
                      Leader: <strong className="text-text">{dept.head}</strong> · Employees: <strong className="text-text">{dept.employeeCount}</strong>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] py-1 h-7 border-alert/20 text-alert hover:bg-alert/5"
                    onClick={() => setDepartments(departments.filter((d) => d.id !== dept.id))}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrgDeptPage
