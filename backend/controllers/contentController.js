const FAQ = require('../models/FAQ');
const Resource = require('../models/Resource');

const listFAQs = async (req, res) => {
  try { return res.json(await FAQ.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

const listResources = async (req, res) => {
  try { return res.json(await Resource.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

const createFAQ = async (req, res) => {
  const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
  const answer = typeof req.body.answer === 'string' ? req.body.answer.trim() : '';
  if (!question || !answer) return res.status(400).json({ message: 'Question and answer are required' });
  try { return res.status(201).json(await FAQ.create({ question, answer, category: req.body.category || 'General' })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

const updateFAQ = async (req, res) => {
  const updates = {};
  for (const key of ['question', 'answer', 'category', 'status']) if (typeof req.body[key] === 'string') updates[key] = req.body[key].trim();
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    return faq ? res.json(faq) : res.status(404).json({ message: 'FAQ not found' });
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

const deleteFAQ = async (req, res) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  return faq ? res.json({ message: 'FAQ deleted' }) : res.status(404).json({ message: 'FAQ not found' });
};

const createResource = async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
  if (!title || !url) return res.status(400).json({ message: 'Name and website link are required' });
  try { return res.status(201).json(await Resource.create({ ...req.body, title, url })); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

const updateResource = async (req, res) => {
  const updates = {};
  for (const key of ['title', 'url', 'description', 'category', 'type', 'address', 'phone', 'email', 'hours', 'linkLabel', 'provider', 'award', 'eligibility', 'studyLevel', 'deadline', 'status']) {
    if (typeof req.body[key] === 'string') updates[key] = req.body[key].trim();
  }
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    return resource ? res.json(resource) : res.status(404).json({ message: 'Resource not found' });
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

const deleteResource = async (req, res) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  return resource ? res.json({ message: 'Resource deleted' }) : res.status(404).json({ message: 'Resource not found' });
};

module.exports = { listFAQs, listResources, createFAQ, updateFAQ, deleteFAQ, createResource, updateResource, deleteResource };
