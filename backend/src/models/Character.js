import mongoose from 'mongoose';

const CharacterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  gender: { type: String, default: 'other' },
  appearance: { type: String, required: true }, // Details like "blue coat, brown hair"
  avatarUrl: { type: String, default: '' }, // Character thumbnail
  createdAt: { type: Date, default: Date.now }
});

export const Character = mongoose.model('Character', CharacterSchema);
