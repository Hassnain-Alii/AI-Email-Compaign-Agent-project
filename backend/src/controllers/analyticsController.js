import CampaignAnalytics from '../models/CampaignAnalytics.js';
import Campaign from '../models/Campaign.js';
import Recipient from '../models/Recipient.js';
import EmailLog from '../models/EmailLog.js';
import mongoose from 'mongoose';

export const getDashboardAnalytics = async (req, res) => {
  // Aggregate data for the user
  const campaigns = await Campaign.find({ userId: req.user._id });
  const campaignIds = campaigns.map(c => c._id);
  
  const totalCampaigns = campaigns.length;
  const totalRecipients = await Recipient.countDocuments({ userId: req.user._id });
  
  const stats = await EmailLog.aggregate([
    { $match: { campaignId: { $in: campaignIds } } },
    {
      $group: {
        _id: null,
        totalSent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
        totalDelivered: { $sum: { $cond: [{ $in: ["$status", ["sent", "delivered"]] }, 1, 0] } },
        totalFailed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        totalOpened: { $sum: { $cond: ["$opened", 1, 0] } },
        totalClicked: { $sum: { $cond: ["$clicked", 1, 0] } },
      }
    }
  ]);

  const recentCampaigns = await Campaign.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalCampaigns,
    totalRecipients,
    stats: stats[0] || {
      totalSent: 0, totalDelivered: 0, totalFailed: 0, totalPending: 0, totalOpened: 0, totalClicked: 0
    },
    recentCampaigns
  });
};

export const getCampaignAnalytics = async (req, res) => {
  const { id } = req.params;
  const campaign = await Campaign.findById(id);

  if (!campaign || campaign.userId.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  let analytics = await CampaignAnalytics.findOne({ campaignId: id });
  
  if (!analytics) {
    // dynamically compute if not cached properly
    const stats = await EmailLog.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: { $cond: [{ $in: ["$status", ["sent", "delivered", "bounced"]] }, 1, 0] } },
          totalDelivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          totalFailed: { $sum: { $cond: [{ $in: ["$status", ["failed", "bounced"]] }, 1, 0] } },
          totalOpened: { $sum: { $cond: ["$opened", 1, 0] } },
          totalClicked: { $sum: { $cond: ["$clicked", 1, 0] } }
        }
      }
    ]);
    
    analytics = stats[0] || {
      totalSent: 0, totalDelivered: 0, totalFailed: 0, totalOpened: 0, totalClicked: 0, bounceRate: 0
    };
  }

  res.json(analytics);
};

export const getEmailLogs = async (req, res) => {
  const { campaignId, status, page = 1, limit = 20 } = req.query;
  
  let query = {};
  
  if (campaignId) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.userId.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Campaign not found');
    }
    query.campaignId = campaignId;
  } else {
    const campaigns = await Campaign.find({ userId: req.user._id });
    query.campaignId = { $in: campaigns.map(c => c._id) };
  }

  if (status) query.status = status;

  const logs = await EmailLog.find(query)
    .populate('recipientId', 'name email')
    .populate('campaignId', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
    
  const total = await EmailLog.countDocuments(query);

  res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
};
