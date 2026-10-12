const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createReport, listReports, updateReport } = require('../controllers/reportController');

router.post('/', protect, createReport);
router.get('/', protect, listReports);
router.put('/:id', protect, admin, updateReport);

module.exports = router;
