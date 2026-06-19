import express from 'express';
import * as dbStore from '../services/dbStore.js';

const router = express.Router();

// GET all characters
router.get('/', async (req, res) => {
  try {
    const characters = await dbStore.getCharacters();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve characters', details: err.message });
  }
});

// GET single character
router.get('/:id', async (req, res) => {
  try {
    const character = await dbStore.getCharacterById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve character', details: err.message });
  }
});

// POST save / update a character
router.post('/', async (req, res) => {
  try {
    const { name, description, gender, appearance, avatarUrl } = req.body;
    if (!name || !description || !appearance) {
      return res.status(400).json({ error: 'Missing name, description, or appearance details' });
    }
    const character = await dbStore.saveCharacter({ name, description, gender, appearance, avatarUrl });
    res.status(201).json(character);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save character', details: err.message });
  }
});

// DELETE a character
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await dbStore.deleteCharacter(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json({ message: 'Character deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete character', details: err.message });
  }
});

export default router;
