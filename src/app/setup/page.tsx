'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Chip from '@/components/ui/Chip'

const SKILLS = ['Python', 'JavaScript', 'React', 'SQL', 'Java', 'C++', 'Figma', 'TypeScript', 'Machine Learning', 'Data Analysis', 'Node.js', 'AWS', 'Docker', 'Git', 'Product Mgmt', 'Statistics']
const INTERESTS = ['Software Eng', 'Data Science', 'Product Design', 'Product Mgmt', 'ML / AI', 'Cloud Infra', 'Cybersecurity', 'Fintech', 'Healthcare', 'Climate Tech', 'EdTech', 'Robotics']

const TITLES = ['Academics', 'Skills', 'Interests']
const SUBS = ['Tell us about your studies', 'Select at least 2 skills', 'What fields interest you?']

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState('')
  const [gpa, setGpa] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  const canNext =
    step === 0 ? name.trim() && school && major && year :
    step === 1 ? skills.length >= 2 :
    interests.length >= 1

  const handleFinish = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          preferencesJson: { school, major, year, gpa, skills, interests },
        }),
      })
      const { error: apiError } = await res.json()
      if (apiError) {
        setError(apiError)
        return
      }
      router.push('/deck')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-9 font-mono">
      <div className="w-full">

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-9">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex-1 h-[3px] rounded-sm ${i <= step ? 'bg-ink' : 'bg-hairline'}`}
            />
          ))}
        </div>

        <div className="text-[10px] text-faint uppercase tracking-widest mb-1">Step {step + 1} of 3</div>
        <h2 className="text-2xl font-bold text-ink mb-1">{TITLES[step]}</h2>
        <p className="text-sm text-muted mb-7">{SUBS[step]}</p>

        {step === 0 && (
          <>
            <Input label="Full Name" placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="University" placeholder="e.g. UC Berkeley" value={school} onChange={(e) => setSchool(e.target.value)} />
            <Input label="Major" placeholder="e.g. Computer Science" value={major} onChange={(e) => setMajor(e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-muted uppercase tracking-widest mb-1 font-mono">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded border border-border bg-white text-ink text-sm font-mono outline-none focus:border-ink"
                >
                  <option value="">Select</option>
                  <option>Freshman</option>
                  <option>Sophomore</option>
                  <option>Junior</option>
                  <option>Senior</option>
                  <option>Grad</option>
                </select>
              </div>
              <div className="flex-1">
                <Input label="GPA (opt)" placeholder="3.7" value={gpa} onChange={(e) => setGpa(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <Chip key={s} label={s} active={skills.includes(s)} onClick={() => toggle(skills, setSkills, s)} />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((s) => (
              <Chip key={s} label={s} active={interests.includes(s)} onClick={() => toggle(interests, setInterests, s)} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-4">{error}</p>
        )}

        <div className="flex gap-2.5 mt-9">
          {step > 0 && (
            <Button onClick={() => setStep(step - 1)} className="flex-1">← BACK</Button>
          )}
          <Button
            variant="primary"
            disabled={!canNext || saving}
            onClick={() => step < 2 ? setStep(step + 1) : handleFinish()}
            className="flex-[2]"
          >
            {step < 2 ? 'CONTINUE →' : saving ? 'SAVING...' : 'START SWIPING →'}
          </Button>
        </div>

      </div>
    </div>
  )
}
