require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => console.log(`Backend API listening on port ${port}`));
  const connectWithRetry = () => {
    connectDB().catch((error) => {
      console.error(`MongoDB connection failed; retrying in 15 seconds: ${error.message}`);
      const retry = setTimeout(connectWithRetry, 15000);
      retry.unref();
    });
  };
  connectWithRetry();
  return server;
};

if (require.main === module) startServer();

module.exports = { app, startServer };
