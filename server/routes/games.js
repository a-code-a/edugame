const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// POST /api/games - Save a new game or update existing one
router.post('/', async (req, res) => {
  try {
    const { id, title, description, grade, subject, htmlContent, userId } = req.body;

    // Validate required fields
    if (!id || !title || !description || !grade || !subject || !htmlContent || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Use findOneAndUpdate with upsert to either update or create
    const game = await Game.findOneAndUpdate(
      { id, userId }, // Find criteria
      {
        id,
        title,
        description,
        grade,
        subject,
        htmlContent,
        userId,
        updatedAt: Date.now()
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        runValidators: true // Run schema validations
      }
    );

    res.status(200).json(game);
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games - Get all games for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.headers.userid || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const games = await Game.find({ userId }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/games/:id - Delete a specific game
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const game = await Game.findOneAndDelete({ id, userId });

    if (!game) {
      return res.status(404).json({ error: 'Game not found or unauthorized' });
    }

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/games/:id - Update a game
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;
    const { title, description, grade, subject, htmlContent } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find and update the game
    const game = await Game.findOneAndUpdate(
      { id, userId },
      {
        title,
        description,
        grade,
        subject,
        htmlContent,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found or unauthorized' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;