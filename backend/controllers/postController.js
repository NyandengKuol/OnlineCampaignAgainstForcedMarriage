const Post = require('../models/Post');

const listPosts = async (req, res) => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] };
    const posts = await Post.find(filter).populate('author', 'username role').populate('comments.author', 'username').sort({ createdAt: -1 });
    if (req.user?.role !== 'admin') posts.forEach((post) => { post.comments = post.comments.filter((comment) => !comment.status || comment.status === 'approved'); });
    const result = posts.map((post) => {
      const data = post.toObject();
      data.isLiked = Boolean(req.user && data.likes?.some((userId) => userId.toString() === req.user._id.toString()));
      data.likesCount = data.likes?.length || 0;
      delete data.likes;
      if (req.user?.role !== 'admin' && data.isAnonymous) {
        data.isMine = req.user?._id?.toString() === data.author?._id?.toString();
        data.author = null;
      }
      return data;
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  const { title, content, tags, isAnonymous } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
  try {
    const post = await Post.create({ title, content, tags: tags || [], author: req.user._id, isAnonymous: Boolean(isAnonymous) });
    await post.populate('author', 'username role');
    const data = post.toObject();
    data.likesCount = data.likes?.length || 0;
    delete data.likes;
    data.isMine = true;
    if (data.isAnonymous) data.author = null;
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    return res.json({ message: 'Post removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ message: 'Write a reply before posting' });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ text, author: req.user._id });
    await post.save();
    await post.populate('author', 'username role');
    await post.populate('comments.author', 'username');
    const data = post.toObject();
    data.likesCount = data.likes?.length || 0;
    delete data.likes;
    if (post.isAnonymous && req.user.role !== 'admin') {
      data.isMine = post.author?._id?.toString() === req.user._id.toString();
      data.author = null;
    }
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
  if (text.length > 2000) return res.status(400).json({ message: 'Comment must be 2000 characters or fewer' });
  try {
    const post = await Post.findOne({ 'comments._id': req.params.commentId });
    if (!post) return res.status(404).json({ message: 'Comment not found' });
    const comment = post.comments.id(req.params.commentId);
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }
    comment.text = text;
    await post.save();
    return res.json({
      postId: post._id,
      comment: { id: comment._id, text: comment.text, authorId: comment.author, createdAt: comment.createdAt, status: comment.status }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update this comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findOne({ 'comments._id': req.params.commentId });
    if (!post) return res.status(404).json({ message: 'Comment not found' });
    const comment = post.comments.id(req.params.commentId);
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    post.comments.pull(req.params.commentId);
    await post.save();
    return res.json({ postId: post._id, commentId: req.params.commentId });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete this comment' });
  }
};

const togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('likes');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((likedBy) => likedBy.toString() === userId.toString());
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true }).select('likes');

    return res.json({ isLiked: !alreadyLiked, likes: updatedPost.likes.length });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update this like' });
  }
};

const moderatePost = async (req, res) => {
  const { status } = req.body;
  if (!['published', 'flagged', 'blocked'].includes(status)) return res.status(400).json({ message: 'Choose a valid post status' });
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return post ? res.json(post) : res.status(404).json({ message: 'Post not found' });
  } catch (error) { return res.status(500).json({ message: 'Could not update post status' }); }
};

const moderateComment = async (req, res) => {
  const { status, action } = req.body;
  if (action !== 'delete' && !['pending', 'approved', 'blocked'].includes(status)) return res.status(400).json({ message: 'Choose a valid comment action' });
  try {
    const post = await Post.findOne({ 'comments._id': req.params.commentId });
    if (!post) return res.status(404).json({ message: 'Comment not found' });
    if (action === 'delete') post.comments.pull(req.params.commentId);
    else post.comments.id(req.params.commentId).status = status;
    await post.save();
    await post.populate('author', 'username role');
    await post.populate('comments.author', 'username');
    return res.json(post);
  } catch (error) { return res.status(500).json({ message: 'Could not moderate comment' }); }
};

const reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You cannot report your own post' });
    if (!post.reports.some((report) => report.reportedBy?.toString() === req.user._id.toString())) {
      post.reports.push({ reportedBy: req.user._id, reason: String(req.body.reason || 'Community report').slice(0, 300) });
    }
    post.status = 'flagged';
    await post.save();
    return res.json({ message: 'Post sent to moderation for review' });
  } catch (error) { return res.status(500).json({ message: 'Could not submit this report' }); }
};

const reportComment = async (req, res) => {
  try {
    const post = await Post.findOne({ 'comments._id': req.params.commentId });
    if (!post) return res.status(404).json({ message: 'Comment not found' });
    const comment = post.comments.id(req.params.commentId);
    if (comment.author.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You cannot report your own comment' });
    if (!comment.reports.some((report) => report.reportedBy?.toString() === req.user._id.toString())) {
      comment.reports.push({ reportedBy: req.user._id, reason: String(req.body.reason || 'Community report').slice(0, 300) });
    }
    comment.status = 'flagged';
    await post.save();
    return res.json({ message: 'Comment sent to moderation for review' });
  } catch (error) { return res.status(500).json({ message: 'Could not submit this report' }); }
};

module.exports = { listPosts, createPost, deletePost, addComment, updateComment, deleteComment, togglePostLike, moderatePost, moderateComment, reportPost, reportComment };
