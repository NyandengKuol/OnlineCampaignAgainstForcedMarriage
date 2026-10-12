const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  type: { type: String, enum: ['support', 'scholarship'], default: 'support' },
  address: String,
  phone: String,
  email: String,
  hours: String,
  linkLabel: String,
  provider: String,
  award: String,
  eligibility: String,
  studyLevel: String,
  deadline: String,
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
