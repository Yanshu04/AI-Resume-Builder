
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
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-full overflow-hidden">
      
      {/* Left Pane: Comic Dialogue Interface */}
      <div className="flex-1 flex flex-col border-b-[2.5px] md:border-b-0 md:border-r-[2.5px] border-black h-full bg-white relative">
        <div className="p-3.5 border-b-[2.5px] border-black bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-xs border-2 border-black shadow-manga-sm -rotate-2 select-none">
              話
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm uppercase tracking-wide">Dialogue Arc</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-300 text-black border border-black shadow-[1.5px_1.5px_0px_#111111]">
                  SCENE: {currentStep.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">Conversational script shaping your resume chapters</p>
            </div>
          </div>
          {isComplete && (
            <span className="flex items-center gap-1.5 text-xs font-black uppercase text-black bg-emerald-300 px-2.5 py-1 border-2 border-black shadow-manga-sm">
              <CheckCircle className="h-3.5 w-3.5" /> ARC COMPLETED!
            </span>
          )}
        </div>

        {/* Messages Body with Manga Dialogue Balloons */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#FBFBFA] manga-screentone">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs shrink-0 border-2 border-black shadow-manga-sm font-black ${
                  msg.sender === 'user' ? 'bg-accent text-white' : 'bg-black text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>
              <div className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black shadow-[1px_1px_0px_#111111] ${
                  msg.sender === 'user' ? 'bg-black text-white' : 'bg-secondary text-black'
                }`}>
                  {msg.sender === 'user' ? 'YOU // PROTAGONIST' : 'AI SENSEI'}
                </div>
                <div
                  className={`p-4 border-2 border-black text-sm leading-relaxed rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-[#FFF1F2] text-black font-semibold shadow-[3.5px_3.5px_0px_#E11D48] text-left'
                      : 'bg-white text-black font-medium shadow-manga'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-[10px] font-mono text-stone-500 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 bg-black border-2 border-black text-white flex items-center justify-center shadow-manga-sm">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white border-2 border-black p-3.5 shadow-manga rounded-lg flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-black mr-1">INKING...</span>
                <span className="w-2.5 h-2.5 bg-black rounded-none border border-black animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-accent rounded-none border border-black animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-2.5 bg-black rounded-none border border-black animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2 items-center bg-rose-100 border-2 border-black text-black p-3.5 text-xs font-bold shadow-manga">
              <ShieldAlert className="h-4 w-4 text-accent shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer: Comic Dialogue Box */}
        <div className="p-3.5 border-t-[2.5px] border-black bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAiTyping || isComplete}
              placeholder={isComplete ? "Arc complete! Inspect the manuscript page on the right." : "Type your dialogue response here..."}
              className="flex-1 bg-white border-2 border-black px-4 py-2.5 text-sm font-medium text-black placeholder:text-stone-400 focus:outline-none focus:shadow-manga transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isAiTyping || isComplete || !inputText.trim()}
              className="bg-accent text-white hover:bg-rose-600 disabled:opacity-50 transition-all px-5 py-2.5 border-2 border-black shadow-manga flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider shrink-0 active:translate-x-0.5 active:translate-y-0.5 active:shadow-manga-sm"
            >
              <Send className="h-4 w-4" />
              <span>SEND!</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Live Manuscript Page Proof */}
      <div className="flex-1 flex flex-col h-full bg-[#F3F3F0] manga-action-lines overflow-hidden">
        <div className="p-3.5 border-b-[2.5px] border-black bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 font-black text-[11px] uppercase border border-black shadow-[1.5px_1.5px_0px_#E11D48]">
              MANUSCRIPT
            </span>
            <span className="text-sm font-black tracking-wide uppercase">Live Page Proof</span>
          </div>
          {isGeneratingPreview && (
            <span className="text-xs font-black uppercase text-accent animate-pulse px-2 py-0.5 bg-rose-50 border border-accent">
              INKING REVISION...
            </span>
          )}
        </div>

        {/* Resume Preview Body: Manuscript Paper */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {resumeData ? (
            <div className="max-w-2xl mx-auto bg-white border-[2.5px] border-black p-8 shadow-manga-lg space-y-6 font-sans relative">
              
              {/* Corner Chapter Proof Mark */}
              <div className="absolute top-2 right-2 text-[9px] font-black text-stone-500 border border-black px-1.5 py-0.5 uppercase bg-yellow-100">
                PROOF // PAGE 01
              </div>

              {/* Header */}
              <div className="text-center pb-6 border-b-2 border-black">
                <h1 className="text-2xl font-black uppercase tracking-tight text-black">{resumeData.personal_info.name}</h1>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-bold text-stone-600 mt-2">
                  <span>{resumeData.personal_info.email}</span>
                  <span>•</span>
                  <span>{resumeData.personal_info.phone}</span>
                  <span>•</span>
                  <span>{resumeData.personal_info.location}</span>
                </div>
                <div className="flex justify-center gap-x-4 text-xs font-bold text-accent mt-1.5">
                  {resumeData.personal_info.linkedin && <span>{resumeData.personal_info.linkedin}</span>}
                  {resumeData.personal_info.github && <span>{resumeData.personal_info.github}</span>}
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Professional Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-black font-medium">{resumeData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience && resumeData.experience.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Professional Experience
                  </h3>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1.5 border-l-2 border-black pl-3 py-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-black text-black">{exp.position}</span>
                        <span className="font-mono font-bold text-stone-600 text-xs">{exp.period}</span>
                      </div>
                      <div className="text-xs font-bold text-accent uppercase tracking-wider">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-stone-800 leading-relaxed font-medium">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Featured Projects
                  </h3>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1.5 border-l-2 border-black pl-3 py-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-black text-black">{proj.name}</span>
                        <span className="text-xs font-mono font-bold text-accent">
                          {proj.tech_stack.join(', ')}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 font-medium">{proj.description}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-stone-800 leading-relaxed font-medium">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Arsenal & Skills
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-2 border border-black bg-stone-50">
                      <div className="text-black uppercase tracking-wider mb-1 font-black">Languages</div>
                      <div className="text-stone-800 font-medium">{resumeData.skills.languages.join(', ')}</div>
                    </div>
                    <div className="p-2 border border-black bg-stone-50">
                      <div className="text-black uppercase tracking-wider mb-1 font-black">Frameworks</div>
                      <div className="text-stone-800 font-medium">{resumeData.skills.frameworks.join(', ')}</div>
                    </div>
                    <div className="p-2 border border-black bg-stone-50">
                      <div className="text-black uppercase tracking-wider mb-1 font-black">Tools</div>
                      <div className="text-stone-800 font-medium">{resumeData.skills.tools.join(', ')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Education
                  </h3>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-l-2 border-black pl-3">
                      <div>
                        <span className="font-black text-black">{edu.institution}</span>
                        <span className="text-xs text-stone-600 font-medium block">{edu.degree}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-600 text-xs">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {resumeData.achievements && resumeData.achievements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black bg-yellow-200 border border-black inline-block px-2 py-0.5 shadow-[1.5px_1.5px_0px_#111111]">
                    Achievements
                  </h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {resumeData.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm text-stone-800 leading-relaxed font-medium">{ach}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-[2.5px] border-dashed border-black bg-white shadow-manga">
              <div className="w-14 h-14 bg-yellow-300 border-2 border-black shadow-manga flex items-center justify-center mb-4 rotate-3">
                <Sparkles className="h-7 w-7 text-black" />
              </div>
              <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-wider mb-2 -rotate-1 shadow-[2px_2px_0px_#E11D48]">
                PANEL 01: ORIGIN ARC
              </span>
              <h3 className="font-black text-lg text-black mb-1">AWAITING SCRIPT INPUT</h3>
              <p className="text-xs text-stone-600 max-w-sm font-medium leading-relaxed">
                Respond to the dialogue arc on the left. Your career milestones, projects, and powers will ink onto this manuscript proof in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
