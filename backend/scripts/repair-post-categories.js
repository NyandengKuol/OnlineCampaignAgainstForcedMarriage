require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

const MONGO_URI = process.env.MONGO_URI;

const inferCategory = (post) => {
  const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
  if (text.includes('child education') || text.includes('girl child education')) return 'Education';
  return 'Awareness';
};

const repairPostCategories = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is not configured.');
  await mongoose.connect(MONGO_URI);
  const posts = await Post.find({ $or: [{ category: { $exists: false } }, { category: null }, { category: '' }] });
  for (const post of posts) {
    post.category = inferCategory(post);
    await post.save();
  }
  console.log(`Assigned categories to ${posts.length} existing post${posts.length === 1 ? '' : 's'}.`);
  await mongoose.disconnect();
};

repairPostCategories().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
