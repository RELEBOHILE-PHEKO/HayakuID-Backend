// biometrics/biometricController.js
export const addBiometricData = (req, res) => {
    try {
        const { userId, biometricData } = req.body;
        // Logic to handle the biometric data (e.g., save to database)
        console.log(`Received biometric data for user ${userId}:`, biometricData);
        res.status(201).json({ message: 'Biometric data added successfully!' });
    } catch (error) {
        console.error('Error adding biometric data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};