const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe, updateMe, googleAuth } = require('../controllers/authController');

router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Login and account creation are temporarily unavailable because the database is disconnected. Check MongoDB Atlas Network Access and the backend MONGO_URI.'
    });
  }
  return next();
});

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
