// biometrics/biometricRoutes.js
const express = require('express');
const { addBiometricData } = require('./biometricController'); // Ensure the correct path
const router = express.Router();

// Route to add biometric data
router.post('/biometrics', addBiometricData);

module.exports = router; // Use module.exports for CommonJS