import mongoose from 'mongoose';

const campaignAnalyticsSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    totalSent: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },
    totalOpened: { type: Number, default: 0 },
    totalClicked: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const CampaignAnalytics = mongoose.model('CampaignAnalytics', campaignAnalyticsSchema);
export default CampaignAnalytics;
