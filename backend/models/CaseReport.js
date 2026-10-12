const mongoose = require('mongoose');

const CaseReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['support_request', 'report_concern', 'other', 'question'],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
  },
  safeContact: {
    type: Boolean,
    default: false,
  },
  contactValue: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'referred', 'resolved'],
    default: 'pending',
  },
  assignedResource: {
    type: String,
  },
  parentReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseReport',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('CaseReport', CaseReportSchema);
