const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const PlayHistory = require('../models/PlayHistory');

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

// GET /api/games/explore - Get all public games with filtering, search, and sorting
router.get('/explore', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { isPublic: true };

    // Subject filter
    if (req.query.subject && req.query.subject !== 'All') {
      filter.subject = req.query.subject;
    }

    // Grade filter
    if (req.query.grade && req.query.grade !== 'All') {
      filter.grade = parseInt(req.query.grade);
    }

    // Text search (title and description)
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Build sort query
    let sort = { createdAt: -1 }; // Default: newest first

    switch (req.query.sort) {
      case 'mostPlayed':
        sort = { playCount: -1, createdAt: -1 };
        break;
      case 'trending':
        // Trending: combination of recent activity and engagement
        sort = { likes: -1, playCount: -1, createdAt: -1 };
        break;
      case 'mostLiked':
        sort = { likes: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Game.countDocuments(filter);

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

// GET /api/games/spotlight - Get the featured game (most liked public game)
router.get('/spotlight', async (req, res) => {
  try {
    const spotlightGame = await Game.findOne({ isPublic: true })
      .sort({ likes: -1, playCount: -1 })
      .limit(1);

    if (!spotlightGame) {
      return res.json({ game: null });
    }

    res.json({ game: spotlightGame });
  } catch (error) {
    console.error('Error fetching spotlight game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games/history - Get played games history for a user
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers.userid || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get history sorted by playedAt desc
    const history = await PlayHistory.find({ userId })
      .sort({ playedAt: -1 })
      .limit(50); // Limit to last 50 games

    // Extract game IDs
    const gameIds = [...new Set(history.map(h => h.gameId))]; // deduplicate

    // Fetch games
    // We want to preserve order of history? 
    // Mongoose find($in) doesn't strictly preserve order. 
    // We'll fetch all and map them back.
    const games = await Game.find({ id: { $in: gameIds } });

    // Map games to history entries to preserve recent order and filter out deleted games
    // Also remove duplicates manually if we want unique *recent* games list
    const uniqueGames = [];
    const seenIds = new Set();

    // Iterate history to find corresponding games
    for (const h of history) {
      if (!seenIds.has(h.gameId)) {
        const game = games.find(g => g.id === h.gameId);
        if (game) {
          uniqueGames.push(game);
          seenIds.add(h.gameId);
        }
      }
    }

    res.json(uniqueGames);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games/liked - Get games liked by user
router.get('/liked', async (req, res) => {
  try {
    const userId = req.headers.userid || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const games = await Game.find({ likedBy: userId }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    console.error('Error fetching liked games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games - Get all games for a user (My Projects)
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
    const userId = req.headers.userid; // Get from header if available
    console.log(`Incrementing play count for game: ${id}`);

    const game = await Game.findOneAndUpdate(
      { id },
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Record History if user is logged in
    if (userId) {
      try {
        // Update existing history entry for today or create new?
        // Simple approach: just create new entry. we sort by date anyway.
        await PlayHistory.create({
          userId,
          gameId: id,
          playedAt: new Date()
        });
      } catch (histError) {
        console.error('Failed to record play history:', histError);
        // Don't fail the request if history recording fails
      }
    }

    res.json(game);
  } catch (error) {
    console.error('Error incrementing play count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/like - Toggle like for a user
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const game = await Game.findOne({ id });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const hasLiked = game.likedBy.includes(userId);
    const hasDisliked = game.dislikedBy.includes(userId);

    let update = {};

    if (hasLiked) {
      // User already liked, remove like
      update = {
        $pull: { likedBy: userId },
        $inc: { likes: -1 }
      };
    } else {
      // User hasn't liked, add like
      update = {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 }
      };

      // If user had disliked, also remove dislike
      if (hasDisliked) {
        update.$pull = { ...update.$pull, dislikedBy: userId };
        update.$inc = { ...update.$inc, dislikes: -1 };
      }
    }

    const updatedGame = await Game.findOneAndUpdate(
      { id },
      update,
      { new: true }
    );

    // Return with user's like status
    res.json({
      ...updatedGame.toObject(),
      userLiked: !hasLiked,
      userDisliked: false
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/dislike - Toggle dislike for a user
router.post('/:id/dislike', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const game = await Game.findOne({ id });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const hasLiked = game.likedBy.includes(userId);
    const hasDisliked = game.dislikedBy.includes(userId);

    let update = {};

    if (hasDisliked) {
      // User already disliked, remove dislike
      update = {
        $pull: { dislikedBy: userId },
        $inc: { dislikes: -1 }
      };
    } else {
      // User hasn't disliked, add dislike
      update = {
        $addToSet: { dislikedBy: userId },
        $inc: { dislikes: 1 }
      };

      // If user had liked, also remove like
      if (hasLiked) {
        update.$pull = { ...update.$pull, likedBy: userId };
        update.$inc = { ...update.$inc, likes: -1 };
      }
    }

    const updatedGame = await Game.findOneAndUpdate(
      { id },
      update,
      { new: true }
    );

    // Return with user's like status
    res.json({
      ...updatedGame.toObject(),
      userLiked: false,
      userDisliked: !hasDisliked
    });
  } catch (error) {
    console.error('Error toggling dislike:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/games/:id/fork - Fork a game
router.post('/:id/fork', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the original game
    const originalGame = await Game.findOne({ id });

    if (!originalGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Create a new ID for the forked game
    // Format: fork-[timestamp]-[random]
    const newId = `fork-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the new game object
    const forkedGame = new Game({
      id: newId,
      title: `${originalGame.title} (Remix)`,
      description: originalGame.description,
      htmlContent: originalGame.htmlContent,
      grade: originalGame.grade,
      subject: originalGame.subject,
      userId: userId, // The new owner
      creatorName: req.body.creatorName || 'Anonymous', // Current user's name
      isPublic: false, // Private by default
      playCount: 0,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      forkedFrom: originalGame.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const savedGame = await forkedGame.save();

    res.json(savedGame);
  } catch (error) {
    console.error('Error forking game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;