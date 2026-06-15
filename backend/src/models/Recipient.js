import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecipientList',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// A recipient email should be unique per user
recipientSchema.index({ userId: 1, email: 1 }, { unique: true });

const Recipient = mongoose.model('Recipient', recipientSchema);
export default Recipient;
