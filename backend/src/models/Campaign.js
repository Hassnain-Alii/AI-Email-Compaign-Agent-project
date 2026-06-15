import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
    },
    generatedEmail: {
      type: String, // Plaintext or HTML depending on generation
    },
    htmlContent: {
      type: String, // Explicit HTML content for manual editor
    },
    isHtml: {
      type: Boolean,
      default: true,
    },
    fromEmail: {
      type: String,
    },
    generationType: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'ai',
    },
    status: {
      type: String, // 'draft', 'scheduled', 'sending', 'completed', 'failed'
      enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'],
      default: 'draft',
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipientList',
    },
    directRecipients: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
