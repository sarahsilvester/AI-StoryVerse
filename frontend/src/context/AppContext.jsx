import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();
const API_BASE = 'https://ai-storyverse.onrender.com/api';


export const AppProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('offline');

  // Load settings from LocalStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('storyverse_settings');
    return saved ? JSON.parse(saved) : { geminiKey: '', openaiKey: '' };
  });

  // Save settings to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem('storyverse_settings', JSON.stringify(settings));
  }, [settings]);

  // Initial load
  useEffect(() => {
    checkBackendAndLoadData();
  }, []);

  const checkBackendAndLoadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/status`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setBackendStatus('online');
        console.log('[API] Backend online. Mode:', data.database);
        
        // Load from backend
        await Promise.all([loadStoriesFromBackend(), loadCharactersFromBackend()]);
      } else {
        throw new Error('Backend offline');
      }
    } catch (err) {
      setBackendStatus('offline');
      console.warn('[API] Backend server unreachable. Running in browser-only mode (LocalStorage).');
      loadStoriesFromLocalStorage();
      loadCharactersFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // --- Story Actions ---

  const loadStoriesFromBackend = async () => {
    const res = await fetch(`${API_BASE}/stories`);
    if (res.ok) {
      const data = await res.json();
      setStories(data);
      localStorage.setItem('storyverse_stories_cache', JSON.stringify(data));
    }
  };

  const loadStoriesFromLocalStorage = () => {
    const saved = localStorage.getItem('storyverse_stories');
    const cache = localStorage.getItem('storyverse_stories_cache');
    const localStories = saved ? JSON.parse(saved) : [];
    const cachedStories = cache ? JSON.parse(cache) : [];
    
    // Combine local changes and cached elements safely
    const combined = [...localStories];
    cachedStories.forEach(cs => {
      if (!combined.some(s => s._id === cs._id)) {
        combined.push(cs);
      }
    });
    setStories(combined);
  };

  const loadCharactersFromBackend = async () => {
    const res = await fetch(`${API_BASE}/characters`);
    if (res.ok) {
      const data = await res.json();
      setCharacters(data);
      localStorage.setItem('storyverse_characters_cache', JSON.stringify(data));
    }
  };

  const loadCharactersFromLocalStorage = () => {
    const saved = localStorage.getItem('storyverse_characters');
    const cache = localStorage.getItem('storyverse_characters_cache');
    const localChars = saved ? JSON.parse(saved) : [];
    const cachedChars = cache ? JSON.parse(cache) : [];
    
    const combined = [...localChars];
    cachedChars.forEach(cc => {
      if (!combined.some(c => c._id === cc._id)) {
        combined.push(cc);
      }
    });
    setCharacters(combined);
  };

  const generateStory = async (prompt, genre, style, selectedCharacters) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (settings.geminiKey) headers['x-gemini-key'] = settings.geminiKey;
      if (settings.openaiKey) headers['x-openai-key'] = settings.openaiKey;

      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt, genre, style, characters: selectedCharacters })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to generate story');
        }
        
        const story = await res.json();
        return story;
      } else {
        // Offline / Simulated AI story generation inside browser
        await new Promise(r => setTimeout(r, 2500)); // simulate delay
        const mockStory = simulateStoryGeneration(prompt, genre, style, selectedCharacters);
        return mockStory;
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async (storyData) => {
    setLoading(true);
    try {
      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storyData)
        });
        if (res.ok) {
          const savedStory = await res.json();
          setStories(prev => [savedStory, ...prev]);
          setActiveStory(savedStory);
          return savedStory;
        }
      }
      
      // Offline mode saving
      const localSaved = {
        ...storyData,
        _id: storyData._id || 'story_' + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString()
      };
      
      const localStories = localStorage.getItem('storyverse_stories')
        ? JSON.parse(localStorage.getItem('storyverse_stories'))
        : [];
      
      const updatedList = [localSaved, ...localStories];
      localStorage.setItem('storyverse_stories', JSON.stringify(updatedList));
      setStories(prev => [localSaved, ...prev]);
      setActiveStory(localSaved);
      return localSaved;
    } catch (err) {
      setError('Failed to save story');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async (id, storyData) => {
    setLoading(true);
    try {
      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/stories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storyData)
        });
        if (res.ok) {
          const updated = await res.json();
          setStories(prev => prev.map(s => s._id === id ? updated : s));
          if (activeStory && activeStory._id === id) {
            setActiveStory(updated);
          }
          return updated;
        }
      }
      
      // Offline mode updating
      const localStories = localStorage.getItem('storyverse_stories')
        ? JSON.parse(localStorage.getItem('storyverse_stories'))
        : [];
      
      const index = localStories.findIndex(s => s._id === id);
      if (index !== -1) {
        localStories[index] = { ...localStories[index], ...storyData };
        localStorage.setItem('storyverse_stories', JSON.stringify(localStories));
      }
      
      const updated = { ...activeStory, ...storyData };
      setStories(prev => prev.map(s => s._id === id ? updated : s));
      setActiveStory(updated);
      return updated;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id) => {
    try {
      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/stories/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setStories(prev => prev.filter(s => s._id !== id));
          if (activeStory && activeStory._id === id) setActiveStory(null);
        }
      }
      
      // Local clean up
      const localStories = localStorage.getItem('storyverse_stories')
        ? JSON.parse(localStorage.getItem('storyverse_stories'))
        : [];
      
      const filtered = localStories.filter(s => s._id !== id);
      localStorage.setItem('storyverse_stories', JSON.stringify(filtered));
      setStories(prev => prev.filter(s => s._id !== id));
      if (activeStory && activeStory._id === id) setActiveStory(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Character Actions ---

  const saveCharacter = async (charData) => {
    setLoading(true);
    try {
      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/characters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(charData)
        });
        if (res.ok) {
          const savedChar = await res.json();
          setCharacters(prev => {
            const index = prev.findIndex(c => c.name.toLowerCase() === savedChar.name.toLowerCase());
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = savedChar;
              return updated;
            }
            return [savedChar, ...prev];
          });
          return savedChar;
        }
      }
      
      // Offline mode saving
      const localSaved = {
        ...charData,
        _id: charData._id || 'char_' + Math.random().toString(36).substring(2, 11),
        avatarUrl: charData.avatarUrl || `https://image.pollinations.ai/prompt/avatar%20portrait%20of%20character%20${encodeURIComponent(charData.name)}%20${encodeURIComponent(charData.appearance)}?width=150&height=150&nologo=true`,
        createdAt: new Date().toISOString()
      };
      
      const localChars = localStorage.getItem('storyverse_characters')
        ? JSON.parse(localStorage.getItem('storyverse_characters'))
        : [];
      
      const existingIdx = localChars.findIndex(c => c.name.toLowerCase() === charData.name.toLowerCase());
      let updatedList;
      if (existingIdx !== -1) {
        updatedList = [...localChars];
        updatedList[existingIdx] = localSaved;
      } else {
        updatedList = [localSaved, ...localChars];
      }
      
      localStorage.setItem('storyverse_characters', JSON.stringify(updatedList));
      setCharacters(prev => {
        const index = prev.findIndex(c => c.name.toLowerCase() === localSaved.name.toLowerCase());
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = localSaved;
          return updated;
        }
        return [localSaved, ...prev];
      });
      return localSaved;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id) => {
    try {
      if (backendStatus === 'online') {
        const res = await fetch(`${API_BASE}/characters/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setCharacters(prev => prev.filter(c => c._id !== id));
        }
      }
      
      const localChars = localStorage.getItem('storyverse_characters')
        ? JSON.parse(localStorage.getItem('storyverse_characters'))
        : [];
      
      const filtered = localChars.filter(c => c._id !== id);
      localStorage.setItem('storyverse_characters', JSON.stringify(filtered));
      setCharacters(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Offline Story Simulation Helper ---

  const simulateStoryGeneration = (prompt, genre, style, selectedCharacters) => {
    // Basic story outline template
    const titles = {
      fantasy: 'The Quest of Magic',
      sci_fi: 'Chronicles of the Cosmos',
      adventure: 'The Uncharted Lands',
      mystery: 'The Whispers of Shadow',
      education: 'The Secret Lab of Science'
    };

    const characterText = selectedCharacters.length > 0
      ? selectedCharacters.join(' and ')
      : 'the curious traveler';

    const cleanGenre = genre.toLowerCase();
    const cleanStyle = style.toLowerCase();
    
    // Generate scenes
    const scenes = [
      {
        sceneNumber: 1,
        narrative: `Our tale begins with an incredible discovery related to '${prompt}'. ${characterText} stood at the entrance of a hidden chamber, feeling the air hum with ancient energy.`,
        imagePrompt: `Detailed opening scene of ${characterText} looking in awe at a glowing entrance, epic layout, ${cleanStyle} style`
      },
      {
        sceneNumber: 2,
        narrative: `Stepping inside, the surroundings shifted dramatically. Glowing symbols floated in the air, spelling out details of a long-lost secret that could change history.`,
        imagePrompt: `${characterText} inspecting glowing holographic letters inside a high-tech chamber, mystical light rays, ${cleanStyle} style`
      },
      {
        sceneNumber: 3,
        narrative: `But a sudden challenge appeared. The temple mechanisms activated, demanding a choice. ${characterText} had to act quickly, aligning the symbols before time ran out.`,
        imagePrompt: `Tense action scene with ${characterText} manipulating a rotating puzzle dial, neon sparks flying, dramatic action angle, ${cleanStyle} style`
      },
      {
        sceneNumber: 4,
        narrative: `With a final alignment, the energy settled. A radiant artifact materialized in the center of the altar. The quest was complete, and the journey's true meaning was revealed.`,
        imagePrompt: `Victorious closing scene of ${characterText} holding a shining golden artifact that illuminates the entire hall, beautiful resolution, cinematic lighting, ${cleanStyle} style`
      }
    ];

    // Map image URLs and durations
    const seedBase = Math.floor(Math.random() * 100000);
    const postScenes = scenes.map((scene, idx) => {
      let styleKeyword = 'digital illustration';
      if (cleanStyle === 'comic book') styleKeyword = 'comic book panel illustration, halftone lines, bold ink';
      else if (cleanStyle === 'anime') styleKeyword = 'anime key visual, modern manga style, vibrant lighting';
      else if (cleanStyle === 'watercolor') styleKeyword = 'watercolor wash painting, soft texture, artistic splash';
      else if (cleanStyle === 'cyberpunk') styleKeyword = 'cyberpunk neon style, dark alleys, glowing lights, unreal engine';
      else if (cleanStyle === 'classic noir') styleKeyword = 'classic film noir style, monochrome, high contrast, moody shadows, 1940s';

      const promptParam = encodeURIComponent(`${scene.imagePrompt}, ${styleKeyword}, detailed background, 8k resolution, cinematic composition`);
      const imageUrl = `https://image.pollinations.ai/prompt/${promptParam}?width=800&height=500&nologo=true&seed=${seedBase + idx}`;
      const duration = Math.max(5, Math.ceil(scene.narrative.split(' ').length / 2.2) + 1);

      return {
        ...scene,
        _id: 'scene_' + Math.random().toString(36).substring(2, 11),
        imageUrl,
        duration
      };
    });

    return {
      title: `${titles[cleanGenre] || 'A Legendary Tale'}: ${prompt.substring(0, 15)}...`,
      prompt,
      genre,
      style,
      characters: selectedCharacters,
      scenes: postScenes,
      createdAt: new Date().toISOString()
    };
  };

  return (
    <AppContext.Provider value={{
      stories,
      characters,
      activeStory,
      setActiveStory,
      activeTab,
      setActiveTab,
      loading,
      setLoading,
      error,
      setError,
      settings,
      setSettings,
      backendStatus,
      checkBackendAndLoadData,
      generateStory,
      saveStory,
      updateStory,
      deleteStory,
      saveCharacter,
      deleteCharacter
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
