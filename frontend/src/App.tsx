import React, { useState } from 'react'
import ChatBuilder from './pages/ChatBuilder'
import AIContentGenerators from './pages/AIContentGenerators'
import ProjectGenerator from './pages/ProjectGenerator'
import JDOptimizer from './pages/JDOptimizer'
import Templates from './pages/Templates'
import Editor from './pages/Editor'
import Importer from './pages/Importer'
import Versions from './pages/Versions'
import Exporter from './pages/Exporter'
import { 
  MessageSquare, FileText, Layout, Zap, FileDown, History, Download, Sparkles, Folder
} from 'lucide-react'

type ActiveTab = 'chat' | 'editor' | 'templates' | 'optimize' | 'import' | 'versions' | 'export' | 'generators' | 'projects'

export default function App() {
  // Sidebar navigation state
  const [activeView, setActiveView] = useState<ActiveTab>('chat')

  // Helper to render current active panel view
  const renderActiveView = () => {
    switch (activeView) {
      case 'chat':
        return <ChatBuilder />
      case 'generators':
        return <AIContentGenerators />
      case 'projects':
        return <ProjectGenerator />
      case 'editor':
        return <Editor />
      case 'templates':
        return <Templates />
      case 'optimize':
        return <JDOptimizer />
      case 'import':
        return <Importer />
      case 'versions':
        return <Versions />
      case 'export':
        return <Exporter />
      default:
        return <ChatBuilder />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-background">
      
      {/* Top Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight select-none">
            RESUME<span className="text-accent">.AI</span>
          </span>
          <span className="text-xs uppercase font-mono px-2 py-0.5 border border-accent/20 text-accent bg-accent/5 rounded">
            v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Local Workspace</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/25 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-4 space-y-1.5">
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase px-3 mb-2 font-semibold">
              Core Modules
            </div>
            <button
              onClick={() => setActiveView('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'chat' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat Builder
            </button>
            <button
              onClick={() => setActiveView('generators')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'generators' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Toolkit
            </button>
            <button
              onClick={() => setActiveView('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'projects' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Folder className="h-4 w-4" />
              Project Gen
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'editor' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <FileText className="h-4 w-4" />
              Resume Editor
            </button>
            <button
              onClick={() => setActiveView('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'templates' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Layout className="h-4 w-4" />
              Templates
            </button>
            <button
              onClick={() => setActiveView('optimize')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'optimize' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Zap className="h-4 w-4" />
              Optimize JD
            </button>
            <button
              onClick={() => setActiveView('import')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'import' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <FileDown className="h-4 w-4" />
              Import Profile
            </button>
            <button
              onClick={() => setActiveView('versions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'versions' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <History className="h-4 w-4" />
              Versions
            </button>
            <button
              onClick={() => setActiveView('export')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                activeView === 'export' 
                  ? 'bg-accent text-background font-semibold shadow-md shadow-accent/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Download className="h-4 w-4" />
              Export Resume
            </button>
          </div>
          <div className="p-4 border-t border-border bg-background/50 font-mono text-[9px] text-muted-foreground uppercase tracking-widest space-y-1 select-none">
            <div>SESSION: ACTIVE</div>
            <div>LLM: QWEN2.5 (1.5B)</div>
          </div>
        </aside>

        {/* Active Panel View */}
        {renderActiveView()}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <span className="text-xs font-mono text-muted-foreground">
          LOCAL SINGLE-USER WORKSPACE // ANONYMOUS
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          OFFLINE LLM INFERENCE MODULE CONNECTED
        </span>
      </footer>
    </div>
  )
}
