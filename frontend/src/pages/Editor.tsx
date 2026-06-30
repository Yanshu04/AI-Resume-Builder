import React, { useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  Sliders, GripVertical, FileText, CheckCircle2, ShieldAlert, 
  Trash2, Plus, Sparkles, User, RefreshCw
} from 'lucide-react'
import { ResumePageSkeleton } from '../components'

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
    id: string
    company: string
    position: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    id: string
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
    id: string
    institution: string
    degree: string
    year: string
  }>
  achievements: string[]
  section_order: string[]
}

const DRAG_TYPE_SECTION = 'SECTION'
const DRAG_TYPE_EXP = 'EXPERIENCE'
const DRAG_TYPE_PROJ = 'PROJECT'

interface DraggableProps {
  id: string
  index: number
  type: string
  moveItem: (dragIndex: number, hoverIndex: number) => void
  children: React.ReactNode
}

function DraggableItem({ id, index, type, moveItem, children }: DraggableProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const [, drop] = useDrop({
    accept: type,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      moveItem(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })
  
  const [{ isDragging }, drag] = useDrag({
    type,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  
  drag(drop(ref))
  
  return (
    <div ref={ref} className={`flex items-center gap-3 bg-card border border-border p-4 rounded-xl shadow-sm hover:border-accent/30 transition-all ${isDragging ? 'opacity-30 border-dashed border-accent' : 'opacity-100'}`}>
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-accent shrink-0">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

export default function Editor() {
  const [resumeId, setResumeId] = useState<number | null>(null)
  const [resumeData, setResumeData] = useState<ResumeJson | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [autoSaving, setAutoSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch active resume
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get('/resume/active')
        setResumeId(res.data.id)
        
        // Ensure section_order fallback is populated
        const rJson = res.data.resume_json
        if (!rJson.section_order) {
          rJson.section_order = ["summary", "skills", "experience", "projects", "education", "achievements"]
        }
        setResumeData(rJson)
      } catch (err) {
        setError('Failed to fetch active resume configuration.')
      } finally {
        setLoading(false)
      }
    }
    fetchActive()
  }, [])

  // Auto-saves the resume JSON back to Postgres
  const autoSaveResume = async (updatedJson: ResumeJson) => {
    if (!resumeId) return
    setAutoSaving(true)
    try {
      await api.patch(`/resume/${resumeId}/order`, {
        resume_json: updatedJson
      })
      setSuccess('Auto-saved sorting changes!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('Auto-save ordering failed.')
    } finally {
      setAutoSaving(false)
    }
  }

  // Move core resume sections
  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!resumeData) return
    const newOrder = [...resumeData.section_order]
    const [removed] = newOrder.splice(dragIndex, 1)
    newOrder.splice(hoverIndex, 0, removed)
    
    const updated = { ...resumeData, section_order: newOrder }
    setResumeData(updated)
    autoSaveResume(updated)
  }, [resumeData])

  // Move experience entries
  const moveExperience = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!resumeData) return
    const newExp = [...resumeData.experience]
    const [removed] = newExp.splice(dragIndex, 1)
    newExp.splice(hoverIndex, 0, removed)
    
    const updated = { ...resumeData, experience: newExp }
    setResumeData(updated)
    autoSaveResume(updated)
  }, [resumeData])

  // Move project entries
  const moveProject = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!resumeData) return
    const newProj = [...resumeData.projects]
    const [removed] = newProj.splice(dragIndex, 1)
    newProj.splice(hoverIndex, 0, removed)
    
    const updated = { ...resumeData, projects: newProj }
    setResumeData(updated)
    autoSaveResume(updated)
  }, [resumeData])

  // Delete experience or project items
  const handleDeleteItem = (type: 'exp' | 'proj', id: string) => {
    if (!resumeData) return
    let updated: ResumeJson
    if (type === 'exp') {
      updated = { ...resumeData, experience: resumeData.experience.filter(e => e.id !== id) }
    } else {
      updated = { ...resumeData, projects: resumeData.projects.filter(p => p.id !== id) }
    }
    setResumeData(updated)
    autoSaveResume(updated)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden font-sans">
        {/* Left Column: Reordering Panels Skeleton */}
        <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 space-y-6">
          <div className="space-y-2">
            <div className="h-5 bg-border rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-border/60 rounded w-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-14 bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-4 bg-border/60 rounded w-6 animate-pulse"></div>
                <div className="h-3.5 bg-border/60 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Column: Live Sorted Preview Skeleton */}
        <div className="flex-1 flex flex-col bg-card/10 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
            <div className="h-4 bg-border rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            <ResumePageSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden font-sans">
        
        {/* Left Column: Reordering Panels */}
        <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-accent" />
                Structural Reordering
              </h2>
              <p className="text-xs text-muted-foreground">
                Drag and drop cards to reorder sections, jobs, or projects. Changes persist immediately.
              </p>
            </div>
            {autoSaving && (
              <RefreshCw className="h-4 w-4 text-accent animate-spin shrink-0" />
            )}
          </div>

          {error && (
            <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-3.5 rounded-lg text-xs font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-2 items-center bg-accent/5 border border-accent/20 text-accent p-3.5 rounded-lg text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {resumeData && (
            <div className="space-y-6">
              
              {/* 1. Main Sections Reordering */}
              <div className="space-y-3">
                <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">
                  Section Layout Flow
                </label>
                <div className="space-y-2">
                  {resumeData.section_order.map((sec, idx) => (
                    <DraggableItem
                      key={sec}
                      id={sec}
                      index={idx}
                      type={DRAG_TYPE_SECTION}
                      moveItem={moveSection}
                    >
                      <div className="flex justify-between items-center text-xs uppercase font-mono tracking-wider font-semibold">
                        <span>{sec}</span>
                        <span className="text-[10px] text-muted-foreground lowercase">Section block</span>
                      </div>
                    </DraggableItem>
                  ))}
                </div>
              </div>

              {/* 2. Job Experiences Reordering */}
              {resumeData.experience.length > 0 && (
                <div className="space-y-3 border-t border-border/60 pt-4">
                  <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">
                    Work History Sorting
                  </label>
                  <div className="space-y-2">
                    {resumeData.experience.map((exp, idx) => (
                      <DraggableItem
                        key={exp.id}
                        id={exp.id}
                        index={idx}
                        type={DRAG_TYPE_EXP}
                        moveItem={moveExperience}
                      >
                        <div className="flex justify-between items-center">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{exp.position}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">{exp.company}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem('exp', exp.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 rounded shrink-0 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </DraggableItem>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Projects Reordering */}
              {resumeData.projects.length > 0 && (
                <div className="space-y-3 border-t border-border/60 pt-4">
                  <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">
                    Projects Portfolio Sorting
                  </label>
                  <div className="space-y-2">
                    {resumeData.projects.map((proj, idx) => (
                      <DraggableItem
                        key={proj.id}
                        id={proj.id}
                        index={idx}
                        type={DRAG_TYPE_PROJ}
                        moveItem={moveProject}
                      >
                        <div className="flex justify-between items-center">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{proj.name}</div>
                            <div className="text-[10px] text-accent font-mono truncate">{proj.tech_stack.join(', ')}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem('proj', proj.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 rounded shrink-0 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </DraggableItem>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Column: Live Sorted Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
          <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
            <span className="text-sm font-semibold tracking-tight">Ordered Resume Layout</span>
            <span className="text-xs font-mono text-muted-foreground uppercase select-none">Preview only</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {resumeData ? (
              <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="text-center pb-6 border-b border-border">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{resumeData.personal_info.name}</h1>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mt-2">
                    <span>{resumeData.personal_info.email}</span>
                    <span>•</span>
                    <span>{resumeData.personal_info.phone}</span>
                    <span>•</span>
                    <span>{resumeData.personal_info.location}</span>
                  </div>
                </div>

                {/* Dynamically Ordered Sections */}
                {resumeData.section_order.map((sectionKey) => {
                  if (sectionKey === 'summary' && resumeData.summary) {
                    return (
                      <div key="summary" className="space-y-2 border-b border-border/30 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Summary</h3>
                        <p className="text-sm leading-relaxed text-foreground/90">{resumeData.summary}</p>
                      </div>
                    )
                  }

                  if (sectionKey === 'skills' && resumeData.skills) {
                    return (
                      <div key="skills" className="space-y-3 border-b border-border/30 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Skills</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                          <div>
                            <div className="text-muted-foreground uppercase mb-1">Languages</div>
                            <div className="text-foreground">{resumeData.skills.languages.join(', ')}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase mb-1">Frameworks</div>
                            <div className="text-foreground">{resumeData.skills.frameworks.join(', ')}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground uppercase mb-1">Tools</div>
                            <div className="text-foreground">{resumeData.skills.tools.join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (sectionKey === 'experience' && resumeData.experience.length > 0) {
                    return (
                      <div key="experience" className="space-y-4 border-b border-border/30 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Experience</h3>
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-foreground">{exp.position}</span>
                              <span className="font-mono text-muted-foreground text-xs">{exp.period}</span>
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">{exp.company}</div>
                            <ul className="list-disc pl-4 space-y-1">
                              {exp.bullets.map((bullet, idx) => (
                                <li key={idx} className="text-sm text-foreground/80 leading-relaxed">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  if (sectionKey === 'projects' && resumeData.projects.length > 0) {
                    return (
                      <div key="projects" className="space-y-4 border-b border-border/30 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Projects</h3>
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-foreground">{proj.name}</span>
                              <span className="text-xs font-mono text-accent">{proj.tech_stack.join(', ')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{proj.description}</div>
                            <ul className="list-disc pl-4 space-y-1">
                              {proj.bullets.map((bullet, idx) => (
                                <li key={idx} className="text-sm text-foreground/80 leading-relaxed">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  if (sectionKey === 'education' && resumeData.education.length > 0) {
                    return (
                      <div key="education" className="space-y-3 border-b border-border/30 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Education</h3>
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between text-sm">
                            <div>
                              <span className="font-semibold text-foreground">{edu.institution}</span>
                              <span className="text-xs text-muted-foreground block">{edu.degree}</span>
                            </div>
                            <span className="font-mono text-muted-foreground text-xs">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  if (sectionKey === 'achievements' && resumeData.achievements.length > 0) {
                    return (
                      <div key="achievements" className="space-y-2 pb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">Achievements</h3>
                        <ul className="list-disc pl-4 space-y-1">
                          {resumeData.achievements.map((ach, idx) => (
                            <li key={idx} className="text-sm text-foreground/80 leading-relaxed">{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  }

                  return null
                })}

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/20">
                <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <span className="text-xs font-mono text-muted-foreground uppercase">Empty preview</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </DndProvider>
  )
}
