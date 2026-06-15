import EmailLog from '../models/EmailLog.js';
import CampaignAnalytics from '../models/CampaignAnalytics.js';
import Campaign from '../models/Campaign.js';

export const handleSendGridWebhook = async (req, res) => {
  const events = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ message: 'Invalid events format' });
  }

  for (const event of events) {
    const { event: eventType, email, campaignId, recipientId, timestamp } = event;
    
    // SendGrid events use the 'category' or custom arguments we pass
    // We should pass campaignId and recipientId as custom args when sending
    
    // In our emailService.js, we are NOT passing these as custom args yet!
    // We need to fix that too.
    
    if (!campaignId) continue;

    try {
      let log;
      if (recipientId && !recipientId.startsWith('direct-')) {
        log = await EmailLog.findOne({ campaignId, recipientId });
      } else {
        log = await EmailLog.findOne({ campaignId, directEmail: email });
      }

      if (log) {
        if (eventType === 'delivered') {
          log.status = 'delivered';
        } else if (eventType === 'open') {
          log.opened = true;
          log.openCount = (log.openCount || 0) + 1;
          log.openedAt = new Date(timestamp * 1000);
        } else if (eventType === 'click') {
          log.clicked = true;
        } else if (eventType === 'bounce' || eventType === 'dropped') {
          log.status = 'bounced';
          log.error = event.reason || eventType;
        }
        await log.save();
      }
    } catch (error) {
      console.error('Error processing SendGrid webhook event:', error);
    }
  }

  res.status(200).json({ received: true });
};
