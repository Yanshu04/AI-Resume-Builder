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
    <div className="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-hidden">
      
      {/* Top Manga Header */}
      <header className="border-b-[2.5px] border-black bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-[0_2px_0px_#111111]">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="bg-black text-white font-black text-lg px-2.5 py-1 tracking-wider border-2 border-black -rotate-1 shadow-manga-sm select-none">
              RESUME
            </span>
            <span className="bg-accent text-white font-black text-lg px-2 py-1 tracking-wider border-2 border-black rotate-1 -ml-1 shadow-manga-sm select-none">
              MANGA
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_#111111] -rotate-2 select-none">
            VOL. 01 ⚡
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary border-2 border-black shadow-manga-sm text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
            <span>HUMAN STUDIO // ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Layout: Comic Panels & Gutters */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-background manga-screentone">
        {/* Sidebar: Comic Navigation Strip */}
        <aside className="w-full md:w-64 border-b-[2.5px] md:border-b-0 md:border-r-[2.5px] border-black bg-white flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-3.5 space-y-2">
            <div className="text-[10px] font-black tracking-widest text-black uppercase px-2 mb-2 flex items-center justify-between border-b-2 border-black pb-1">
              <span>// CHAPTERS & PANELS //</span>
              <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-mono">ARC 1</span>
            </div>
            
            <button
              onClick={() => setActiveView('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'chat' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Chat Interview</span>
            </button>

            <button
              onClick={() => setActiveView('generators')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'generators' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>AI Power Tools</span>
            </button>

            <button
              onClick={() => setActiveView('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'projects' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span>Project Arc</span>
            </button>

            <button
              onClick={() => setActiveView('editor')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'editor' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Manuscript Editor</span>
            </button>

            <button
              onClick={() => setActiveView('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'templates' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <Layout className="h-4 w-4 shrink-0" />
              <span>Visual Layouts</span>
            </button>

            <button
              onClick={() => setActiveView('optimize')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'optimize' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <Zap className="h-4 w-4 shrink-0" />
              <span>JD Match Audit</span>
            </button>

            <button
              onClick={() => setActiveView('import')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'import' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <FileDown className="h-4 w-4 shrink-0" />
              <span>Import Script</span>
            </button>

            <button
              onClick={() => setActiveView('versions')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'versions' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <History className="h-4 w-4 shrink-0" />
              <span>History Volumes</span>
            </button>

            <button
              onClick={() => setActiveView('export')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold border-2 border-black transition-all ${
                activeView === 'export' 
                  ? 'bg-accent text-white shadow-manga translate-x-[-1px] translate-y-[-1px]' 
                  : 'bg-white text-black hover:bg-yellow-50 hover:shadow-manga-sm'
              }`}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Publish & Print</span>
            </button>
          </div>

          <div className="p-3 border-t-2 border-black bg-secondary text-[10px] font-bold text-black uppercase tracking-wider space-y-1 select-none">
            <div className="flex justify-between items-center">
              <span>MANGA ENGINE</span>
              <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-black">LOCAL INK</span>
            </div>
            <div className="text-muted-foreground font-mono text-[9px]">OFFLINE MODEL READY</div>
          </div>
        </aside>

        {/* Active Panel View */}
        {renderActiveView()}
      </div>

      {/* Footer: Manga Issue Details */}
      <footer className="border-t-[2.5px] border-black bg-white px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black shadow-[1.5px_1.5px_0px_#E11D48]">ISSUE #01</span>
          <span>HUMAN-CRAFTED MANGA RESUME STUDIO</span>
        </div>
        <div className="flex items-center gap-3 text-stone-600 text-[11px] font-mono">
          <span>HALFTONE GRID SYSTEM</span>
          <span>•</span>
          <span>2.5PX INK BORDERS</span>
        </div>
      </footer>
    </div>
  )
}
