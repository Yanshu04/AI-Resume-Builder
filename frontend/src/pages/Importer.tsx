import React, { useState } from 'react'
import api from '../lib/api'
import { 
  Download, Github, Linkedin, Upload, FileText, CheckCircle2, 
  AlertTriangle, Sparkles, Send, Check, ShieldAlert
} from 'lucide-react'

type ImportMode = 'resume' | 'github' | 'linkedin'

export default function Importer() {
  const [activeMode, setActiveMode] = useState<ImportMode>('resume')
  const [loading, setLoading] = useState(false)
  
  // File states
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null)
  const [githubUser, setGithubUser] = useState('')

  // Status Alerts
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Preview state of imported details
  const [importedResume, setImportedResume] = useState<any | null>(null)

  // 1. PDF/DOCX Resume File Upload Parser
  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeFile) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setImportedResume(null)

    const formData = new FormData()
    formData.append('file', resumeFile)

    try {
      const res = await api.post('/import/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportedResume(res.data.resume_json)
      setSuccess('AI successfully parsed your resume!')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Resume parser failed. Please ensure file type is PDF or DOCX.')
    } finally {
      setLoading(false)
    }
  }

  // 2. GitHub Repositories Fetch Importer
  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!githubUser.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setImportedResume(null)

    try {
      const res = await api.post('/import/github', {
        username: githubUser.trim()
      })
      
      const projects = res.data.projects
      if (!projects || projects.length === 0) {
        setError('No repositories found for this GitHub username.')
        return
      }

      // Format GitHub projects as a skeletal resume JSON so user can preview/apply
      const tempResume = {
        personal_info: {
          name: `${githubUser}'s Profile`,
          email: '',
          phone: '',
          location: ''
        },
        summary: `Imported GitHub profile containing projects and repositories.`,
        experience: [],
        projects: projects,
        skills: {
          languages: Array.from(new Set(projects.flatMap((p: any) => p.tech_stack || []))),
          frameworks: [],
          tools: []
        },
        education: [],
        achievements: []
      }

      setImportedResume(tempResume)
      setSuccess(`Imported ${projects.length} repository projects!`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to query GitHub repositories.')
    } finally {
      setLoading(false)
    }
  }

  // 3. LinkedIn Export ZIP Parser
  const handleLinkedinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkedinFile) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    setImportedResume(null)

    const formData = new FormData()
    formData.append('file', linkedinFile)

    try {
      const res = await api.post('/import/linkedin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportedResume(res.data.resume_json)
      setSuccess('AI successfully parsed LinkedIn ZIP archive!')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to read LinkedIn ZIP archive.')
    } finally {
      setLoading(false)
    }
  }

  // Apply imported data into active master resume draft
  const handleApplyImport = async () => {
    if (!importedResume) return
    setLoading(true)
    setError(null)
    try {
      await api.put('/resume/active', {
        resume_json: importedResume
      })
      setSuccess('Applied imported data to your active resume draft!')
      setImportedResume(null)
    } catch (err: any) {
      setError('Failed to persist active resume configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-full overflow-hidden font-sans">
      
      {/* Left Column: Platform selection tab options */}
      <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <Download className="h-5 w-5 text-accent" />
            Profile Import Hub
          </h2>
          <p className="text-xs text-muted-foreground">
            Populate your resume by uploading documents or fetching projects directly from external profiles.
          </p>
        </div>

        {/* Tab choices */}
        <div className="grid grid-cols-3 gap-1 bg-background border border-border p-1 rounded-lg">
          <button
            onClick={() => { setActiveMode('resume'); setError(null); setSuccess(null); }}
            className={`py-2 text-[10px] uppercase font-mono rounded transition-all ${
              activeMode === 'resume' ? 'bg-accent text-background font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => { setActiveMode('github'); setError(null); setSuccess(null); }}
            className={`py-2 text-[10px] uppercase font-mono rounded transition-all ${
              activeMode === 'github' ? 'bg-accent text-background font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            GitHub
          </button>
          <button
            onClick={() => { setActiveMode('linkedin'); setError(null); setSuccess(null); }}
            className={`py-2 text-[10px] uppercase font-mono rounded transition-all ${
              activeMode === 'linkedin' ? 'bg-accent text-background font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            LinkedIn
          </button>
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

        {/* Import Forms depending on mode */}
        <div className="flex-1">
          {activeMode === 'resume' && (
            <form onSubmit={handleResumeSubmit} className="space-y-4">
              <div className="border border-dashed border-border hover:border-accent/40 rounded-lg p-6 text-center space-y-3 bg-card/25 transition">
                <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <span className="text-xs font-medium">Click to select PDF or DOCX file</span>
                  <p className="text-[10px] text-muted-foreground">Accepts .pdf and .docx layouts up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="resume-file-picker"
                />
                <label 
                  htmlFor="resume-file-picker"
                  className="inline-block bg-background hover:bg-secondary border border-border text-xs px-3 py-1.5 rounded cursor-pointer transition"
                >
                  Browse File
                </label>
                {resumeFile && (
                  <div className="text-[10px] font-mono text-accent truncate max-w-xs mx-auto">
                    Selected: {resumeFile.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !resumeFile}
                className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'AI Parsing Document...' : 'Parse Resume File'}
              </button>
            </form>
          )}

          {activeMode === 'github' && (
            <form onSubmit={handleGithubSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase font-mono text-muted-foreground">GitHub Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    <Github className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-accent text-foreground font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !githubUser.trim()}
                className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Fetching Projects...' : 'Import GitHub Projects'}
              </button>
            </form>
          )}

          {activeMode === 'linkedin' && (
            <form onSubmit={handleLinkedinSubmit} className="space-y-4">
              <div className="border border-dashed border-border hover:border-accent/40 rounded-lg p-6 text-center space-y-3 bg-card/25 transition">
                <Linkedin className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <span className="text-xs font-medium">Click to select LinkedIn Export ZIP</span>
                  <p className="text-[10px] text-muted-foreground">Upload the zip containing Positions.csv</p>
                </div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setLinkedinFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="linkedin-file-picker"
                />
                <label 
                  htmlFor="linkedin-file-picker"
                  className="inline-block bg-background hover:bg-secondary border border-border text-xs px-3 py-1.5 rounded cursor-pointer transition"
                >
                  Browse ZIP File
                </label>
                {linkedinFile && (
                  <div className="text-[10px] font-mono text-accent truncate max-w-xs mx-auto">
                    Selected: {linkedinFile.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !linkedinFile}
                className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'AI Parsing ZIP...' : 'Parse LinkedIn Export'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Parsed resume JSON preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold tracking-tight">AI Importer Preview</span>
          {importedResume && (
            <button
              onClick={handleApplyImport}
              className="bg-accent text-background hover:bg-accent/90 text-[10px] font-mono uppercase font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
            >
              <Check className="h-3 w-3" />
              Apply Draft to Editor
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
              <p className="font-mono text-xs text-muted-foreground uppercase animate-pulse">AI Scanning Profile Nodes...</p>
            </div>
          ) : importedResume ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-xl space-y-6">
              
              {/* Header Details */}
              <div className="border-b border-border pb-4">
                <h1 className="text-xl font-bold">{importedResume.personal_info.name || 'Profile Name'}</h1>
                <div className="flex flex-wrap gap-x-4 text-xs font-mono text-muted-foreground mt-1">
                  {importedResume.personal_info.email && <span>{importedResume.personal_info.email}</span>}
                  {importedResume.personal_info.phone && <span>{importedResume.personal_info.phone}</span>}
                  {importedResume.personal_info.location && <span>{importedResume.personal_info.location}</span>}
                </div>
              </div>

              {/* Profile summary */}
              {importedResume.summary && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-accent font-semibold tracking-widest">Professional Summary</span>
                  <p className="text-xs text-foreground/80 leading-relaxed">{importedResume.summary}</p>
                </div>
              )}

              {/* Experience list */}
              {importedResume.experience && importedResume.experience.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border/30">
                  <span className="text-[10px] uppercase font-mono text-accent font-semibold tracking-widest block">Work Experience</span>
                  {importedResume.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{exp.position}</span>
                        <span className="text-muted-foreground font-mono">{exp.period}</span>
                      </div>
                      <div className="text-muted-foreground">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1">
                        {exp.bullets?.map((b: string, bIdx: number) => <li key={bIdx} className="text-[11px] leading-relaxed text-foreground/80">{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects list */}
              {importedResume.projects && importedResume.projects.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border/30">
                  <span className="text-[10px] uppercase font-mono text-accent font-semibold tracking-widest block">Technical Projects</span>
                  {importedResume.projects.map((proj: any, idx: number) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{proj.name}</span>
                        {proj.tech_stack && <span className="text-accent font-mono text-[10px]">{proj.tech_stack.join(', ')}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">{proj.description}</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {proj.bullets?.map((b: string, bIdx: number) => <li key={bIdx} className="text-[11px] leading-relaxed text-foreground/80">{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills block */}
              {importedResume.skills && (
                <div className="space-y-3 pt-3 border-t border-border/30 text-xs font-mono">
                  <span className="text-[10px] uppercase font-mono text-accent font-semibold tracking-widest block">Skills Summary</span>
                  <div className="space-y-1">
                    {importedResume.skills.languages?.length > 0 && (
                      <div><span className="text-muted-foreground font-semibold">Languages:</span> {importedResume.skills.languages.join(', ')}</div>
                    )}
                    {importedResume.skills.frameworks?.length > 0 && (
                      <div><span className="text-muted-foreground font-semibold">Frameworks:</span> {importedResume.skills.frameworks.join(', ')}</div>
                    )}
                    {importedResume.skills.tools?.length > 0 && (
                      <div><span className="text-muted-foreground font-semibold">Tools:</span> {importedResume.skills.tools.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/20">
              <Upload className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <h3 className="font-semibold text-foreground/80 mb-1">No Profile Imported</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload a document or search public GitHub details to run the parser. Extracted results will render here.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
