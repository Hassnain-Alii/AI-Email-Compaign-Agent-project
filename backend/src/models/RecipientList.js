import mongoose from 'mongoose';

const recipientListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecipientList = mongoose.model('RecipientList', recipientListSchema);
export default RecipientList;
