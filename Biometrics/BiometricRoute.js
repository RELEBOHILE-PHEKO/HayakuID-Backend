// backend/biometrics/biometricRoutes.js

const express = require('express');
const { addBiometricData } = require('./biometricController'); // Adjust the path if necessary
const router = express.Router();

// Route to add biometric data
router.post('/biometrics', addBiometricData);

// You can add more routes for retrieving and deleting biometric data
// Example: router.get('/biometrics/:userId', getBiometricData);

module.exports = router;