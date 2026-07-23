import React, { useState, useEffect } from 'react'
import type { CandidateSkill } from '@/api/types'
import { getSkills, type SkillOption } from '@/api/endpoints'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface SkillsSectionProps {
  skills?: CandidateSkill[]
  onSaveSkills: (skills: { skillId?: string; skillName?: string; proficiencyLevel?: string; category?: string }[]) => void
  isPending?: boolean
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills = [], onSaveSkills, isPending }) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [proficiency, setProficiency] = useState('Intermediate')

  useEffect(() => {
    getSkills().then(setAvailableSkills).catch(() => setAvailableSkills([]))
  }, [])

  const proficiencyOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ]

  const skillOptions = availableSkills
    .filter((s) => !skills.some((existing) => existing.skillId === s.id))
    .map((s) => ({ value: s.id, label: `${s.name} (${s.category})` }))

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkillId) return

    const chosen = availableSkills.find((s) => s.id === selectedSkillId)
    if (!chosen) return

    const updated = [
      ...skills.map(s => ({ skillId: s.skillId, skillName: s.skillName, proficiencyLevel: s.proficiencyLevel, category: s.category })),
      { skillId: chosen.id, skillName: chosen.name, proficiencyLevel: proficiency, category: chosen.category },
    ]

    onSaveSkills(updated)
    setSelectedSkillId('')
    setShowAddModal(false)
  }

  const handleDeleteSkill = (skillIdToDelete?: string) => {
    const updated = skills
      .filter(s => s.skillId !== skillIdToDelete)
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Skill"
              required
              options={[{ value: '', label: skillOptions.length ? 'Select a skill…' : 'No skills available' }, ...skillOptions]}
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
            />
            <Select label="Proficiency Level" options={proficiencyOptions} value={proficiency} onChange={(e) => setProficiency(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending} disabled={!selectedSkillId}>Save Skill</Button>
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
              key={skill.skillId}
              className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary/20 text-xs font-mono font-semibold text-primary flex items-center gap-2 group"
            >
              <span>{skill.skillName || 'Skill'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-head">{skill.proficiencyLevel || 'Intermediate'}</span>
              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.skillId)}
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