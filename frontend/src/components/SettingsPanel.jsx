import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Key, ShieldCheck, HelpCircle } from 'lucide-react';

export default function SettingsPanel() {
  const { settings, setSettings, backendStatus } = useApp();
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || '');
  const [openaiKey, setOpenAIKey] = useState(settings.openaiKey || '');

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({
      geminiKey: geminiKey.trim(),
      openaiKey: openaiKey.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          System Settings
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Configure API credentials to unlock custom storytelling capabilities.
        </p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-brand-violet/5 border border-brand-violet/20 rounded-2xl mb-4">
            <ShieldCheck className="w-6 h-6 text-brand-violet shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Local Security Guarantee:</strong> Credentials entered here are saved solely inside your browser's private <code className="text-brand-cyan">localStorage</code>. They are passed directly to API requests to fetch stories, and are never saved permanently on our server databases.
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-cyan" />
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                Get Free Gemini Key <HelpCircle className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full glass-input pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showGemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Used as the primary language model engine for generating scene descriptions and detailed creative prompts.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-violet" />
                OpenAI API Key
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-violet hover:underline flex items-center gap-1"
              >
                Get OpenAI Key <HelpCircle className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenAI ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
                className="w-full glass-input pr-12 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showOpenAI ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Alternative engine for story creation. If both keys are present, the Gemini Key is selected by default.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button type="submit" className="btn-primary py-2.5 px-8 text-sm">
              Save Credentials
            </button>
            {saveSuccess && (
              <span className="text-brand-emerald text-sm font-semibold animate-pulse">
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-200 mb-2">Zero-Setup fallback</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          If you do not specify an API Key, **AI StoryVerse** will run in **Simulated Mode**. It generates complete, randomized stories using a built-in prompt engine, creates images using the free, keyless **Pollinations.ai** service, and uses the browser's local **Web Speech API** for narrator voiceovers.
        </p>
      </div>
    </div>
  );
}
