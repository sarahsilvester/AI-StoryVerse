import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, RotateCw, Save, Film, ArrowLeft, Edit3, Image as ImageIcon } from 'lucide-react';

export default function StoryBoard() {
  const { activeStory, setActiveStory, updateStory, setActiveTab } = useApp();
  const [editedScenes, setEditedScenes] = useState([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [playingScene, setPlayingScene] = useState(null);

  // Initialize form fields when activeStory loads
  useEffect(() => {
    if (activeStory) {
      setTitle(activeStory.title);
      setEditedScenes(activeStory.scenes || []);
    }
  }, [activeStory]);

  if (!activeStory) return null;

  const handleFieldChange = (index, field, value) => {
    setEditedScenes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRegeneratePanel = (index) => {
    const scene = editedScenes[index];
    const cleanPrompt = encodeURIComponent(`${scene.imagePrompt}, digital art, detailed, epic`);
    const newSeed = Math.floor(Math.random() * 100000);
    const newUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=500&nologo=true&seed=${newSeed}`;
    
    handleFieldChange(index, 'imageUrl', newUrl);
  };

  const handleSpeechPreview = (text, index) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingScene === index) {
        setPlayingScene(null);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a nice narrative voice
      const voices = window.speechSynthesis.getVoices();
      const EnglishVoice = voices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('google')) || 
                           voices.find(v => v.lang.includes('en')) || 
                           voices[0];
      if (EnglishVoice) utterance.voice = EnglishVoice;
      
      utterance.rate = 0.95; // Slightly slower for readability
      
      utterance.onstart = () => setPlayingScene(index);
      utterance.onend = () => setPlayingScene(null);
      utterance.onerror = () => setPlayingScene(null);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser.');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateStory(activeStory._id, {
        title,
        scenes: editedScenes
      });
      alert('Story saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save story changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              setActiveStory(null);
              setActiveTab('dashboard');
            }}
            className="p-2.5 rounded-xl bg-dark-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl md:text-3xl font-extrabold tracking-tight bg-transparent text-white border-b border-transparent focus:border-slate-700 hover:border-slate-800 focus:outline-none transition-all px-1"
            />
            <p className="text-slate-400 text-xs mt-1">
              Genre: <span className="text-brand-cyan font-semibold uppercase">{activeStory.genre}</span> &bull; 
              Style: <span className="text-brand-violet font-semibold uppercase">{activeStory.style}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="btn-secondary py-2.5 text-sm"
          >
            <Save className="w-4.5 h-4.5" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              setActiveTab('cinema');
            }}
            className="btn-primary py-2.5 text-sm"
          >
            <Film className="w-4.5 h-4.5 text-white" />
            Play Cinema Studio
          </button>
        </div>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {editedScenes.map((scene, index) => (
          <div key={scene._id || index} className="glass-card overflow-hidden flex flex-col justify-between hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all">
            {/* Visual Panel */}
            <div className="relative group aspect-[8/5] bg-dark-900 border-b border-slate-800">
              <img
                src={scene.imageUrl}
                alt={`Scene ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-200">
                Panel {index + 1}
              </div>

              {/* Quick Regenerate Overlay */}
              <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleRegeneratePanel(index)}
                  className="bg-brand-violet/20 hover:bg-brand-violet border border-brand-violet/30 hover:border-brand-violet text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Redraw Panel
                </button>
                <button
                  onClick={() => handleSpeechPreview(scene.narrative, index)}
                  className="bg-brand-cyan/20 hover:bg-brand-cyan border border-brand-cyan/30 hover:border-brand-cyan text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  {playingScene === index ? 'Stop Voice' : 'Test Voice'}
                </button>
              </div>
            </div>

            {/* Inputs Panel */}
            <div className="p-6 space-y-4">
              {/* Narration Script */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Voice Narration Script
                </label>
                <textarea
                  rows={2}
                  value={scene.narrative}
                  onChange={(e) => handleFieldChange(index, 'narrative', e.target.value)}
                  placeholder="The narrator voice script..."
                  className="w-full glass-input text-xs leading-relaxed"
                />
              </div>

              {/* Drawing Prompt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Comic Scene Drawing Prompt
                </label>
                <textarea
                  rows={2}
                  value={scene.imagePrompt}
                  onChange={(e) => handleFieldChange(index, 'imagePrompt', e.target.value)}
                  placeholder="Image generator prompt..."
                  className="w-full glass-input text-xs text-slate-400 font-mono leading-normal"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
