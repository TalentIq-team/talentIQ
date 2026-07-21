import React, { useState } from 'react'
import type { CandidateLanguage } from '@/api/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface LanguagesSectionProps {
  languages?: CandidateLanguage[]
  onAdd: (data: Omit<CandidateLanguage, 'id'>) => void
  onDelete: (langId: string) => void
  isPending?: boolean
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages = [], onAdd, onDelete, isPending }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [language, setLanguage] = useState('')
  const [readingLevel, setReadingLevel] = useState('Full Professional')
  const [writingLevel, setWritingLevel] = useState('Full Professional')
  const [speakingLevel, setSpeakingLevel] = useState('Full Professional')

  const fluencyOptions = [
    { value: 'Native / Bilingual', label: 'Native / Bilingual' },
    { value: 'Full Professional', label: 'Full Professional' },
    { value: 'Professional Working', label: 'Professional Working' },
    { value: 'Limited Working', label: 'Limited Working' },
    { value: 'Elementary', label: 'Elementary' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!language) return

    onAdd({
      language,
      readingLevel,
      writingLevel,
      speakingLevel,
    })

    setShowAddForm(false)
    setLanguage('')
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            🗣️ Languages & Fluency ({languages.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Spoken and written language proficiencies.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Language
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add Language Proficiency</h4>

          <Input label="Language Name" required value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English, Sinhala, Tamil, German" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Reading Level" options={fluencyOptions} value={readingLevel} onChange={(e) => setReadingLevel(e.target.value)} />
            <Select label="Writing Level" options={fluencyOptions} value={writingLevel} onChange={(e) => setWritingLevel(e.target.value)} />
            <Select label="Speaking Level" options={fluencyOptions} value={speakingLevel} onChange={(e) => setSpeakingLevel(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Language</Button>
          </div>
        </form>
      )}

      {languages.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No languages added yet. Click <strong>+ Add Language</strong> to specify proficiency.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <div key={lang.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 space-y-2 relative group">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-head">{lang.language}</h4>
                <button type="button" onClick={() => onDelete(lang.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer">Delete</button>
              </div>

              <div className="space-y-1 text-[11px] font-mono text-muted">
                <div>Reading: <span className="text-head font-bold">{lang.readingLevel}</span></div>
                <div>Writing: <span className="text-head font-bold">{lang.writingLevel}</span></div>
                <div>Speaking: <span className="text-head font-bold">{lang.speakingLevel}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguagesSection
