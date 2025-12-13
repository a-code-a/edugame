const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    games: [{
        type: String, // Storing Game IDs
        ref: 'Game'
    }],
}, {
    timestamps: true
});

// Index to quickly list user's playlists
playlistSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
