const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Game = require('../models/Game');

// Helper to check ownership
const checkOwnership = async (req, res, playlistId, userId) => {
    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' });
        return null;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized' });
        return null;
    }
    return playlist;
};

// GET /api/playlists - Get all playlists for user
router.get('/', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });

        // Enrich with game counts or thumbnails if needed?
        // For now, client can fetch details or we send length.
        const enriched = playlists.map(p => ({
            ...p.toObject(),
            gameCount: p.games.length,
            // We could fetch first game thumbnail here if we want to show it in list
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/playlists - Create new playlist
router.post('/', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        const { title, description, isPublic } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID is required' });
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const playlist = new Playlist({
            userId,
            title,
            description,
            isPublic: !!isPublic
        });

        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/playlists/:id - Get specific playlist with games
router.get('/:id', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const playlist = await Playlist.findOne({ _id: req.params.id });

        if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

        // Allow if owner OR if public
        if (playlist.userId !== userId && !playlist.isPublic) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Fetch details for all games in playlist
        // Preserve order!
        const games = await Game.find({ id: { $in: playlist.games } });

        // Sort games based on order in playlist.games array
        const orderedGames = [];
        playlist.games.forEach(gid => {
            const game = games.find(g => g.id === gid);
            if (game) orderedGames.push(game);
        });

        res.json({ ...playlist.toObject(), games: orderedGames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/playlists/:id - Update playlist details
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        const { title, description, isPublic } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const playlist = await checkOwnership(req, res, req.params.id, userId);
        if (!playlist) return; // Response sent in helper

        if (title !== undefined) playlist.title = title;
        if (description !== undefined) playlist.description = description;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();
        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const result = await Playlist.deleteOne({ _id: req.params.id, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' });
        }

        res.json({ message: 'Playlist deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/playlists/:id/games - Add game to playlist
router.post('/:id/games', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        const { gameId } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID is required' });
        if (!gameId) return res.status(400).json({ error: 'Game ID is required' });

        const playlist = await checkOwnership(req, res, req.params.id, userId);
        if (!playlist) return;

        // Check if game exists?
        // const game = await Game.findOne({ id: gameId });
        // if (!game) return res.status(404).json({ error: 'Game not found' });

        // Add if not present
        if (!playlist.games.includes(gameId)) {
            playlist.games.push(gameId);
            await playlist.save();
        }

        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/playlists/:id/games/:gameId - Remove game from playlist
router.delete('/:id/games/:gameId', async (req, res) => {
    try {
        const userId = req.headers.userid || req.query.userId;
        const { id, gameId } = req.params;

        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const playlist = await checkOwnership(req, res, id, userId);
        if (!playlist) return;

        playlist.games = playlist.games.filter(g => g !== gameId);
        await playlist.save();

        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
