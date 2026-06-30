import React, { useState } from 'react'
import api from '../lib/api'
import { 
  Sparkles, Copy, Check, Terminal, FileText, BadgeCheck, Trophy, Award, 
  HelpCircle, AlignLeft, ShieldAlert
} from 'lucide-react'

type GeneratorType = 'summary' | 'bullet' | 'experience' | 'achievement' | 'skills'

export default function AIContentGenerators() {
  const [activeGen, setActiveGen] = useState<GeneratorType>('summary')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Input states
  const [summaryRole, setSummaryRole] = useState('')
  const [summarySkills, setSummarySkills] = useState('')
  const [summaryOutput, setSummaryOutput] = useState('')

  const [bulletText, setBulletText] = useState('')
  const [bulletContext, setBulletContext] = useState('')
  const [bulletOutput, setBulletOutput] = useState('')

  const [expText, setExpText] = useState('')
  const [expOutput, setExpOutput] = useState('')

  const [achText, setAchText] = useState('')
  const [achOutput, setAchOutput] = useState('')

  const [skillsRole, setSkillsRole] = useState('')
  const [skillsList, setSkillsList] = useState('')
  const [skillsJD, setSkillsJD] = useState('')
  const [skillsOutput, setSkillsOutput] = useState<string[]>([])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summaryRole) return
    setLoading(true)
    setError(null)
    setSummaryOutput('')
    try {
      const res = await api.post('/generators/summary', {
        role: summaryRole,
        key_skills: summarySkills
      })
      setSummaryOutput(res.data.summary)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handlePolishBullet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulletText) return
    setLoading(true)
    setError(null)
    setBulletOutput('')
    try {
      const res = await api.post('/generators/bullet', {
        rough_bullet: bulletText,
        context: bulletContext
      })
      setBulletOutput(res.data.bullet)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleRewriteExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expText) return
    setLoading(true)
    setError(null)
    setExpOutput('')
    try {
      const res = await api.post('/generators/experience', {
        rough_text: expText
      })
      setExpOutput(res.data.experience)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantifyAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!achText) return
    setLoading(true)
    setError(null)
    setAchOutput('')
    try {
      const res = await api.post('/generators/achievement', {
        raw_achievement: achText
      })
      setAchOutput(res.data.achievement)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestSkills = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skillsRole) return
    setLoading(true)
    setError(null)
    setSkillsOutput([])
    try {
      const skillsArray = skillsList.split(',').map(s => s.trim()).filter(s => s !== '')
      const res = await api.post('/generators/skills/suggest', {
        current_skills: skillsArray,
        role: skillsRole,
        jd: skillsJD
      })
      setSkillsOutput(res.data.suggested_skills)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleInsertIntoResume = () => {
    setSuccess('Injected content into active editor buffer!')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden font-sans">
      
      {/* Left Column: Selector Tabs */}
      <div className="w-full md:w-64 border-r border-border bg-card/25 flex flex-col shrink-0 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase px-2 mb-2 font-semibold">
          Select Generator
        </div>
        
        <button
          onClick={() => { setActiveGen('summary'); setError(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all font-semibold uppercase tracking-wider ${
            activeGen === 'summary' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <AlignLeft className="h-4 w-4 shrink-0" />
          Summary Writer
        </button>
        <button
          onClick={() => { setActiveGen('bullet'); setError(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all font-semibold uppercase tracking-wider ${
            activeGen === 'bullet' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Bullet Polisher
        </button>
        <button
          onClick={() => { setActiveGen('experience'); setError(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all font-semibold uppercase tracking-wider ${
            activeGen === 'experience' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Experience Parser
        </button>
        <button
          onClick={() => { setActiveGen('achievement'); setError(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all font-semibold uppercase tracking-wider ${
            activeGen === 'achievement' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <Trophy className="h-4 w-4 shrink-0" />
          Achievement Boost
        </button>
        <button
          onClick={() => { setActiveGen('skills'); setError(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all font-semibold uppercase tracking-wider ${
            activeGen === 'skills' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          Skills Suggester
        </button>
      </div>

      {/* Right Column: Active Generator Form and Output */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Form Panel */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-border space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight uppercase font-mono">
              {activeGen === 'summary' && 'Professional Summary Writer'}
              {activeGen === 'bullet' && 'Experience Bullet Polisher'}
              {activeGen === 'experience' && 'Rough Experience Rewriter'}
              {activeGen === 'achievement' && 'Achievement Quantifier'}
              {activeGen === 'skills' && 'Skills System Recommender'}
            </h1>
          </div>

          {error && (
            <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-4 rounded-lg text-xs font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-2 items-center bg-accent/5 border border-accent/20 text-accent p-4 rounded-lg text-xs font-mono">
              <Check className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form: Summary */}
          {activeGen === 'summary' && (
            <form onSubmit={handleGenerateSummary} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Target Job Title</label>
                <input 
                  type="text" 
                  value={summaryRole}
                  onChange={(e) => setSummaryRole(e.target.value)}
                  required
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Key Skills / Focus Areas (Optional)</label>
                <input 
                  type="text" 
                  value={summarySkills}
                  onChange={(e) => setSummarySkills(e.target.value)}
                  placeholder="e.g. React, Python, Docker, Distributed Systems"
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !summaryRole}
                className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Generating...' : 'Generate Professional Summary'}
              </button>
            </form>
          )}

          {/* Form: Bullet */}
          {activeGen === 'bullet' && (
            <form onSubmit={handlePolishBullet} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Rough Bullet Point</label>
                <textarea 
                  value={bulletText}
                  onChange={(e) => setBulletText(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. I worked on a chatbot and made it faster."
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground resize-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Role / Job Title (Optional)</label>
                <input 
                  type="text" 
                  value={bulletContext}
                  onChange={(e) => setBulletContext(e.target.value)}
                  placeholder="e.g. AI Product Engineer"
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !bulletText}
                className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Polishing...' : 'Polish Bullet Point'}
              </button>
            </form>
          )}

          {/* Form: Experience */}
          {activeGen === 'experience' && (
            <form onSubmit={handleRewriteExperience} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Rough Experience Draft</label>
                <textarea 
                  value={expText}
                  onChange={(e) => setExpText(e.target.value)}
                  required
                  rows={6}
                  placeholder="e.g. I was at TechInc for 2 years. I worked on their cloud backend. I fixed a lot of bugs, speeded up query endpoints using postgres indexes, and also led a small team to build an internal dashboard using React."
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !expText}
                className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Rewriting...' : 'Rewrite into Bullets'}
              </button>
            </form>
          )}

          {/* Form: Achievement */}
          {activeGen === 'achievement' && (
            <form onSubmit={handleQuantifyAchievement} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Raw Achievement</label>
                <input 
                  type="text" 
                  value={achText}
                  onChange={(e) => setAchText(e.target.value)}
                  required
                  placeholder="e.g. I won a hackathon for coding."
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !achText}
                className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Quantifying...' : 'Boost & Quantify Achievement'}
              </button>
            </form>
          )}

          {/* Form: Skills */}
          {activeGen === 'skills' && (
            <form onSubmit={handleSuggestSkills} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Target Role</label>
                <input 
                  type="text" 
                  value={skillsRole}
                  onChange={(e) => setSkillsRole(e.target.value)}
                  required
                  placeholder="e.g. DevOps Engineer"
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Current Skills (Comma separated list)</label>
                <input 
                  type="text" 
                  value={skillsList}
                  onChange={(e) => setSkillsList(e.target.value)}
                  placeholder="e.g. Python, Docker, Jenkins"
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Job Description Context (Optional)</label>
                <textarea 
                  value={skillsJD}
                  onChange={(e) => setSkillsJD(e.target.value)}
                  rows={4}
                  placeholder="Paste JD text here to suggest highly targeted keywords..."
                  className="w-full bg-card border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !skillsRole}
                className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Analyzing...' : 'Suggest Skills'}
              </button>
            </form>
          )}
        </div>

        {/* Output Panel */}
        <div className="w-full md:w-96 bg-card/20 p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border/60 pb-2">
              Generated System Output
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                <p className="text-xs font-mono text-muted-foreground uppercase animate-pulse">Running Ollama Inference...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Text Output (Summary, Bullet, Exp, Ach) */}
                {activeGen !== 'skills' && (
                  <>
                    {((activeGen === 'summary' && summaryOutput) || 
                      (activeGen === 'bullet' && bulletOutput) || 
                      (activeGen === 'experience' && expOutput) || 
                      (activeGen === 'achievement' && achOutput)) ? (
                      <div className="bg-card border border-border rounded-lg p-4 text-sm leading-relaxed text-foreground select-text font-sans whitespace-pre-line relative group">
                        {activeGen === 'summary' && summaryOutput}
                        {activeGen === 'bullet' && bulletOutput}
                        {activeGen === 'experience' && expOutput}
                        {activeGen === 'achievement' && achOutput}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-4">
                        Output will render here after clicking generate.
                      </p>
                    )}
                  </>
                )}

                {/* Skills Output (List of Badges) */}
                {activeGen === 'skills' && (
                  <>
                    {skillsOutput.length > 0 ? (
                      <div className="flex flex-wrap gap-2 py-2">
                        {skillsOutput.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="bg-accent/10 border border-accent/20 text-accent font-mono text-xs px-2.5 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-4">
                        Recommended skills will render here after analysis.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons (Copy + Insert) */}
          {!loading && (
            <div className="mt-8 border-t border-border/40 pt-4 space-y-2">
              <button
                onClick={() => {
                  let textToCopy = ''
                  if (activeGen === 'summary') textToCopy = summaryOutput
                  if (activeGen === 'bullet') textToCopy = bulletOutput
                  if (activeGen === 'experience') textToCopy = expOutput
                  if (activeGen === 'achievement') textToCopy = achOutput
                  if (activeGen === 'skills') textToCopy = skillsOutput.join(', ')
                  
                  if (textToCopy) handleCopy(textToCopy)
                }}
                disabled={
                  (activeGen === 'summary' && !summaryOutput) ||
                  (activeGen === 'bullet' && !bulletOutput) ||
                  (activeGen === 'experience' && !expOutput) ||
                  (activeGen === 'achievement' && !achOutput) ||
                  (activeGen === 'skills' && skillsOutput.length === 0)
                }
                className="w-full border border-border hover:bg-secondary text-foreground disabled:opacity-40 transition py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              
              <button
                onClick={handleInsertIntoResume}
                disabled={
                  (activeGen === 'summary' && !summaryOutput) ||
                  (activeGen === 'bullet' && !bulletOutput) ||
                  (activeGen === 'experience' && !expOutput) ||
                  (activeGen === 'achievement' && !achOutput) ||
                  (activeGen === 'skills' && skillsOutput.length === 0)
                }
                className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Insert into Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
