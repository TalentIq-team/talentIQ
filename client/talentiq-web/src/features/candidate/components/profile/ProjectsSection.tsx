import React, { useState } from 'react'
import type { CandidateProject } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ProjectsSectionProps {
  projects?: CandidateProject[]
  onAdd: (data: Omit<CandidateProject, 'id'>) => void
  onDelete: (projId: string) => void
  isPending?: boolean
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects = [], onAdd, onDelete, isPending }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [role, setRole] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [gitHubUrl, setGitHubUrl] = useState('')
  const [liveDemoUrl, setLiveDemoUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName) return

    onAdd({
      projectName,
      description,
      role,
      technologies,
      gitHubUrl,
      liveDemoUrl,
    })

    setShowAddForm(false)
    setProjectName('')
    setDescription('')
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            🚀 Featured Projects ({projects.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Highlight technical projects, role contributions, and repository/live demo links.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Project
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add Technical Project</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Project Name" required value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. TalentIQ Recruitment Platform" />
            <Input label="Your Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Lead Frontend Engineer" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-head">Project Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Built an AI-powered candidate evaluation suite..." />
          </div>

          <Input label="Technologies Used" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="e.g. React 19, TypeScript, .NET Core, Gemini API" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="GitHub Repository URL" value={gitHubUrl} onChange={(e) => setGitHubUrl(e.target.value)} placeholder="https://github.com/..." />
            <Input label="Live Demo URL" value={liveDemoUrl} onChange={(e) => setLiveDemoUrl(e.target.value)} placeholder="https://demo.talentiq.dev" />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Project</Button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No projects showcased yet. Click <strong>+ Add Project</strong> to demonstrate your work.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 space-y-2 relative group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-head">{proj.projectName}</h4>
                  {proj.role && <p className="text-xs font-semibold text-accent">{proj.role}</p>}
                </div>
                <button type="button" onClick={() => onDelete(proj.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer">Delete</button>
              </div>

              {proj.description && <p className="text-xs text-text leading-relaxed">{proj.description}</p>}

              {proj.technologies && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.technologies.split(',').map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-line/40">
                {proj.gitHubUrl && (
                  <a href={proj.gitHubUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">
                    🔗 GitHub Repository
                  </a>
                )}
                {proj.liveDemoUrl && (
                  <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                    🌐 Live Application Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectsSection
