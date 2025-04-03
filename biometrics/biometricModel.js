// backend/biometrics/biometricModel.js

const mongoose = require('mongoose');

const biometricSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    biometricData: { type: Object, required: true }, // Use Object or define a specific structure
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Biometric', biometricSchema);