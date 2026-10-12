const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const reportRoutes = require('./routes/reportRoutes');
const contentRoutes = require('./routes/contentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend API is running!'));
app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/content', contentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});

module.exports = app;
