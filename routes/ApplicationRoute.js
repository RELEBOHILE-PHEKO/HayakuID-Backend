// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// User routes (all users)
router.route('/')
  .post(applicationController.createApplication)
  .get(applicationController.getUserApplications);

// Submit application
router.route('/:id/submit')
  .put(applicationController.submitApplication);

// Single application operations
router.route('/:id')
  .get(applicationController.getApplication)
  .put(applicationController.updateApplication)
  .delete(applicationController.deleteApplication);

// Admin only routes
router.route('/admin/all')
  .get(authorize('admin'), applicationController.getAllApplications);

// Change application status (admin only)
router.route('/:id/status')
  .put(authorize('admin'), applicationController.changeApplicationStatus);

module.exports = router;