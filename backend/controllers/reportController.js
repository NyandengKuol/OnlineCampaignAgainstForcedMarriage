const CaseReport = require('../models/CaseReport');
const FAQ = require('../models/FAQ');

const createReport = async (req, res) => {
  const { type, details, location, safeContact, contactValue, parentReportId } = req.body;
  if (!type || !details) return res.status(400).json({ message: 'Type and details are required' });
  try {
    let parentReport;
    if (parentReportId) {
      if (type !== 'question') return res.status(400).json({ message: 'Only a follow-up question can be linked to a report' });
      parentReport = await CaseReport.findOne({ _id: parentReportId, submittedBy: req.user._id });
      if (!parentReport) return res.status(404).json({ message: 'The linked report could not be found' });
    }
    const report = await CaseReport.create({ type, details, location, safeContact, contactValue, parentReport: parentReport?._id, submittedBy: req.user._id });
    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listReports = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { submittedBy: req.user._id };
    const reports = await CaseReport.find(filter)
      .populate('submittedBy', 'username')
      .populate('parentReport', 'type details')
      .sort({ createdAt: -1 });
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req, res) => {
  const { status, assignedResource, answer } = req.body;
  try {
    const report = await CaseReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (status) report.status = status;
    if (assignedResource !== undefined) report.assignedResource = assignedResource;
    if (answer !== undefined) {
      if (report.type !== 'question') return res.status(400).json({ message: 'Only questions can be answered here' });
      const cleanAnswer = typeof answer === 'string' ? answer.trim() : '';
      if (!cleanAnswer) return res.status(400).json({ message: 'An answer is required' });
      report.answer = cleanAnswer;
      report.status = 'resolved';
    }
    if (report.type === 'question' && !report.parentReport && report.answer) {
      await FAQ.findOneAndUpdate(
        { sourceInquiry: report._id },
        { question: report.details, answer: report.answer, category: 'Submitted', status: 'published' },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
    }
    return res.json(await report.save());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, listReports, updateReport };
