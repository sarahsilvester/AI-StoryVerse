import mongoose from 'mongoose';

const SceneSchema = new mongoose.Schema({
  sceneNumber: { type: Number, required: true },
  narrative: { type: String, required: true },
  imagePrompt: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  duration: { type: Number, default: 5 } // Duration in seconds
});

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  genre: { type: String, required: true },
  style: { type: String, required: true },
  characters: [{ type: String }], // Names or IDs of characters in the story
  scenes: [SceneSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Story = mongoose.model('Story', StorySchema);
