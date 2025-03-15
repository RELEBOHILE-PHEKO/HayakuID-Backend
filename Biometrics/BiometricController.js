// backend/biometrics/biometricController.js

const BiometricModel = require('./biometricModel'); // Adjust the path if necessary

// Function to add biometric data
exports.addBiometricData = async (req, res) => {
    try {
        const { userId, biometricData } = req.body; // Assume the data comes from the request body
        const newBiometric = new BiometricModel({ userId, biometricData });
        await newBiometric.save();
        res.status(201).json({ message: 'Biometric data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add more functions as needed (e.g., getBiometricData, deleteBiometricData)