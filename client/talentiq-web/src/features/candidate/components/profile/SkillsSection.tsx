import React, { useState } from 'react'
import type { CandidateSkill } from '@/api/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface SkillsSectionProps {
  skills?: CandidateSkill[]
  onSaveSkills: (skills: { skillId?: string; skillName?: string; proficiencyLevel?: string; category?: string }[]) => void
  isPending?: boolean
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills = [], onSaveSkills, isPending }) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [proficiency, setProficiency] = useState('Intermediate')
  const [category, setCategory] = useState('Technical')

  const proficiencyOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ]

  const categoryOptions = [
    { value: 'Technical', label: 'Technical / Core' },
    { value: 'Frontend', label: 'Frontend & UI' },
    { value: 'Backend', label: 'Backend & APIs' },
    { value: 'Cloud & DevOps', label: 'Cloud & Infrastructure' },
    { value: 'Database', label: 'Database & Analytics' },
    { value: 'Soft Skills', label: 'Leadership & Soft Skills' },
  ]

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return

    // Prevent duplicates
    const exists = skills.some(s => (s.skillName || '').toLowerCase() === newSkillName.trim().toLowerCase())
    if (exists) {
      alert(`Skill '${newSkillName}' is already added to your profile.`)
      return
    }

    const updated = [
      ...skills.map(s => ({ skillId: s.skillId, skillName: s.skillName, proficiencyLevel: s.proficiencyLevel, category: s.category })),
      { skillName: newSkillName.trim(), proficiencyLevel: proficiency, category },
    ]

    onSaveSkills(updated)
    setNewSkillName('')
    setShowAddModal(false)
  }

  const handleDeleteSkill = (skillToDelete: string) => {
    const updated = skills
      .filter(s => (s.skillName || s.skillId) !== skillToDelete)
      .map(s => ({ skillId: s.skillId, skillName: s.skillName, proficiencyLevel: s.proficiencyLevel, category: s.category }))
    onSaveSkills(updated)
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            ⚡ Technical Competencies & Skills ({skills.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Core technical skills, proficiency levels, and engineering domain categories.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Skill
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddSkill} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add Competency</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Skill Name" required value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="e.g. React 19, TypeScript, Docker" />
            <Select label="Proficiency Level" options={proficiencyOptions} value={proficiency} onChange={(e) => setProficiency(e.target.value)} />
            <Select label="Category" options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Skill</Button>
          </div>
        </form>
      )}

      {skills.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No skills added yet. Click <strong>+ Add Skill</strong> to add your technical abilities.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.skillName || skill.skillId}
              className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary/20 text-xs font-mono font-semibold text-primary flex items-center gap-2 group"
            >
              <span>{skill.skillName || 'Skill'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-head">{skill.proficiencyLevel || 'Intermediate'}</span>
              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.skillName || skill.skillId)}
                className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 font-bold ml-1 transition-opacity cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillsSection
