import React, { useState, useEffect } from 'react'
import api from '../lib/api'
import { 
  Layout, Monitor, Tablet, Smartphone, FileText, Settings, 
  Palette, Type, Sliders, ShieldAlert, CheckCircle, RotateCcw
} from 'lucide-react'

interface TemplateMetadata {
  id: string
  name: string
  description: string
  recommended_for: string
}

// Sample baseline resume to preview layout changes
const BASELINE_RESUME = {
  personal_info: {
    name: "Jonathan Doe",
    email: "jonathan.doe@email.com",
    phone: "555-0105",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/jdoe",
    github: "github.com/jdoe"
  },
  summary: "Results-driven Software Architect with 8+ years of engineering experience. Specialized in building distributed backend architectures and responsive user interfaces.",
  experience: [
    {
      company: "Innovate Tech",
      position: "Lead Engineer",
      period: "2021 - Present",
      bullets: [
        "Architected a high-throughput processing engine in Go, reducing payload times by 40%.",
        "Managed a team of 5 engineers to deliver modular React dashboards for system operations."
      ]
    },
    {
      company: "Startup Hub",
      position: "Software Developer",
      period: "2018 - 2021",
      bullets: [
        "Built REST endpoints using FastAPI, supporting 10k+ daily active users.",
        "Integrated PostgreSQL connection pools to handle concurrent reporting requests."
      ]
    }
  ],
  projects: [
    {
      name: "Distributed Message Broker",
      description: "A lightweight TCP broker.",
      tech_stack: ["Python", "Docker", "Redis"],
      bullets: [
        "Optimized client handshake delays, ensuring stable packet distributions.",
        "Established automated Docker compositions for local orchestration tests."
      ]
    }
  ],
  skills: {
    languages: ["Go", "Python", "TypeScript", "SQL"],
    frameworks: ["React", "FastAPI", "Next.js"],
    tools: ["Docker", "Git", "Kubernetes", "PostgreSQL"]
  },
  education: [
    {
      institution: "University of Texas",
      degree: "B.S. in Computer Science",
      year: "2018"
    }
  ],
  achievements: [
    "Published white paper on system latency profiling.",
    "First place in annual developer hackathon (200+ competitors)."
  ]
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile' | 'a4'

const COLOR_PRESETS = [
  { name: 'Cyan Glow', hex: '#06B6D4' },
  { name: 'Azure Blue', hex: '#0078d4' },
  { name: 'Cardinal Red', hex: '#8C1515' },
  { name: 'Emerald', hex: '#107c41' },
  { name: 'Charcoal Black', hex: '#222222' }
]

const FONT_PRESETS = [
  { name: 'System Sans', css: 'system-ui, sans-serif' },
  { name: 'Inter Classic', css: 'Inter, sans-serif' },
  { name: 'Times Academic', css: "'Times New Roman', Times, serif" },
  { name: 'Georgia Serif', css: 'Georgia, serif' },
  { name: 'Segoe Corporate', css: "'Segoe UI', Tahoma, sans-serif" }
]

export default function Templates() {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  
  // Custom design configurations
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif')
  const [accentColor, setAccentColor] = useState('#06B6D4')
  const [margin, setMargin] = useState('20px')
  
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('a4')
  
  const [htmlPreview, setHtmlPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch templates metadata on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get<TemplateMetadata[]>('/templates')
        setTemplates(res.data)
      } catch (err) {
        setError('Failed to fetch template lists.')
      }
    }
    fetchTemplates()
  }, [])

  // Re-render HTML preview whenever layout or styling configuration modifications happen
  useEffect(() => {
    const fetchPreviewHtml = async () => {
      setLoading(true)
      try {
        const res = await api.post('/templates/preview', {
          template_id: selectedTemplate,
          resume_json: BASELINE_RESUME,
          config: {
            font_family: fontFamily,
            accent_color: accentColor,
            margin: margin
          }
        }, {
          headers: { 'Accept': 'text/html' }
        })
        
        setHtmlPreview(res.data)
      } catch (err) {
        setError('Error compiling live template preview.')
      } finally {
        setLoading(false)
      }
    }
    fetchPreviewHtml()
  }, [selectedTemplate, fontFamily, accentColor, margin])

  // Reset custom customizations back to defaults
  const handleResetDesign = () => {
    setFontFamily('Inter, sans-serif')
    setAccentColor('#06B6D4')
    setMargin('20px')
  }

  // Returns container widths matching active responsive device frames
  const getDeviceWidthClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] h-[550px] border border-border shadow-2xl rounded-2xl overflow-hidden'
      case 'tablet':
        return 'w-[768px] h-[700px] border border-border shadow-2xl rounded-xl overflow-hidden'
      case 'desktop':
        return 'w-full h-full min-h-[500px]'
      case 'a4':
        return 'w-[794px] h-[1123px] border border-border shadow-2xl bg-white overflow-y-auto'
      default:
        return 'w-[794px] h-[1123px] border border-border shadow-2xl bg-white overflow-y-auto'
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-full overflow-hidden font-sans">
      
      {/* Left Column: Selector Pickers and Design Panel */}
      <div className="w-full md:w-80 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <Layout className="h-5 w-5 text-accent animate-pulse" />
            Resume Layouts
          </h2>
          <p className="text-xs text-muted-foreground">
            Select layouts and customize typography, accent hues, and margins. Live updates inside the sandbox.
          </p>
        </div>

        {error && (
          <div className="flex gap-2 items-center bg-red-950/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs font-mono">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Template Layout Picker */}
        <div className="space-y-2.5">
          <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">Select Template</label>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate === tpl.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="text-xs font-semibold text-foreground">{tpl.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{tpl.description}</div>
                <div className="inline-block bg-secondary border border-border text-[9px] font-mono text-accent px-1.5 py-0.5 rounded mt-1.5">
                  {tpl.recommended_for}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme Customization Panel */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-muted-foreground font-semibold flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-accent" />
              Theme Settings
            </span>
            <button
              onClick={handleResetDesign}
              className="text-[10px] font-mono text-accent hover:underline flex items-center gap-1 uppercase"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Accent Color picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Accent Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setAccentColor(color.hex)}
                  title={color.name}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    accentColor === color.hex ? 'ring-2 ring-accent border-background' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Typography Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Type className="h-3 w-3" />
              Typography Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-xs focus:outline-none focus:border-accent text-foreground font-mono"
            >
              {FONT_PRESETS.map((font) => (
                <option key={font.css} value={font.css}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Margin Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Sliders className="h-3 w-3" />
              Page Margins
            </label>
            <select
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-xs focus:outline-none focus:border-accent text-foreground font-mono"
            >
              <option value="10px">Narrow (10px)</option>
              <option value="20px">Normal (20px)</option>
              <option value="30px">Wide (30px)</option>
              <option value="40px">Extra Wide (40px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Preview Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/15">
        
        {/* Device toggle header */}
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold tracking-tight">Live Layout Sandbox</span>
          
          <div className="flex items-center gap-1.5 bg-background border border-border p-1 rounded-lg">
            <button
              onClick={() => setDeviceMode('a4')}
              className={`p-1.5 rounded transition ${deviceMode === 'a4' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground'}`}
              title="A4 Print Page"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded transition ${deviceMode === 'desktop' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground'}`}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded transition ${deviceMode === 'tablet' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground'}`}
              title="Tablet View"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded transition ${deviceMode === 'mobile' ? 'bg-accent text-background' : 'text-muted-foreground hover:text-foreground'}`}
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sandboxed iframe workspace */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-card/5 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
            </div>
          )}

          <div className={`${getDeviceWidthClass()} transition-all duration-300`}>
            {htmlPreview ? (
              <iframe
                title="Resume HTML Preview"
                srcDoc={htmlPreview}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-card border border-border rounded-xl">
                <Layout className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <span className="text-xs font-mono text-muted-foreground uppercase">Compiling template...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
