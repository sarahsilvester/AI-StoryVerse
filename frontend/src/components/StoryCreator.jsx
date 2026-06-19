import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Wand2, Compass, Film } from 'lucide-react';

export default function StoryCreator() {
  const { characters, generateStory, saveStory, setActiveTab, activeStory } = useApp();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [style, setStyle] = useState('comic book');
  const [selectedChars, setSelectedChars] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const genres = [
    { id: 'fantasy', label: 'Fantasy', icon: '🧙‍♂️', desc: 'Magic, dragons, and lost relics' },
    { id: 'sci_fi', label: 'Sci-Fi', icon: '🚀', desc: 'Space travel, technology, and galaxies' },
    { id: 'adventure', label: 'Adventure', icon: '🤠', desc: 'Expeditions, ruins, and treasure hunts' },
    { id: 'mystery', label: 'Mystery', icon: '🕵️‍♂️', desc: 'Detectives, secrets, and codebreakers' },
    { id: 'education', label: 'Education', icon: '🎓', desc: 'Fun science, nature, and history facts' }
  ];

  const styles = [
    { id: 'comic book', label: 'Comic Book', desc: 'Classic ink outlines and halftone print dots' },
    { id: 'anime', label: 'Anime/Manga', desc: 'Japanese cell-shaded key visual art' },
    { id: 'watercolor', label: 'Watercolor', desc: 'Soft painting washes with canvas textures' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon glows, rain reflections, and dark alloys' },
    { id: 'classic noir', desc: 'Monochrome, high contrast shadows and light beams', label: 'Classic Noir' }
  ];

  const steps = [
    "Brainstorming story arcs...",
    "Drafting narrator scripting...",
    "Creating visual prompts for Stable Diffusion...",
    "Illustrating scenes and comic panels...",
    "Mixing instrumental themes and synthetic narration..."
  ];

  const handleCharToggle = (name) => {
    setSelectedChars(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setGenerationStep(0);

    // Simulate stepping through progress
    const interval = setInterval(() => {
      setGenerationStep(p => (p < steps.length - 1 ? p + 1 : p));
    }, 1800);

    try {
      // Find full appearance text of selected characters to pass to prompt injection
      const characterAppearanceDetails = selectedChars.map(name => {
        const char = characters.find(c => c.name === name);
        return char ? `${char.name} (${char.appearance})` : name;
      });

      const story = await generateStory(prompt, genre, style, characterAppearanceDetails);
      const saved = await saveStory(story);
      
      clearInterval(interval);
      setActiveTab('creator'); // Stay in storyboard mode of newly generated story
    } catch (err) {
      console.error(err);
      alert('Error generating story: ' + err.message);
      clearInterval(interval);
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="max-w-xl mx-auto glass-card p-12 text-center flex flex-col items-center justify-center min-h-[450px] space-y-8 animate-pulse-glow">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-violet border-r-brand-cyan animate-spin" />
          <Sparkles className="w-10 h-10 text-brand-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">Generating StoryVerse...</h3>
          <p className="text-brand-cyan text-sm font-semibold tracking-wider uppercase animate-pulse">
            Step {generationStep + 1} of {steps.length}: {steps[generationStep]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-brand-violet to-brand-cyan h-full transition-all duration-1000 ease-out" 
            style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 max-w-sm">
          Please wait. Generative AI is sketching visual scene descriptions and outlining panels.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Story Studio
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Input a simple idea and watch AI weave a complete narrative with comics, audio, and animations.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Input panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt */}
          <div className="glass-card p-6 space-y-3">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-brand-cyan" />
              1. What is your story idea?
            </label>
            <textarea
              required
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A tiny robotic beetle gets separated from its swarm in a botanical garden, discovering a hidden colony of bioluminescent insects..."
              className="w-full glass-input text-base"
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Write a sentence or a paragraph. Be as creative as you like.</span>
              <button 
                type="button" 
                onClick={() => setPrompt("An astronaut finds a grandfather clock ticking at the center of a black hole.")}
                className="text-brand-cyan hover:underline font-bold"
              >
                Need inspiration?
              </button>
            </div>
          </div>

          {/* Genre */}
          <div className="glass-card p-6 space-y-4">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-brand-violet" />
              2. Select Genre
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    genre === g.id
                      ? 'border-brand-violet bg-brand-violet/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-white'
                      : 'border-slate-800 hover:border-slate-700 bg-dark-900/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xl">{g.icon}</span>
                    <span className="font-bold text-sm">{g.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Style & Character Panel */}
        <div className="space-y-6">
          {/* Visual Style */}
          <div className="glass-card p-6 space-y-4">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Film className="w-4.5 h-4.5 text-brand-emerald" />
              3. Visual Art Style
            </label>
            <div className="space-y-2">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                    style === s.id
                      ? 'border-brand-emerald bg-brand-emerald/10 text-white'
                      : 'border-slate-800 hover:border-slate-700 bg-dark-900/50 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-200">{s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Consistent Characters */}
          <div className="glass-card p-6 space-y-4">
            <label className="text-sm font-bold text-slate-200">
              4. Feature Saved Characters
            </label>
            {characters.length === 0 ? (
              <div className="text-xs text-slate-500 leading-relaxed bg-dark-900/40 p-3 rounded-xl border border-slate-800">
                You haven't created any characters yet. Characters added to your library will appear here, allowing you to force character consistency in your comics.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {characters.map((char) => (
                  <label
                    key={char._id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedChars.includes(char.name)
                        ? 'border-brand-cyan/50 bg-brand-cyan/5 text-white'
                        : 'border-slate-800 hover:bg-white/5 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChars.includes(char.name)}
                      onChange={() => handleCharToggle(char.name)}
                      className="hidden"
                    />
                    <img 
                      src={char.avatarUrl} 
                      alt="" 
                      className="w-8 h-8 rounded-lg object-cover border border-slate-800"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{char.name}</div>
                      <div className="text-[9px] text-slate-500">{char.gender}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group text-base shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]"
          >
            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Generate Storyverse
          </button>
        </div>
      </form>
    </div>
  );
}
