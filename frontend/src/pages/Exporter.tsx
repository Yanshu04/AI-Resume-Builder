import React, { useState } from 'react'
import api from '../lib/api'
import { 
  Download, FileText, CheckCircle2, AlertTriangle, 
  Palette, Type, Sliders, ShieldAlert, Sparkles
} from 'lucide-react'

type FileFormat = 'pdf' | 'docx' | 'markdown' | 'json'

export default function Exporter() {
  const [format, setFormat] = useState<FileFormat>('pdf')
  const [font, setFont] = useState('Inter, sans-serif')
  const [color, setColor] = useState('#0078d4')
  const [margin, setMargin] = useState('20px')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Fetch the user's latest active resume draft from Postgres
      const activeRes = await api.get('/resume/active')
      const resumeJson = activeRes.data.resume_json

      if (!resumeJson) {
        setError('No active resume content available to export.')
        setLoading(false)
        return
      }

      // 2. Trigger the direct browser download via window.location.href
      const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api'
      const downloadUrl = `${baseUrl}/export/download?format=${format}&font=${encodeURIComponent(font)}&color=${encodeURIComponent(color)}&margin=${encodeURIComponent(margin)}`
      
      window.location.href = downloadUrl

      setSuccess(`Successfully exported your resume to ${format.toUpperCase()}!`)
    } catch (err: any) {
      setError('Export transaction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-[calc(100vh-73px)] overflow-hidden font-sans">
      
      {/* Left Column: Selector Form */}
      <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <Download className="h-5 w-5 text-accent" />
            Resume Exporter
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure styling dimensions and choose your preferred download format.
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
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. Format Choice Cards */}
        <div className="space-y-2.5">
          <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">1. Choose Format</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'pdf', name: 'PDF Document', desc: 'Recruiter Ready' },
              { id: 'docx', name: 'Word DOCX', desc: 'Editable Format' },
              { id: 'markdown', name: 'Markdown Text', desc: 'GitHub / Readme' },
              { id: 'json', name: 'JSON Schema', desc: 'Raw Backup' }
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id as FileFormat)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  format === fmt.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="text-xs font-semibold text-foreground">{fmt.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{fmt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Custom Styling Configurations */}
        <div className="space-y-4 border-t border-border/80 pt-4">
          <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">2. Style Configuration</label>

          {/* Accent Color picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Theme Colors
            </label>
            <div className="flex gap-2">
              {[
                { name: 'Azure Blue', hex: '#0078d4' },
                { name: 'Cardinal Red', hex: '#8C1515' },
                { name: 'Forest Green', hex: '#107c41' },
                { name: 'Neutral Dark', hex: '#222222' }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border transition ${
                    color === c.hex ? 'ring-2 ring-accent border-background' : 'border-border'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Typography dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              Font Style
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full bg-background border border-border rounded p-2 text-xs focus:outline-none focus:border-accent text-foreground font-mono"
            >
              <option value="Arial, Helvetica, sans-serif">Arial Sans</option>
              <option value="Inter, sans-serif">Inter Clean</option>
              <option value="Georgia, serif">Georgia Serif</option>
              <option value="Times New Roman, Times, serif">Times serif</option>
            </select>
          </div>

          {/* Margins dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
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
            </select>
          </div>
        </div>

        {/* 3. Export Action Button */}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
        >
          {loading ? 'Generating Document...' : 'Download Document'}
        </button>
      </div>

      {/* Right Column: Information layout */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold tracking-tight">Export Blueprint Specifications</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">Format validator</span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-card border border-border p-6 rounded-xl space-y-4 text-center">
            <FileText className="h-12 w-12 text-accent/80 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase font-mono text-foreground">File Format Checklist</h3>
              <p className="text-xs text-muted-foreground">
                Downloads are compiled in real-time. PDF renders vector layout pages; Word DOCX provides editable corporate structures.
              </p>
            </div>
            <div className="border-t border-border pt-4 text-left space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex justify-between">
                <span>Active Target:</span>
                <span className="text-foreground">Master active profile</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Format:</span>
                <span className="text-accent uppercase font-bold">{format}</span>
              </div>
              <div className="flex justify-between">
                <span>Theme Color:</span>
                <span className="text-foreground">{color}</span>
              </div>
              <div className="flex justify-between">
                <span>Font Family:</span>
                <span className="text-foreground font-sans">{font}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
