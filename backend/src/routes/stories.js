import express from 'express';
import * as dbStore from '../services/dbStore.js';

const router = express.Router();

// GET all stories
router.get('/', async (req, res) => {
  try {
    const stories = await dbStore.getStories();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stories', details: err.message });
  }
});

// GET single story
router.get('/:id', async (req, res) => {
  try {
    const story = await dbStore.getStoryById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve story', details: err.message });
  }
});

// POST save a new story
router.post('/', async (req, res) => {
  try {
    const { title, prompt, genre, style, characters, scenes } = req.body;
    if (!title || !prompt || !genre || !style || !scenes) {
      return res.status(400).json({ error: 'Missing required story fields' });
    }
    const story = await dbStore.saveStory({ title, prompt, genre, style, characters, scenes });
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save story', details: err.message });
  }
});

// PUT update a story
router.put('/:id', async (req, res) => {
  try {
    const updated = await dbStore.updateStory(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update story', details: err.message });
  }
});

// DELETE a story
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await dbStore.deleteStory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json({ message: 'Story deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete story', details: err.message });
  }
});

export default router;
