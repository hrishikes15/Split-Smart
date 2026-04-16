const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS) || 5000;

let isDbConnected = false;
let reconnectTimer = null;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

app.get('/api/health', (req, res) => {
  const status = isDbConnected ? 'ok' : 'degraded';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void connectToMongoWithRetry();
  }, DB_RETRY_MS);
}

async function connectToMongoWithRetry() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing. Set it in backend/.env');
    return;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isDbConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    isDbConnected = false;
    console.error(`MongoDB connection failed. Retrying in ${DB_RETRY_MS}ms...`);
    console.error(err.message);
    scheduleReconnect();
  }
}

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn(`MongoDB disconnected. Retrying in ${DB_RETRY_MS}ms...`);
  scheduleReconnect();
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('MongoDB reconnected');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

void connectToMongoWithRetry();
