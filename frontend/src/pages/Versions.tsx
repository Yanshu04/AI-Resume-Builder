import React, { useState, useEffect } from 'react'
import api from '../lib/api'
import { 
  History, Plus, Trash2, ArrowUpRight, CheckCircle2, 
  AlertTriangle, Eye, ShieldAlert, Sparkles, FileJson, Calendar
} from 'lucide-react'

interface VersionItem {
  id: number
  name: string
  created_at: string
}

export default function Versions() {
  const [versions, setVersions] = useState<VersionItem[]>([])
  const [activeResumeJson, setActiveResumeJson] = useState<any | null>(null)
  
  const [versionName, setVersionName] = useState('')
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch all versions and active resume details
  const fetchData = async () => {
    try {
      const versionsRes = await api.get('/resume/versions')
      setVersions(versionsRes.data)
      
      const activeRes = await api.get('/resume/active')
      setActiveResumeJson(activeRes.data.resume_json)
    } catch (err) {
      setError('Failed to fetch version and resume configurations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Create a new snapshot of the current active resume draft
  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!versionName.trim() || !activeResumeJson) return

    setActionLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post('/resume/version', {
        name: versionName.trim(),
        resume_json: activeResumeJson
      })
      setVersionName('')
      setSuccess('Successfully snapshotted your active resume draft!')
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create resume version snapshot.')
    } finally {
      setActionLoading(false)
    }
  }

  // Load a historical version to override the active resume
  const handleLoadVersion = async (id: number) => {
    setActionLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Fetch version details
      const detailRes = await api.get(`/resume/version/${id}`)
      const targetJson = detailRes.data.resume_json

      // 2. Overwrite active resume in Postgres
      await api.put('/resume/active', {
        resume_json: targetJson
      })

      // 3. Update preview state
      setActiveResumeJson(targetJson)
      setSelectedVersion(detailRes.data)
      setSuccess(`Active resume replaced with version "${detailRes.data.name}"!`)
      
      await fetchData()
    } catch (err: any) {
      setError('Failed to load version details.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete a historical version snapshot
  const handleDeleteVersion = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this version? This action is irreversible.')) {
      return
    }

    setActionLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.delete(`/resume/version/${id}`)
      setSuccess('Deleted version snapshot.')
      if (selectedVersion?.id === id) {
        setSelectedVersion(null)
      }
      await fetchData()
    } catch (err: any) {
      setError('Failed to delete version snapshot.')
    } finally {
      setActionLoading(false)
    }
  }

  // Inspect version details in the preview panel
  const handleInspectVersion = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/resume/version/${id}`)
      setSelectedVersion(res.data)
    } catch (err) {
      setError('Failed to fetch version specifications.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground h-[calc(100vh-73px)]">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase animate-pulse">Loading Version Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-foreground h-full overflow-hidden font-sans">
      
      {/* Left Column: Form and Version List */}
      <div className="w-full md:w-96 border-r border-border bg-card/25 p-6 flex flex-col shrink-0 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            Version Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Snapshot your active resume profile, load historical checkpoints, or clean up outdated versions.
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

        {/* 1. Save Snapshot Form */}
        <form onSubmit={handleSaveVersion} className="space-y-3.5 border-b border-border/60 pb-5">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">Snapshot Version Name</label>
            <input
              type="text"
              required
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g. Tailored for Google, V1 draft"
              className="w-full bg-background border border-border rounded p-2.5 text-xs focus:outline-none focus:border-accent text-foreground font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading || !versionName.trim()}
            className="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-40 transition py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Snapshot Active Resume
          </button>
        </form>

        {/* 2. List of snapshots */}
        <div className="space-y-3 flex-1">
          <label className="block text-xs uppercase font-mono text-muted-foreground font-semibold">
            Saved History ({versions.length})
          </label>
          {versions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg bg-card/10">
              <History className="h-8 w-8 text-muted-foreground/20 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">No historical checkpoints found.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {versions.map((ver) => (
                <div 
                  key={ver.id}
                  className={`p-3.5 rounded-lg border flex flex-col gap-2 transition ${
                    selectedVersion?.id === ver.id 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border bg-card/40 hover:border-border/80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">{ver.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5 shrink-0 mt-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(ver.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 justify-end border-t border-border/40 pt-2.5">
                    <button
                      onClick={() => handleInspectVersion(ver.id)}
                      className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                      title="Inspect Snapshot Contents"
                    >
                      <Eye className="h-3 w-3 inline mr-1" />
                      Inspect
                    </button>
                    
                    <button
                      onClick={() => handleLoadVersion(ver.id)}
                      className="px-2 py-1 rounded text-[10px] font-mono uppercase bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition"
                      title="Apply version to editor"
                    >
                      <ArrowUpRight className="h-3 w-3 inline mr-1" />
                      Load
                    </button>
                    
                    <button
                      onClick={() => handleDeleteVersion(ver.id)}
                      className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-border text-muted-foreground hover:text-red-400 hover:bg-red-950/10 transition"
                      title="Delete snapshot"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Inspect JSON Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-card/10">
        <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold tracking-tight">
            {selectedVersion ? `Inspecting Checklist: "${selectedVersion.name}"` : 'Current Active Draft Outline'}
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1">
            <FileJson className="h-3.5 w-3.5 text-accent" />
            Structural JSON Schema
          </span>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-black/40 font-mono text-xs text-foreground/80 leading-relaxed">
          {selectedVersion ? (
            <pre className="p-4 rounded bg-background/50 border border-border overflow-x-auto text-accent">
              {JSON.stringify(selectedVersion.resume_json, null, 2)}
            </pre>
          ) : activeResumeJson ? (
            <pre className="p-4 rounded bg-background/50 border border-border overflow-x-auto text-foreground/75">
              {JSON.stringify(activeResumeJson, null, 2)}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <FileJson className="h-10 w-10 text-muted-foreground/30 mb-2 animate-bounce" />
              <span className="text-xs text-muted-foreground uppercase">No profile outline loaded</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
