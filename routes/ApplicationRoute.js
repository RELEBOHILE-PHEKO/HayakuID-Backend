// routes/ApplicationRoute.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/ApplicationController');
const auth = require('../middlewares/authMiddleware');

// Ensure we're using the correct middleware name from your auth middleware
const authMiddleware = auth.authenticate || auth.protect || auth.verifyToken;

// Check if middleware exists
if (!authMiddleware) {
  console.error('Warning: Auth middleware not found. Routes will be unprotected!');
}

// Define middleware to use (fallback to empty middleware if auth not available)
const protect = authMiddleware || ((req, res, next) => next());

// Base routes
router.post('/', protect, applicationController.createApplication);
router.get('/', protect, applicationController.getUserApplications);

// Submit application
router.put('/:id/submit', protect, applicationController.submitApplication);

// Single application operations
router.get('/:id', protect, applicationController.getApplication);
router.put('/:id', protect, applicationController.updateApplication);
router.delete('/:id', protect, applicationController.deleteApplication);

// Admin routes
router.get('/admin/all', protect, applicationController.getAllApplications);

// Change application status (admin only)
router.put('/:id/status', protect, applicationController.changeApplicationStatus);

module.exports = router;