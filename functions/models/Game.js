const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 13
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  creatorName: {
    type: String,
    default: 'Anonymous'
  },
  playCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [String],
    default: []
  },
  dislikedBy: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
gameSchema.index({ userId: 1, createdAt: -1 });
gameSchema.index({ id: 1, userId: 1 });

module.exports = mongoose.model('Game', gameSchema);