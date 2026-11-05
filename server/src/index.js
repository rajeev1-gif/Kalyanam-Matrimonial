const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const errorHandler = require('./middleware/errorHandler');
const setupChatSockets = require('./sockets/chatSocket');

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const interestRoutes = require('./routes/interestRoutes');
const shortlistRoutes = require('./routes/shortlistRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }
});
app.set('io', io);
setupChatSockets(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Kalyanam Matrimony API',
    status: 'online',
    version: '1.0.0',
    health: '/api/health',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Kalyanam Matrimony API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/shortlists', shortlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Kalyanam Matrimonial Server running on port ${PORT}`);
  console.log(`🌐 Client allowed origin: ${CLIENT_URL}`);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server };

