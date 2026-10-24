import React, { useState } from 'react'
import api from '../lib/api'
import { 
  Zap, Check, X, ArrowRight, ShieldCheck, AlertTriangle, 
  Sparkles, FileText, ChevronRight, CheckCircle2
} from 'lucide-react'

interface ResumeJson {
  personal_info: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
    github: string
  }
  summary: string
  experience: Array<{
    company: string
    position: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    name: string
    description: string
    tech_stack: string[]
    bullets: string[]
  }>
  skills: {
    languages: string[]
    frameworks: string[]
    tools: string[]
  }
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  achievements: string[]
}

// Sample resume for testing when no active resume session exists
const SAMPLE_RESUME: ResumeJson = {
  personal_info: {
    name: "Alex Dev",
    email: "alex@domain.com",
    phone: "555-0123",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/alexdev",
    github: "github.com/alexdev"
  },
  summary: "Software developer with experience in building web applications. Highly motivated and eager to work in team environments.",
  experience: [
    {
      company: "Code Labs",
      position: "Junior Developer",
      period: "2022 - Present",
      bullets: [
        "Worked on backend components and fixed database bugs.",
        "Helped code frontend views using JavaScript and CSS."
      ]
    }
  ],
  projects: [
    {
      name: "Chat App",
      description: "A messaging system.",
      tech_stack: ["Python", "Flask"],
      bullets: [
        "Built chat backend and routes.",
        "Integrated basic database structures."
      ]
    }
  ],
  skills: {
    languages: ["Python", "JavaScript", "SQL"],
    frameworks: ["Flask", "React"],
    tools: ["Git", "Docker", "VS Code"]
  },
  education: [
    {
      institution: "State College",
      degree: "B.S. in CS",
      year: "2022"
    }
  ],
  achievements: [
    "Successfully graduated college.",
    "Built 3 personal portfolio apps."
  ]
}

interface OptimizationChange {
  id: string
  description: string
  type: 'summary' | 'skills' | 'experience'
  status: 'pending' | 'accepted' | 'rejected'
  originalValue: any
  optimizedValue: any
}

export default function JDOptimizer() {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Active state resumes
  const [originalResume, setOriginalResume] = useState<ResumeJson>(SAMPLE_RESUME)
  const [optimizedResume, setOptimizedResume] = useState<ResumeJson | null>(null)
  const [previewResume, setPreviewResume] = useState<ResumeJson | null>(null)
  
  // Track granular optimization edits
  const [changes, setChanges] = useState<OptimizationChange[]>([])

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jdText.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setOptimizedResume(null)
    setPreviewResume(null)

    try {
      const res = await api.post('/optimize', {
        resume_json: originalResume,
        jd_text: jdText.trim()
      })
      
      const opt: ResumeJson = res.data.optimized_resume
      const diffs: string[] = res.data.diff_summary

      setOptimizedResume(opt)
      setPreviewResume(opt) // Initial preview shows everything accepted

      // Parse diff list into structured interactive changes
      const parsedChanges: OptimizationChange[] = diffs.map((desc, idx) => {
        let type: 'summary' | 'skills' | 'experience' = 'experience'
        let originalValue: any = null
        let optimizedValue: any = null

        if (desc.toLowerCase().includes('summary')) {
          type = 'summary'
          originalValue = originalResume.summary
          optimizedValue = opt.summary
        } else if (desc.toLowerCase().includes('skills') || desc.toLowerCase().includes('reordered')) {
          type = 'skills'
          originalValue = originalResume.skills
          optimizedValue = opt.skills
        } else {
          type = 'experience'
          originalValue = originalResume.experience
          optimizedValue = opt.experience
        }

        return {
          id: `change_${idx}`,
          description: desc,
          type,
          status: 'accepted', // Default to accepted
          originalValue,
          optimizedValue
        }
      })

      setChanges(parsedChanges)

    } catch (err: any) {
      setError(err.response?.data?.detail || 'ATS Optimization failed.')
    } finally {
      setLoading(false)
    }
  }

  // Handle accepting an optimization
  const handleAcceptChange = (id: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'accepted' } : c))
    )
    updatePreview()
  }

  // Handle rejecting an optimization (reverts it back to original)
  const handleRejectChange = (id: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
    )
    updatePreview()
  }

  const updatePreview = () => {
    // We defer state update slightly so the state changes array updates first
    setTimeout(() => {
      setChanges((currentChanges) => {
        if (!optimizedResume) return currentChanges
        
        let newPreview = { ...optimizedResume }
        
        currentChanges.forEach((change) => {
          if (change.status === 'rejected') {
            // Revert section based on type
            if (change.type === 'summary') {
              newPreview.summary = originalResume.summary
            } else if (change.type === 'skills') {
              newPreview.skills = originalResume.skills
            } else if (change.type === 'experience') {
              newPreview.experience = originalResume.experience
              newPreview.projects = originalResume.projects
            }
          }
        })
        
        setPreviewResume(newPreview)
        return currentChanges
      })
    }, 50)
  }

  const handleApplyChanges = () => {
    setSuccess('Applied optimized configurations to master resume draft!')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-full overflow-hidden font-sans">
      
      {/* Left Column: JD input and Accept/Reject lists */}
      <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent animate-pulse" />
            ATS Optimization Engine
          </h2>
          <p className="text-xs text-muted-foreground">
            Paste a target Job Description. The LLM will reorder skills and rewrite experience bullets to match the JD's keywords.
          </p>
        </div>

        {error && (
          <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-3.5 rounded-lg text-xs font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2 items-center bg-accent/5 border border-accent/20 text-accent p-3.5 rounded-lg text-xs font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!optimizedResume ? (
          <form onSubmit={handleOptimize} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Paste Job Description</label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                required
                rows={10}
                disabled={loading}
                placeholder="Paste the target role description here (e.g. key requirements, technologies needed)..."
                className="w-full bg-background border border-border rounded p-3 text-xs font-sans focus:outline-none focus:border-accent text-foreground disabled:opacity-50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !jdText.trim()}
              className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Optimizing...' : 'Optimize Resume'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">ATS Optimizations</span>
              <button 
                onClick={() => { setOptimizedResume(null); setPreviewResume(null); setChanges([]); }}
                className="text-[10px] font-mono text-accent hover:underline uppercase"
              >
                Reset Optimizer
              </button>
            </div>
            
            <div className="space-y-3">
              {changes.map((change) => (
                <div 
                  key={change.id}
                  className={`p-3.5 border rounded-lg transition-all ${
                    change.status === 'accepted' 
                      ? 'bg-accent/5 border-accent/20' 
                      : change.status === 'rejected' 
                      ? 'bg-red-950/5 border-red-900/10 opacity-60' 
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="text-xs text-foreground/90 font-medium mb-2.5">
                    {change.description}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleRejectChange(change.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                        change.status === 'rejected'
                          ? 'bg-red-900/20 border-red-900/50 text-red-400'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <X className="h-3 w-3 inline mr-1" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleAcceptChange(change.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase border transition-all ${
                        change.status === 'accepted'
                          ? 'bg-accent/10 border-accent/30 text-accent font-semibold'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Check className="h-3 w-3 inline mr-1" />
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleApplyChanges}
              className="w-full bg-accent text-background hover:bg-accent/90 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Apply Optimized Resume
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Comparative Diff Previews */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold tracking-tight">Before vs. After Optimization</span>
          {loading && (
            <span className="text-xs font-mono text-accent animate-pulse uppercase">Rewriting ATS Targets...</span>
          )}
        </div>

        {/* Diff Pane */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
              <p className="font-mono text-xs text-muted-foreground uppercase animate-pulse">Running ATS Analysis...</p>
            </div>
          ) : previewResume ? (
            <div className="max-w-3xl mx-auto space-y-8 font-sans">
              
              {/* Summary Diff */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border pb-1">Professional Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-lg opacity-75">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">Original Summary</span>
                    <p className="text-xs leading-relaxed text-foreground/80">{originalResume.summary}</p>
                  </div>
                  <div className={`bg-card p-4 rounded-lg border transition-all ${previewResume.summary !== originalResume.summary ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest block mb-1 font-semibold">ATS Optimized Summary</span>
                    <p className="text-xs leading-relaxed text-foreground">{previewResume.summary}</p>
                  </div>
                </div>
              </div>

              {/* Skills Diff */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border pb-1">Skills Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-lg opacity-75 text-xs font-mono">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Original Order</span>
                    <div className="space-y-1">
                      <div><span className="text-muted-foreground font-semibold">Languages:</span> {originalResume.skills.languages.join(', ')}</div>
                      <div><span className="text-muted-foreground font-semibold">Frameworks:</span> {originalResume.skills.frameworks.join(', ')}</div>
                      <div><span className="text-muted-foreground font-semibold">Tools:</span> {originalResume.skills.tools.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div className={`bg-card p-4 rounded-lg border text-xs font-mono transition-all ${JSON.stringify(previewResume.skills) !== JSON.stringify(originalResume.skills) ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
                    <span className="text-[10px] text-accent uppercase tracking-widest block mb-2 font-semibold">ATS Optimized Order</span>
                    <div className="space-y-1">
                      <div><span className="text-muted-foreground font-semibold">Languages:</span> {previewResume.skills.languages.join(', ')}</div>
                      <div><span className="text-muted-foreground font-semibold">Frameworks:</span> {previewResume.skills.frameworks.join(', ')}</div>
                      <div><span className="text-muted-foreground font-semibold">Tools:</span> {previewResume.skills.tools.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Diff */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border pb-1">Experience Bullets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-lg opacity-75">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">Original experience bullets</span>
                    {originalResume.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="space-y-1.5 mb-3">
                        <div className="font-semibold text-xs text-foreground/80">{exp.position} - {exp.company}</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {exp.bullets.map((b, idx) => <li key={idx} className="text-xs text-foreground/70">{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`bg-card p-4 rounded-lg border transition-all ${JSON.stringify(previewResume.experience) !== JSON.stringify(originalResume.experience) ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest block mb-2 font-semibold font-semibold">ATS Optimized experience bullets</span>
                    {previewResume.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="space-y-1.5 mb-3">
                        <div className="font-semibold text-xs text-foreground">{exp.position} - {exp.company}</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {exp.bullets.map((b, idx) => <li key={idx} className="text-xs text-foreground">{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/20">
              <Zap className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <h3 className="font-semibold text-foreground/80 mb-1">No Optimization Completed</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Paste your target Job Description on the left and trigger the optimizer to view ATS matches and side-by-side diff files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
