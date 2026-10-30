const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Awareness', 'Education', 'Support', 'Prevention'],
    required: true,
    default: 'Awareness',
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAnonymous: { type: Boolean, default: false },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
    reports: [{ reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, createdAt: { type: Date, default: Date.now } }],
  }],
  status: { type: String, enum: ['published', 'flagged', 'blocked'], default: 'published' },
  reports: [{ reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, createdAt: { type: Date, default: Date.now } }],
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
