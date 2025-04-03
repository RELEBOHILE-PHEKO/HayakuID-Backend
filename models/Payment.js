// models/Payment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'Mpesa', 'stripe', 'Ecocash']
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['application_fee', 'document_processing', 'expedited_service', 'consultation', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to exist
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  processingDate: {
    type: Date
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceId: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String
  },
  metadata: {
    type: Object
  },
  refundAmount: {
    type: Number
  },
  refundDate: {
    type: Date
  },
  refundReason: {
    type: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  paymentGatewayResponse: {
    type: Object
  }
}, {
  timestamps: true
});

// Indexes for faster queries
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ applicationId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentDate: 1 });
PaymentSchema.index({ transactionId: 1 });

// Methods
PaymentSchema.methods.markAsCompleted = async function(transactionId) {
  this.status = 'completed';
  this.transactionId = transactionId;
  this.processingDate = new Date();
  return this.save();
};

PaymentSchema.methods.generateReceiptNumber = function() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.receiptNumber = `RCPT-${timestamp}-${randomStr}`;
  return this.receiptNumber;
};

// Static methods
PaymentSchema.statics.getPaymentsByApplication = function(applicationId) {
  return this.find({ applicationId }).sort({ paymentDate: -1 });
};

PaymentSchema.statics.getTotalPaidByUser = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

module.exports = mongoose.model('Payment', PaymentSchema);