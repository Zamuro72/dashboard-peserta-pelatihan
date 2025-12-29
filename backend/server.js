// backend/server.js - UPDATED
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/auth.js';
import pesertaRoutes from './api/peserta.js';
import uploadRoutes from './api/upload.js';
import reminderRoutes from './api/reminder.js';
import telatBayarRoutes from './api/telatBayar.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/peserta', pesertaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/telat-bayar', telatBayarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});