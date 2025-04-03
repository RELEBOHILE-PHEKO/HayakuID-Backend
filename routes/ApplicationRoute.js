// routes/ApplicationRoute.js
const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { authenticate } = require('../middlewares/authMiddleware'); // Make sure this import matches your actual auth middleware

// Base routes
router.post('/', authenticate, ApplicationController.createApplication);
router.get('/', authenticate, ApplicationController.getUserApplications);

// Submit application
router.put('/:id/submit', authenticate, ApplicationController.submitApplication);

// Single application operations
router.get('/:id', authenticate, ApplicationController.getApplication);
router.put('/:id', authenticate, ApplicationController.updateApplication);
router.delete('/:id', authenticate, ApplicationController.deleteApplication);

// Admin routes
router.get('/admin/all', authenticate, ApplicationController.getAllApplications);

// Change application status (admin only)
router.put('/:id/status', authenticate, ApplicationController.changeApplicationStatus);

module.exports = router;