// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/DocumentControllers');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadMiddleware.js');

// Protect all routes
router.use(protect);

// Upload document
router.post(
  '/upload',
  upload.single('document'),
  documentController.uploadDocument
);

// Additional routes needed based on your schema functionality
// Get documents for an application
router.get('/application/:applicationId', async (req, res) => {
  try {
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
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
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
      if (application) {
        const docRef = application.documents.find(
          doc => doc.documentId.toString() === document._id.toString()
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
  }
);

// Get a single document
router.get('/:id', async (req, res) => {
  try {
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
router.delete('/:id', async (req, res) => {
  try {
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
        doc => doc.documentId.toString() !== document._id.toString()
      );
      await application.save();
    }

    // Delete the document file (you would need a file service implementation)
    // fileService.deleteFile(document.path);

    // Remove document from database
    await document.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;