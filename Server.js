const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config(); // Load environment variables
const dbConnection = require('./config/db'); // Your database connection
const UserRoute = require('./routes/UserRoute'); // User routes
const BiometricRoute = require('./biometrics/biometricRoute'); // Biometric routes
const PaymentRoute = require('./routes/PaymentRoute'); // Payment routes
require('./config/Passport')(passport); // Passport configuration

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database connection
dbConnection().then(() => {
    console.log('Database connected successfully');
}).catch(err => {
    console.error('Database connection error:', err);
});

// routes
app.use('/api/users', UserRoute);
app.use('/api/biometric', BiometricRoute);
app.use('/api/payments', PaymentRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});