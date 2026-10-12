const express = require('express');
const router = express.Router();
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');
const { listPosts, createPost, deletePost, addComment, updateComment, deleteComment, togglePostLike, moderatePost, moderateComment, reportPost, reportComment } = require('../controllers/postController');

router.get('/', optionalAuth, listPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, togglePostLike);
router.post('/:id/comments', protect, addComment);
router.patch('/comments/:commentId', protect, updateComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.patch('/:id/moderation', protect, admin, moderatePost);
router.patch('/comments/:commentId/moderation', protect, admin, moderateComment);
router.post('/comments/:commentId/report', protect, reportComment);
router.post('/:id/report', protect, reportPost);
router.delete('/:id', protect, deletePost);

module.exports = router;
