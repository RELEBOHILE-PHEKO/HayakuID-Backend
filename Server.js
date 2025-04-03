const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting
require('dotenv').config();

// Database and routes
const dbConnection = require('./config/db');
const UserRoute = require('./routes/UserRoute');
const BiometricRoute = require('./biometrics/biometricRoute');
const PaymentRoute = require('./routes/PaymentRoute');
require('./config/Passport')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport initialization
app.use(passport.initialize());

// Database connection with better error handling
dbConnection().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// API routes
app.use('/api/users', UserRoute);
app.use('/api/biometric', BiometricRoute);
app.use('/api/payments', PaymentRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Biometric API Service');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Server startup
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});