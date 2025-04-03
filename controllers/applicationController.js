const Application = require('../models/Application');

class ApplicationController {
  // Create new application
  async createApplication(req, res) {
    try {
      const application = await Application.create({
        ...req.body,
        applicantId: req.user.id,
        applicationStatus: 'draft',
        statusHistory: [{
          status: 'draft',
          changedBy: req.user.id,
          notes: 'Application created'
        }]
      });

      res.status(201).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all applications (admin)
  async getAllApplications(req, res) {
    try {
      let query = {};

      // Filter by status if provided
      if (req.query.status) {
        query.applicationStatus = req.query.status;
      }

      // Filter by applicant if provided
      if (req.query.applicant) {
        query.applicantId = req.query.applicant;
      }

      // Filter by application type if provided
      if (req.query.type) {
        query.applicationType = req.query.type;
      }

      const applications = await Application.find(query)
        .populate('applicantId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get user applications
  async getUserApplications(req, res) {
    try {
      const applications = await Application.find({ applicantId: req.user.id })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get single application
  async getApplication(req, res) {
    try {
      const application = await Application.findById(req.params.id)
        .populate('applicantId', 'firstName lastName email');

      if (!application) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      // Check if user is authorized (admin or the applicant)
      if (application.applicantId._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, error: 'Not authorized to view this application' });
      }

      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update application
  async updateApplication(req, res) {
    try {
      let application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      // Only the applicant can update draft applications
      if (application.applicantId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, error: 'Not authorized to update this application' });
      }

      // Regular users can only update draft applications
      if (req.user.role !== 'admin' && application.applicationStatus !== 'draft') {
        return res.status(400).json({
          success: false,
          error: 'Cannot update application once submitted. Please contact support.'
        });
      }

      // Update application
      application = await Application.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Change application status (admin only)
  async changeApplicationStatus(req, res) {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Please provide a status' });
      }

      let application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      // Update status and history
      application.applicationStatus = status;
      application.statusHistory.push({
        status,
        changedBy: req.user.id,
        notes: notes || `Status changed to ${status}`
      });

      // If rejected, add rejection reason
      if (status === 'rejected' && notes) {
        application.rejectionReason = notes;
      }

      // If approved, set issue details
      if (status === 'issued') {
        const currentDate = new Date();
        application.issueDate = currentDate;

        // Set expiry date (10 years for ID, 5 years for passport)
        const expiryDate = new Date(currentDate);
        if (application.applicationType === 'national_id') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 10);
        } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 5);
        }
        application.expiryDate = expiryDate;
      }

      await application.save();

      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Submit application
  async submitApplication(req, res) {
    try {
      let application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      // Only the applicant can submit their application
      if (application.applicantId.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized to submit this application' });
      }

      // Can only submit draft applications
      if (application.applicationStatus !== 'draft') {
        return res.status(400).json({
          success: false,
          error: 'Application has already been submitted'
        });
      }

      // Update status and history
      application.applicationStatus = 'submitted';
      application.statusHistory.push({
        status: 'submitted',
        changedBy: req.user.id,
        notes: 'Application submitted by applicant'
      });

      await application.save();

      res.status(200).json({ success: true, data: application });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete application (draft only)
  async deleteApplication(req, res) {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }

      // Only the applicant can delete their draft application
      if (application.applicantId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, error: 'Not authorized to delete this application' });
      }

      // Regular users can only delete draft applications
      if (req.user.role !== 'admin' && application.applicationStatus !== 'draft') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete application once submitted. Please contact support.'
        });
      }

      await application.remove();

      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ApplicationController();