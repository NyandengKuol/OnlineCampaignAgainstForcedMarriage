const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: { type: String, default: 'General' },
  sourceInquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseReport', unique: true, sparse: true },
  status: { type: String, enum: ['published', 'archived'], default: 'published' }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', FAQSchema);
