import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, PenTool, Users, Settings, Database, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, backendStatus } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'creator', label: 'Create Story', icon: PenTool },
    { id: 'character-library', label: 'Characters', icon: Users },
    { id: 'settings', label: 'API Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-dark-800/40 backdrop-blur-xl border-r border-slate-800/60 p-6 flex flex-col justify-between z-10">
      <div>
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-gradient-to-tr from-brand-violet to-brand-cyan p-2.5 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI StoryVerse
            </h1>
            <span className="text-[10px] text-brand-cyan font-bold tracking-widest uppercase">
              Idea to Cinema
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'creator' && activeTab === 'cinema');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-violet/20 to-brand-cyan/10 border-l-4 border-brand-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend / Db Status indicator */}
      <div className="bg-dark-900/60 border border-slate-800/70 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400 font-semibold">Engine Status</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${
            backendStatus === 'online' ? 'bg-brand-emerald animate-pulse' : 'bg-brand-rose'
          }`} />
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {backendStatus === 'online' ? (
            <span>Connected to server & database</span>
          ) : (
            <span>Offline (Browser LocalStorage)</span>
          )}
        </div>
      </div>
    </aside>
  );
}
