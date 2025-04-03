// controllers/DocumentController.js
const Document = require('../models/Document');
const Application = require('../models/Application');

class DocumentController {
  // Upload document
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.id;
      const { documentType, applicationId } = req.body;

      // Verify application exists and belongs to user
      const application = await Application.findOne({
        _id: applicationId,
        applicantId: userId
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Create document record
      const document = new Document({
        userId,
        applicationId,
        documentType,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadDate: new Date(),
        status: 'pending_verification'
      });

      await document.save();

      // Update application documents array if it exists
      if (!application.documents) {
        application.documents = [];
      }

      application.documents.push({
        documentId: document._id,
        documentType,
        status: 'pending_verification'
      });

      await application.save();

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document._id,
          documentType,
          fileName: document.originalName,
          uploadDate: document.uploadDate,
          status: document.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

// Create and export an instance of the controller
const documentController = new DocumentController();
module.exports = documentController;