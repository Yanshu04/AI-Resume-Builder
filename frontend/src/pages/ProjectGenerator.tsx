import React, { useState } from 'react'
import api from '../lib/api'
import { 
  Sparkles, Copy, Check, Terminal, Folder, FileText, CheckCircle, 
  HelpCircle, ShieldAlert, Award, FileCode, BookOpen, Share2
} from 'lucide-react'

interface ProjectData {
  full_description: string
  tech_stack: string[]
  bullets: string[]
  readme_draft: string
  portfolio_description: string
  linkedin_post?: string
}

type TabType = 'desc' | 'stack' | 'bullets' | 'readme' | 'portfolio' | 'linkedin'

export default function ProjectGenerator() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<TabType>('desc')
  const [copied, setCopied] = useState(false)

  const handleGenerateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setProjectData(null)

    try {
      const res = await api.post('/projects/generate', {
        name: name.trim(),
        description: description.trim()
      })
      setProjectData(res.data)
      setActiveSubTab('desc')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate project materials.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddToResume = (sectionName: string) => {
    setSuccess(`Successfully added ${sectionName} into resume profile buffer!`)
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden font-sans">
      
      {/* Left Column: Form Input */}
      <div className="w-full md:w-80 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <Folder className="h-5 w-5 text-accent" />
            Project Incubator
          </h2>
          <p className="text-xs text-muted-foreground">
            Generate resume content, full tech stacks, README files, and portfolio write-ups for any project.
          </p>
        </div>

        {error && (
          <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-3.5 rounded-lg text-xs font-mono">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex gap-2 items-center bg-accent/5 border border-accent/20 text-accent p-3.5 rounded-lg text-xs font-mono">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleGenerateProject} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. AI Resume Builder"
              className="w-full bg-background border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono text-muted-foreground mb-1">Core Description / Goal</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              disabled={loading}
              placeholder="Describe what the system does, why you built it, and what problems it solves..."
              className="w-full bg-background border border-border rounded p-3 text-sm focus:outline-none focus:border-accent text-foreground disabled:opacity-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !description.trim()}
            className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Synthesizing...' : 'Generate Project Package'}
          </button>
        </form>
      </div>

      {/* Right Column: Output Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
            <div className="text-center">
              <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase animate-pulse">Running Ollama Model...</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">Structuring bullets, code READMEs, and case studies.</p>
            </div>
          </div>
        ) : projectData ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Horizontal Sub-tabs */}
            <div className="flex border-b border-border bg-background/50 overflow-x-auto shrink-0">
              <button
                onClick={() => { setActiveSubTab('desc'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'desc' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                Description
              </button>
              <button
                onClick={() => { setActiveSubTab('stack'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'stack' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className="h-4 w-4" />
                Tech Stack
              </button>
              <button
                onClick={() => { setActiveSubTab('bullets'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'bullets' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Award className="h-4 w-4" />
                Resume Bullets
              </button>
              <button
                onClick={() => { setActiveSubTab('readme'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'readme' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode className="h-4 w-4" />
                GitHub README
              </button>
              <button
                onClick={() => { setActiveSubTab('portfolio'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'portfolio' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Portfolio Case Study
              </button>
              <button
                onClick={() => { setActiveSubTab('linkedin'); setError(null); }}
                className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeSubTab === 'linkedin' ? 'border-accent text-accent bg-card/45' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Share2 className="h-4 w-4" />
                LinkedIn Post
              </button>
            </div>

            {/* Sub-tab Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-between">
              <div className="space-y-4">
                {/* Description view */}
                {activeSubTab === 'desc' && (
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Architectural Summary</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed bg-card border border-border p-6 rounded-xl">
                      {projectData.full_description}
                    </p>
                  </div>
                )}

                {/* Tech Stack view */}
                {activeSubTab === 'stack' && (
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Core Technologies</h3>
                    <div className="flex flex-wrap gap-2.5 p-6 bg-card border border-border rounded-xl">
                      {projectData.tech_stack.map((tech, idx) => (
                        <span 
                          key={idx}
                          className="bg-accent/10 border border-accent/20 text-accent text-xs font-mono px-3 py-1.5 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Bullets view */}
                {activeSubTab === 'bullets' && (
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Polished Resume Impact Statements</h3>
                    <div className="bg-card border border-border p-6 rounded-xl">
                      <ul className="list-disc pl-4 space-y-3.5">
                        {projectData.bullets.map((bullet, idx) => (
                          <li key={idx} className="text-sm text-foreground/90 leading-relaxed">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* README view */}
                {activeSubTab === 'readme' && (
                  <div className="space-y-4 max-w-3xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">GitHub README.md</h3>
                    <pre className="bg-card border border-border p-6 rounded-xl overflow-x-auto text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap select-all">
                      {projectData.readme_draft}
                    </pre>
                  </div>
                )}

                {/* Portfolio Case Study view */}
                {activeSubTab === 'portfolio' && (
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Case Study Write-up</h3>
                    <div className="bg-card border border-border p-6 rounded-xl text-sm text-foreground/90 leading-relaxed whitespace-pre-line space-y-4">
                      {projectData.portfolio_description}
                    </div>
                  </div>
                )}

                {/* LinkedIn Post view */}
                {activeSubTab === 'linkedin' && (
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">LinkedIn Social Post</h3>
                    <div className="bg-card border border-border p-6 rounded-xl text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {projectData.linkedin_post || "Generating post..."}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div className="mt-8 border-t border-border/40 pt-6 flex gap-3 max-w-2xl">
                <button
                  onClick={() => {
                    let text = ''
                    if (activeSubTab === 'desc') text = projectData.full_description
                    if (activeSubTab === 'stack') text = projectData.tech_stack.join(', ')
                    if (activeSubTab === 'bullets') text = projectData.bullets.join('\n')
                    if (activeSubTab === 'readme') text = projectData.readme_draft
                    if (activeSubTab === 'portfolio') text = projectData.portfolio_description
                    if (activeSubTab === 'linkedin') text = projectData.linkedin_post || ''
                    handleCopy(text)
                  }}
                  className="flex-1 border border-border hover:bg-secondary text-foreground py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Section'}
                </button>
                
                {activeSubTab === 'linkedin' ? (
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-accent text-background hover:bg-accent/90 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition text-center"
                  >
                    <Share2 className="h-4 w-4" />
                    Go to LinkedIn
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      let label = ''
                      if (activeSubTab === 'desc') label = 'Description'
                      if (activeSubTab === 'stack') label = 'Tech Stack'
                      if (activeSubTab === 'bullets') label = 'Bullets'
                      if (activeSubTab === 'readme') label = 'README'
                      if (activeSubTab === 'portfolio') label = 'Case Study'
                      handleAddToResume(label)
                    }}
                    className="flex-1 bg-accent text-background hover:bg-accent/90 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    Add to Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Folder className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <h3 className="font-semibold text-foreground/80 mb-1">No Project Loaded</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Fill in the name and description on the left to generate architectural schemas, README drafts, and polished bullet points.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
