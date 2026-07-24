import React, { useState } from 'react'
import type { CandidateCertification } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface CertificationsSectionProps {
  certifications?: CandidateCertification[]
  onAdd: (data: Omit<CandidateCertification, 'id'>) => void
  onDelete: (certId: string) => void
  isPending?: boolean
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications = [], onAdd, onDelete, isPending }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [credentialId, setCredentialId] = useState('')
  const [credentialUrl, setCredentialUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !organization || !issueDate) return

    onAdd({
      name,
      organization,
      issueDate: new Date(issueDate).toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      credentialId,
      credentialUrl,
    })

    setShowAddForm(false)
    setName('')
    setOrganization('')
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            📜 Licenses & Certifications ({certifications.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Professional certifications, cloud credentials, and accredited licenses.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Certification
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add Credential</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Certification Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AWS Certified Solutions Architect" />
            <Input label="Issuing Organization" required value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Amazon Web Services" />
            <Input label="Issue Date" type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            <Input label="Expiration Date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            <Input label="Credential ID" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
            <Input label="Credential Verification URL" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Certification</Button>
          </div>
        </form>
      )}

      {certifications.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No certifications added yet. Click <strong>+ Add Certification</strong> to list credentials.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 space-y-1.5 relative group">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-head">{cert.name}</h4>
                <button type="button" onClick={() => onDelete(cert.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer">Delete</button>
              </div>
              <p className="text-xs font-semibold text-accent">{cert.organization}</p>
              <p className="text-[11px] font-mono text-muted">
                Issued {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} {cert.expiryDate ? `• Expires ${new Date(cert.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : '• No Expiry'}
              </p>
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-primary hover:underline block pt-1">
                  Verify Credential ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CertificationsSection
