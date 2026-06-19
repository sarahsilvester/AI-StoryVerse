import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import StoryCreator from './components/StoryCreator';
import StoryBoard from './components/StoryBoard';
import CinemaPlayer from './components/CinemaPlayer';
import CharacterLibrary from './components/CharacterLibrary';
import SettingsPanel from './components/SettingsPanel';
import { Film, BookOpen, Trash2, Calendar, Sparkles, Play, PlusCircle, Server, MessageSquare } from 'lucide-react';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    stories,
    characters,
    activeStory,
    setActiveStory,
    deleteStory,
    backendStatus
  } = useApp();

  const handleOpenStoryboard = (story) => {
    setActiveStory(story);
    setActiveTab('creator');
  };

  const handleOpenCinema = (story) => {
    setActiveStory(story);
    setActiveTab('cinema');
  };

  const getGenreColor = (genre) => {
    switch (genre?.toLowerCase()) {
      case 'fantasy': return 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5';
      case 'sci_fi': return 'border-brand-violet/30 text-brand-violet bg-brand-violet/5';
      case 'adventure': return 'border-brand-emerald/30 text-brand-emerald bg-brand-emerald/5';
      case 'mystery': return 'border-brand-rose/30 text-brand-rose bg-brand-rose/5';
      default: return 'border-amber-500/30 text-amber-500 bg-amber-500/5';
    }
  };

  return (
    <div className="flex bg-dark-900 min-h-screen text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Dashboard Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/40">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Creative Workspace
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Weave ideas into fully animated storybooks and cinematic voiceovers.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveStory(null);
                  setActiveTab('creator');
                }}
                className="btn-primary py-2.5 px-6 self-start md:self-auto"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                New Story
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metric 1 */}
              <div className="glass-card p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Stories Saved</span>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{stories.length}</h3>
                </div>
                <div className="bg-brand-violet/10 border border-brand-violet/20 p-3 rounded-xl text-brand-violet">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="glass-card p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Consistent Cast</span>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{characters.length}</h3>
                </div>
                <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-3 rounded-xl text-brand-cyan">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="glass-card p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">API Core Status</span>
                  <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                    {backendStatus === 'online' ? 'Server Connected' : 'Browser Sandbox'}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl border ${
                  backendStatus === 'online' 
                    ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                  <Server className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Stories Gallery */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Recent Creations</h2>
              {stories.length === 0 ? (
                <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-4">
                  <div className="text-slate-600 text-6xl">🌌</div>
                  <h3 className="text-lg font-bold text-slate-300">Your StoryVerse is empty</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Unleash your imagination! Enter a concept prompt, select a style, and generate your first cinematic storyboard.
                  </p>
                  <button
                    onClick={() => {
                      setActiveStory(null);
                      setActiveTab('creator');
                    }}
                    className="btn-primary py-2 px-6 text-sm mx-auto"
                  >
                    Create Story
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <div
                      key={story._id}
                      className="glass-card overflow-hidden flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:border-slate-700/60 transition-all duration-300"
                    >
                      {/* Thumbnail Cover */}
                      <div 
                        onClick={() => handleOpenStoryboard(story)}
                        className="relative aspect-[8/5] bg-dark-900 cursor-pointer group overflow-hidden border-b border-slate-800"
                      >
                        <img
                          src={story.scenes?.[0]?.imageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Overlay panel play trigger */}
                        <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-brand-violet p-3.5 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>

                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`badge ${getGenreColor(story.genre)}`}>
                            {story.genre}
                          </span>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4
                            onClick={() => handleOpenStoryboard(story)}
                            className="font-bold text-slate-200 text-base line-clamp-1 hover:text-brand-cyan cursor-pointer transition-colors"
                          >
                            {story.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            "{story.prompt}"
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            <span>
                              {story.createdAt 
                                ? new Date(story.createdAt).toLocaleDateString()
                                : 'Draft'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenCinema(story)}
                              className="text-brand-cyan hover:underline font-bold"
                            >
                              Play Cinema
                            </button>
                            <span>&bull;</span>
                            <button
                              onClick={() => deleteStory(story._id)}
                              className="text-slate-500 hover:text-brand-rose transition-colors p-1 hover:bg-brand-rose/10 rounded"
                              title="Delete Story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Route views */}
        {activeTab === 'creator' && (activeStory ? <StoryBoard /> : <StoryCreator />)}
        {activeTab === 'cinema' && <CinemaPlayer />}
        {activeTab === 'character-library' && <CharacterLibrary />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}
