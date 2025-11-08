const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// POST /api/games - Save a new game
router.post('/', async (req, res) => {
  try {
    const { id, title, description, grade, subject, htmlContent, userId } = req.body;

    // Validate required fields
    if (!id || !title || !description || !grade || !subject || !htmlContent || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if game with this ID already exists
    const existingGame = await Game.findOne({ id });
    if (existingGame) {
      return res.status(409).json({ error: 'Game with this ID already exists' });
    }

    // Create new game
    const game = new Game({
      id,
      title,
      description,
      grade,
      subject,
      htmlContent,
      userId
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
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
    console.error('Error fetching games:', error);
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
    console.error('Error deleting game:', error);
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
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;