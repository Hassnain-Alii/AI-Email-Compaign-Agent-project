import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipient',
    },
    directEmail: { // Added for manual recipients
      type: String
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
      default: 'pending',
    },
    opened: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    openCount: { type: Number, default: 0 },
    openedAt: { type: Date },
    sentAt: { type: Date },
    error: { type: String },
    responseCode: { type: mongoose.Schema.Types.Mixed }, // String or Number
    responseBody: { type: String },
    isMock: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
