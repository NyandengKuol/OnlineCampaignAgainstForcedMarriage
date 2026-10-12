const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { listFAQs, listResources, createFAQ, updateFAQ, deleteFAQ, createResource, updateResource, deleteResource } = require('../controllers/contentController');

router.get('/faqs', listFAQs);
router.get('/resources', listResources);
router.post('/faqs', protect, admin, createFAQ);
router.patch('/faqs/:id', protect, admin, updateFAQ);
router.delete('/faqs/:id', protect, admin, deleteFAQ);
router.post('/resources', protect, admin, createResource);
router.patch('/resources/:id', protect, admin, updateResource);
router.delete('/resources/:id', protect, admin, deleteResource);

module.exports = router;
