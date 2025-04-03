// models/Document.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['passport', 'id_card', 'driving_license', 'utility_bill', 'bank_statement', 'other']
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verificationDate: {
    type: Date
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected'],
    default: 'pending_verification'
  },
  rejectionReason: {
    type: String
  },
  metadata: {
    type: Object
  },
  expiryDate: {
    type: Date
  }
});

// Indexes for faster queries
DocumentSchema.index({ userId: 1, applicationId: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', DocumentSchema);