// routes/DocumentRoute.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/DocumentControllers');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');

// Ensure we're using the correct middleware name from your auth middleware
const authMiddleware = auth.authenticate || auth.protect || auth.verifyToken;

// Check if middleware exists
if (!authMiddleware) {
  console.error('Warning: Auth middleware not found. Routes will be unprotected!');
}

// Define middleware to use (fallback to empty middleware if auth not available)
const protect = authMiddleware || ((req, res, next) => next());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload document route
router.post('/upload', protect, upload.single('document'), documentController.uploadDocument);

// Get documents for an application
router.get('/application/:applicationId', protect, async (req, res) => {
  try {
    const Document = require('../models/Document');
    const documents = await Document.find({
      applicationId: req.params.applicationId,
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin route to verify documents
router.put('/:id/verify', protect, async (req, res) => {
  try {
    const Document = require('../models/Document');
    const Application = require('../models/Application');
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "verified" or "rejected"'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    document.status = status;
    document.verificationDate = new Date();
    document.verifiedBy = req.user.id;

    if (status === 'rejected' && rejectionReason) {
      document.rejectionReason = rejectionReason;
    }

    await document.save();

    // Update the related application document reference
    const application = await Application.findById(document.applicationId);
    if (application && application.documents) {
      const docRef = application.documents.find(
        doc => doc.documentId && doc.documentId.toString() === document._id.toString()
      );

      if (docRef) {
        docRef.status = status;
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single document
router.get('/:id', protect, async (req, res) => {
  try {
    const Document = require('../models/Document');
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check authorization
    if (
      document.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this document'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete document (only if application is in draft status)
router.delete('/:id', protect, async (req, res) => {
  try {
    const Document = require('../models/Document');
    const Application = require('../models/Application');
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check authorization
    if (
      document.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this document'
      });
    }

    // Check if application is in draft status
    const application = await Application.findById(document.applicationId);

    if (
      req.user.role !== 'admin' &&
      application &&
      application.applicationStatus !== 'draft'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete document once application is submitted'
      });
    }

    // Remove document reference from application
    if (application && application.documents) {
      application.documents = application.documents.filter(
        doc => doc.documentId && doc.documentId.toString() !== document._id.toString()
      );
      await application.save();
    }

    // Delete the actual file (you would need filesystem access)
    // require('fs').unlinkSync(document.path);

    // Remove document from database
    await Document.findByIdAndDelete(document._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;