const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  applicationType: {
    type: String,
    required: [true, 'Please specify the application type'],
    enum: ['national_id', 'passport', 'emergency_travel_document', 'renewal']
  },
  applicantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'Please add first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please add last name'],
      trim: true
    },
    otherNames: String,
    dateOfBirth: {
      type: Date,
      required: [true, 'Please add date of birth']
    },
    placeOfBirth: {
      type: String,
      required: [true, 'Please add place of birth']
    },
    gender: {
      type: String,
      required: [true, 'Please specify gender'],
      enum: ['male', 'female', 'other']
    },
    nationality: {
      type: String,
      default: 'Lesotho'
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    }
  },
  contactInfo: {
    address: {
      street: String,
      city: String,
      district: {
        type: String,
        enum: [
          'Maseru', 'Berea', 'Leribe', 'Botha-Bothe', 'Mokhotlong',
          'Qachas Nek', 'Quthing', 'Mohales Hoek', 'Mafeteng', 'Thaba-Tseka'
        ]
      },
      postalCode: String
    },
    phoneNumber: String,
    emailAddress: String
  },
  applicationStatus: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'additional_info_required', 'approved', 'rejected', 'issued'],
    default: 'draft'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'additional_info_required', 'approved', 'rejected', 'issued']
    },
    changedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  appointmentDate: Date,
  officerNotes: String,
  biometricsCaptured: {
    type: Boolean,
    default: false
  },
  rejectionReason: String,
  documentNumber: String, // ID or Passport number when issued
  issueDate: Date,
  expiryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);