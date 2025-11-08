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
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Create indexes for better query performance
gameSchema.index({ userId: 1, createdAt: -1 });
gameSchema.index({ id: 1, userId: 1 });

module.exports = mongoose.model('Game', gameSchema);