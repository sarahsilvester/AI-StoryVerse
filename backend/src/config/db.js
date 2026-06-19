import mongoose from 'mongoose';
import { setMongoConnected } from '../services/dbStore.js';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_storyverse';
  try {
    console.log(`[Database] Attempting to connect to MongoDB at ${uri}...`);
    // Set connection timeout short (3 seconds) to fail quickly and switch to JSON fallback
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[Database] MongoDB connected successfully!');
    setMongoConnected(true);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}`);
    console.warn('[Database] Falling back to local file system database (backend/data/db.json).');
    setMongoConnected(false);
  }
};
