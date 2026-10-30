require('dotenv').config();
const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

const MONGO_URI = process.env.MONGO_URI;

const repairFaqCategories = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is not configured.');
  await mongoose.connect(MONGO_URI);
  const categoryRepairs = [
    ['Is forced marriage illegal?', 'Rights'],
    ['How can I get confidential help?', 'Support'],
    ['What should I do if a friend is at risk?', 'Prevention'],
  ];
  let reassigned = 0;
  for (const [question, category] of categoryRepairs) {
    const result = await FAQ.updateOne({ question }, { $set: { category } });
    reassigned += result.modifiedCount;
  }
  const submittedResult = await FAQ.updateMany(
    { $or: [{ category: 'General' }, { category: { $exists: false } }, { category: null }, { category: '' }] },
    { $set: { category: 'Submitted' } }
  );
  console.log(`Assigned ${reassigned} FAQ${reassigned === 1 ? '' : 's'} to their topic and moved ${submittedResult.modifiedCount} to Submitted.`);
  await mongoose.disconnect();
};

repairFaqCategories().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
