import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import storiesRouter from './routes/stories.js';
import charactersRouter from './routes/characters.js';
import generateRouter from './routes/generate.js';
import { setMongoConnected } from './services/dbStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Connect Database
connectDB();

// API Health Check & Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    time: new Date(),
    database: app.get('mongoConnected') ? 'MongoDB' : 'JSON DB Fallback'
  });
});

// API Routes
app.use('/api/stories', storiesRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/generate', generateRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  AI StoryVerse API server started!     `);
  console.log(`  Running on: http://localhost:${PORT}   `);
  console.log(`========================================`);
});
