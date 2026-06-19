import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Story } from '../models/Story.js';
import { Character } from '../models/Character.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/db.json');

let isMongoConnected = false;

export const setMongoConnected = (connected) => {
  isMongoConnected = connected;
  console.log(`[dbStore] Mode set to: ${connected ? 'MongoDB (Mongoose)' : 'Local File Storage (JSON fallback)'}`);
};

const ensureDbFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ stories: [], characters: [] }, null, 2));
  }
};

const readLocalData = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return { stories: [], characters: [] };
  }
};

const writeLocalData = (data) => {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB file:', err);
  }
};

// --- Story CRUD ---

export const getStories = async () => {
  if (isMongoConnected) {
    return await Story.find().sort({ createdAt: -1 });
  } else {
    const data = readLocalData();
    return [...data.stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const getStoryById = async (id) => {
  if (isMongoConnected) {
    return await Story.findById(id);
  } else {
    const data = readLocalData();
    return data.stories.find(s => s._id === id) || null;
  }
};

export const saveStory = async (storyData) => {
  if (isMongoConnected) {
    const newStory = new Story(storyData);
    return await newStory.save();
  } else {
    const data = readLocalData();
    const newStory = {
      _id: storyData._id || 'story_' + Math.random().toString(36).substring(2, 11),
      title: storyData.title,
      prompt: storyData.prompt,
      genre: storyData.genre,
      style: storyData.style,
      characters: storyData.characters || [],
      scenes: storyData.scenes.map((s, idx) => ({
        _id: s._id || 'scene_' + Math.random().toString(36).substring(2, 11),
        sceneNumber: s.sceneNumber || idx + 1,
        narrative: s.narrative,
        imagePrompt: s.imagePrompt,
        imageUrl: s.imageUrl || '',
        audioUrl: s.audioUrl || '',
        duration: s.duration || 5
      })),
      createdAt: storyData.createdAt || new Date().toISOString()
    };
    data.stories.push(newStory);
    writeLocalData(data);
    return newStory;
  }
};

export const updateStory = async (id, storyData) => {
  if (isMongoConnected) {
    return await Story.findByIdAndUpdate(id, storyData, { new: true });
  } else {
    const data = readLocalData();
    const index = data.stories.findIndex(s => s._id === id);
    if (index === -1) throw new Error('Story not found');
    
    data.stories[index] = {
      ...data.stories[index],
      ...storyData,
      // Ensure we preserve id and format nested arrays properly
      _id: id,
      scenes: (storyData.scenes || data.stories[index].scenes).map((s, idx) => ({
        _id: s._id || 'scene_' + Math.random().toString(36).substring(2, 11),
        sceneNumber: s.sceneNumber || idx + 1,
        narrative: s.narrative,
        imagePrompt: s.imagePrompt,
        imageUrl: s.imageUrl !== undefined ? s.imageUrl : '',
        audioUrl: s.audioUrl !== undefined ? s.audioUrl : '',
        duration: s.duration || 5
      }))
    };
    
    writeLocalData(data);
    return data.stories[index];
  }
};

export const deleteStory = async (id) => {
  if (isMongoConnected) {
    return await Story.findByIdAndDelete(id);
  } else {
    const data = readLocalData();
    const index = data.stories.findIndex(s => s._id === id);
    if (index === -1) return null;
    const deleted = data.stories.splice(index, 1);
    writeLocalData(data);
    return deleted[0];
  }
};

// --- Character CRUD ---

export const getCharacters = async () => {
  if (isMongoConnected) {
    return await Character.find().sort({ createdAt: -1 });
  } else {
    const data = readLocalData();
    return [...data.characters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const getCharacterById = async (id) => {
  if (isMongoConnected) {
    return await Character.findById(id);
  } else {
    const data = readLocalData();
    return data.characters.find(c => c._id === id || c.name === id) || null;
  }
};

export const saveCharacter = async (charData) => {
  if (isMongoConnected) {
    const newChar = new Character(charData);
    return await newChar.save();
  } else {
    const data = readLocalData();
    // Prevent duplicates by name in offline mode
    const existingIndex = data.characters.findIndex(c => c.name.toLowerCase() === charData.name.toLowerCase());
    const newChar = {
      _id: charData._id || 'char_' + Math.random().toString(36).substring(2, 11),
      name: charData.name,
      description: charData.description,
      gender: charData.gender || 'other',
      appearance: charData.appearance,
      avatarUrl: charData.avatarUrl || `https://image.pollinations.ai/prompt/avatar%20portrait%20of%20character%20${encodeURIComponent(charData.name)}%20${encodeURIComponent(charData.appearance)}?width=150&height=150&nologo=true`,
      createdAt: charData.createdAt || new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      data.characters[existingIndex] = newChar;
    } else {
      data.characters.push(newChar);
    }
    
    writeLocalData(data);
    return newChar;
  }
};

export const deleteCharacter = async (id) => {
  if (isMongoConnected) {
    return await Character.findByIdAndDelete(id);
  } else {
    const data = readLocalData();
    const index = data.characters.findIndex(c => c._id === id || c.name === id);
    if (index === -1) return null;
    const deleted = data.characters.splice(index, 1);
    writeLocalData(data);
    return deleted[0];
  }
};
