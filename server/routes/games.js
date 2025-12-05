const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// POST /api/games - Save a new game or update existing one
router.post('/', async (req, res) => {
  try {
    const { id, title, description, grade, subject, htmlContent, userId, isPublic, creatorName } = req.body;

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
        creatorName,
        isPublic: isPublic || false,
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

// GET /api/games/explore - Get all public games
router.get('/explore', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const games = await Game.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Game.countDocuments({ isPublic: true });

    res.json({
      games,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGames: total
    });
  } catch (error) {
    console.error('Error fetching public games:', error);
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
    const { title, description, grade, subject, htmlContent, isPublic, creatorName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData = {
      title,
      description,
      grade,
      subject,
      htmlContent,
      updatedAt: Date.now()
    };

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    if (creatorName) {
      updateData.creatorName = creatorName;
    }

    // Find and update the game
    const game = await Game.findOneAndUpdate(
      { id, userId },
      updateData,
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

// POST /api/games/:id/share - Toggle public status
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;
    const { isPublic } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPublic === undefined) {
      return res.status(400).json({ error: 'isPublic status is required' });
    }

    const game = await Game.findOneAndUpdate(
      { id, userId },
      { isPublic },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found or unauthorized' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error sharing game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/play - Increment play count
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Incrementing play count for game: ${id}`);

    const game = await Game.findOneAndUpdate(
      { id },
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error incrementing play count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/like - Increment likes
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Incrementing likes for game: ${id}`);

    const game = await Game.findOneAndUpdate(
      { id },
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error incrementing likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/dislike - Increment dislikes
router.post('/:id/dislike', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Incrementing dislikes for game: ${id}`);

    const game = await Game.findOneAndUpdate(
      { id },
      { $inc: { dislikes: 1 } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error incrementing dislikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;