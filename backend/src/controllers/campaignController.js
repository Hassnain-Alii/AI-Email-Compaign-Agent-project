import Campaign from '../models/Campaign.js';
import Recipient from '../models/Recipient.js';
import { generateEmailContent, improveEmailContent, generateSubjectLines, analyzeSpamRisk } from '../services/aiService.js';
import { emailQueue } from '../services/emailService.js';

export const createCampaign = async (req, res) => {
  const { title, subject, prompt, isHtml, htmlContent, generationType } = req.body;

  const campaign = await Campaign.create({
    title,
    subject: subject || 'No Subject',
    prompt,
    isHtml,
    htmlContent,
    generationType: generationType || 'ai',
    fromEmail: req.body.fromEmail || process.env.FROM_EMAIL,
    status: 'draft',
    userId: req.user._id,
  });

  res.status(201).json(campaign);
};

export const getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ userId: req.user._id })
    .populate('recipientListId', 'name')
    .sort({ createdAt: -1 });
  res.json(campaigns);
};

export const getCampaignById = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('recipientListId', 'name');

  if (campaign && campaign.userId.toString() === req.user._id.toString()) {
    res.json(campaign);
  } else {
    res.status(404);
    throw new Error('Campaign not found');
  }
};

export const updateCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (campaign && campaign.userId.toString() === req.user._id.toString()) {
    campaign.title = req.body.title || campaign.title;
    campaign.subject = req.body.subject || campaign.subject;
    campaign.fromEmail = req.body.fromEmail !== undefined ? req.body.fromEmail : campaign.fromEmail;
    campaign.prompt = req.body.prompt || campaign.prompt;
    campaign.generatedEmail = req.body.generatedEmail || campaign.generatedEmail;
    campaign.htmlContent = req.body.htmlContent !== undefined ? req.body.htmlContent : campaign.htmlContent;
    campaign.isHtml = req.body.isHtml !== undefined ? req.body.isHtml : campaign.isHtml;
    campaign.generationType = req.body.generationType || campaign.generationType;
    campaign.recipientListId = req.body.recipientListId !== undefined ? req.body.recipientListId : campaign.recipientListId;
    
    if (req.body.directRecipients !== undefined) {
      if (typeof req.body.directRecipients === 'string') {
        campaign.directRecipients = req.body.directRecipients.split(',').map(e => e.trim()).filter(e => e);
      } else {
        campaign.directRecipients = req.body.directRecipients;
      }
    }

    campaign.status = req.body.status || campaign.status;
    campaign.scheduledAt = req.body.scheduledAt || campaign.scheduledAt;

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } else {
    res.status(404);
    throw new Error('Campaign not found');
  }
};

export const deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (campaign && campaign.userId.toString() === req.user._id.toString()) {
    await Campaign.deleteOne({ _id: campaign._id });
    res.json({ message: 'Campaign removed' });
  } else {
    res.status(404);
    throw new Error('Campaign not found');
  }
};

export const duplicateCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (campaign && campaign.userId.toString() === req.user._id.toString()) {
    const newCampaign = await Campaign.create({
      title: `${campaign.title} (Copy)`,
      subject: campaign.subject,
      fromEmail: campaign.fromEmail,
      prompt: campaign.prompt,
      generatedEmail: campaign.generatedEmail,
      htmlContent: campaign.htmlContent,
      isHtml: campaign.isHtml,
      generationType: campaign.generationType,
      recipientListId: campaign.recipientListId,
      directRecipients: campaign.directRecipients,
      status: 'draft',
      userId: req.user._id,
    });
    res.status(201).json(newCampaign);
  } else {
    res.status(404);
    throw new Error('Campaign not found');
  }
};

export const generateEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tone, instructions } = req.body;
    const campaign = await Campaign.findById(id);

    if (!campaign || campaign.userId.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    const promptToUse = instructions || campaign.prompt;
    const generatedContent = await generateEmailContent(promptToUse, campaign.subject, tone);
    
    if (campaign.isHtml) {
        campaign.htmlContent = generatedContent;
    } else {
        campaign.generatedEmail = generatedContent;
    }
    await campaign.save();

    res.json({ generatedEmail: generatedContent });
  } catch (error) {
    next(error);
  }
};

export const sendCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign || campaign.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (['sending', 'completed'].includes(campaign.status)) {
      return res.status(400).json({ message: 'Campaign already processed' });
    }

    const hasDirect = campaign.directRecipients?.length > 0;
    if (!campaign.recipientListId && !hasDirect) {
      return res.status(400).json({ message: 'No recipients selected' });
    }

    let recipients = [];
    if (campaign.recipientListId) {
      recipients = await Recipient.find({ lists: campaign.recipientListId, userId: req.user._id });
    }

    if (hasDirect) {
      const directOnes = campaign.directRecipients.map(email => ({
        _id: `direct-${email}`,
        email: email,
        name: email.split('@')[0],
      }));
      recipients = [...recipients, ...directOnes];
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Recipient list is empty' });
    }

    const content = campaign.isHtml ? campaign.htmlContent : campaign.generatedEmail;
    if (!content) {
      return res.status(400).json({ message: 'Email content is missing' });
    }

    campaign.status = 'sending';
    campaign.sentAt = new Date();
    await campaign.save();

    // Queue jobs
    for (const recipient of recipients) {
      await emailQueue.add('send-email', {
        recipientId: recipient._id,
        campaignId: campaign._id,
        email: recipient.email,
        name: recipient.name,
        subject: campaign.subject,
        content,
        isHtml: campaign.isHtml,
        fromEmail: campaign.fromEmail || process.env.FROM_EMAIL,
      }, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 }
      });
    }

    // Batch queued
    campaign.status = 'completed'; 
    await campaign.save();

    res.json({ message: 'Campaign is being processed' });
  } catch (error) {
    next(error);
  }
};

export const getVerifiedSenders = async (req, res) => {
  try {
    const client = (await import('@sendgrid/client')).default;
    client.setApiKey(process.env.SENDGRID_API_KEY);

    // Try to get verified single senders
    const request = {
      method: 'GET',
      url: '/v3/verified_senders'
    };

    const [response, body] = await client.request(request);
    
    let senders = [];
    if (response.statusCode === 200 && body.results) {
      senders = body.results.map(s => s.from_email);
    }

    // Also try to get verified domains as a fallback/addition
    try {
      const [domainRes, domainBody] = await client.request({
        method: 'GET',
        url: '/v3/whitelabel/domains'
      });
      if (domainRes.statusCode === 200 && domainBody) {
        // We can't easily get individual emails from a domain, 
        // but we can at least know the domain is verified.
        // For now, let's stick to explicitly verified senders.
      }
    } catch (e) {
      // Ignore domain fetch failures
    }

    // If no senders found via API, use the env fallback but don't call it 'Default' in UI
    if (senders.length === 0 && process.env.FROM_EMAIL) {
      senders = [process.env.FROM_EMAIL];
    }

    // Remove duplicates
    senders = [...new Set(senders)];

    res.json(senders);
  } catch (error) {
    console.error('Error fetching SendGrid senders:', error);
    res.json(process.env.FROM_EMAIL ? [process.env.FROM_EMAIL] : []);
  }
};

