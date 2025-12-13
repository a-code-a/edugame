const mongoose = require('mongoose');

const PlayHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    gameId: {
        type: String,
        required: true,
        ref: 'Game' // Assuming we can populate if needed, but we store ID string mostly
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to quickly find a user's history for a specific game if needed,
// or just to sort user's history by time.
PlayHistorySchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('PlayHistory', PlayHistorySchema);
