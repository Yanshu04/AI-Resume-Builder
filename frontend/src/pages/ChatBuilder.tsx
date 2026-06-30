import React, { useState, useEffect, useRef } from 'react'
import api from '../lib/api'
import { Send, Sparkles, User, ShieldAlert, CheckCircle, ListRestart, HelpCircle } from 'lucide-react'

interface Message {
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
}

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

export default function ChatBuilder() {
  // Session ID generated once on mount
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 15))
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [currentStep, setCurrentStep] = useState('profession')
  const [isComplete, setIsComplete] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Real-time resume preview state
  const [resumeData, setResumeData] = useState<ResumeJson | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Start session and fetch initial greeting
  useEffect(() => {
    const initSession = async () => {
      setIsAiTyping(true)
      try {
        const res = await api.post('/chat', {
          session_id: sessionId,
          message: 'START'
        })
        setMessages([
          {
            sender: 'ai',
            text: res.data.reply,
            timestamp: new Date()
          }
        ])
        setCurrentStep(res.data.current_step)
      } catch (err: any) {
        setError('Failed to connect to the interview engine.')
      } finally {
        setIsAiTyping(false)
      }
    }
    initSession()
  }, [sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiTyping])

  // Fetch updated resume JSON draft from backend
  const fetchResumePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      const res = await api.post('/chat/generate', {
        session_id: sessionId,
        message: 'GENERATE'
      })
      setResumeData(res.data.resume_json)
    } catch (err) {
      console.error('Error auto-generating preview:', err)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isAiTyping) return

    const userMsgText = inputText.trim()
    setInputText('')
    setError(null)

    // Append user message immediately
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsgText, timestamp: new Date() }
    ])

    setIsAiTyping(true)

    try {
      const res = await api.post('/chat', {
        session_id: sessionId,
        message: userMsgText
      })

      // Append AI response
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.data.reply, timestamp: new Date() }
      ])
      
      setCurrentStep(res.data.current_step)
      setIsComplete(res.data.is_complete)

      // Fetch updated resume JSON preview in background to show real-time progress
      await fetchResumePreview()

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to deliver message. Check backend connection.')
    } finally {
      setIsAiTyping(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden">
      
      {/* Left Pane: Chat Interface */}
      <div className="flex-1 flex flex-col border-r border-border h-full bg-background relative">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <div>
              <h2 className="font-semibold text-sm">Resume Builder Chat</h2>
              <p className="text-xs text-muted-foreground font-mono">STEP: {currentStep.toUpperCase()}</p>
            </div>
          </div>
          {isComplete && (
            <span className="flex items-center gap-1 text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 border border-accent/20 rounded">
              <CheckCircle className="h-3 w-3" /> Interview Complete
            </span>
          )}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user' ? 'bg-accent text-background' : 'bg-secondary border border-border text-accent'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent text-background font-medium'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-secondary border border-border text-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-4 rounded-lg text-xs font-mono">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-border bg-card/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAiTyping || isComplete}
              placeholder={isComplete ? "Interview complete. Review your resume preview." : "Type your response here..."}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-accent disabled:opacity-50 text-sm font-sans"
            />
            <button
              type="submit"
              disabled={isAiTyping || isComplete || !inputText.trim()}
              className="bg-accent text-background hover:bg-accent/90 disabled:opacity-50 transition px-5 rounded-lg flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Live Resume Preview */}
      <div className="flex-1 flex flex-col h-full bg-card/25 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Live Draft Preview</span>
          {isGeneratingPreview && (
            <span className="text-xs font-mono text-accent animate-pulse uppercase">Updating Draft...</span>
          )}
        </div>

        {/* Resume Preview Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {resumeData ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-8 shadow-xl space-y-6 font-sans">
              
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
                <div className="flex justify-center gap-x-4 text-xs font-mono text-accent mt-1">
                  {resumeData.personal_info.linkedin && <span>{resumeData.personal_info.linkedin}</span>}
                  {resumeData.personal_info.github && <span>{resumeData.personal_info.github}</span>}
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Professional Summary</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{resumeData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience && resumeData.experience.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Professional Experience</h3>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">{exp.position}</span>
                        <span className="font-mono text-muted-foreground text-xs">{exp.period}</span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-foreground/80 leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Projects</h3>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">{proj.name}</span>
                        <span className="text-xs font-mono text-accent">
                          {proj.tech_stack.join(', ')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{proj.description}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-foreground/80 leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Skills System</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Languages</div>
                      <div className="text-foreground">{resumeData.skills.languages.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Frameworks</div>
                      <div className="text-foreground">{resumeData.skills.frameworks.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Tools</div>
                      <div className="text-foreground">{resumeData.skills.tools.join(', ')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Education</h3>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div>
                        <span className="font-semibold text-foreground">{edu.institution}</span>
                        <span className="text-xs text-muted-foreground block">{edu.degree}</span>
                      </div>
                      <span className="font-mono text-muted-foreground text-xs">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {resumeData.achievements && resumeData.achievements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-border/40 pb-1">Achievements</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {resumeData.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm text-foreground/80 leading-relaxed">{ach}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/20">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground mb-1">No Draft Compiled Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                As you chat with the AI builder, your professional qualifications will structure and populate here in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
