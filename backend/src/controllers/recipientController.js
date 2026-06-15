import Recipient from '../models/Recipient.js';
import RecipientList from '../models/RecipientList.js';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { createObjectCsvStringifier } from 'csv-writer';

const upload = multer({ dest: 'uploads/' });

export const getRecipients = async (req, res) => {
  const { listId, search, page = 1, limit = 20 } = req.query;

  let query = { userId: req.user._id };

  if (listId) {
    query.lists = listId;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const recipients = await Recipient.find(query)
    .populate('lists', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Recipient.countDocuments(query);

  res.json({ recipients, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const addRecipient = async (req, res) => {
  const { name, email, lists } = req.body;

  const recipientExists = await Recipient.findOne({ email, userId: req.user._id });
  if (recipientExists) {
    res.status(400);
    throw new Error('Recipient already exists for this user');
  }

  const recipient = await Recipient.create({
    name,
    email,
    userId: req.user._id,
    lists: lists || [],
  });

  res.status(201).json(recipient);
};

export const updateRecipient = async (req, res) => {
  const recipient = await Recipient.findById(req.params.id);

  if (recipient && recipient.userId.toString() === req.user._id.toString()) {
    recipient.name = req.body.name || recipient.name;
    recipient.email = req.body.email || recipient.email;
    recipient.lists = req.body.lists !== undefined ? req.body.lists : recipient.lists;

    const updatedRecipient = await recipient.save();
    res.json(updatedRecipient);
  } else {
    res.status(404);
    throw new Error('Recipient not found');
  }
};

export const removeRecipient = async (req, res) => {
  const recipient = await Recipient.findById(req.params.id);

  if (recipient && recipient.userId.toString() === req.user._id.toString()) {
    await Recipient.deleteOne({ _id: recipient._id });
    res.json({ message: 'Recipient removed' });
  } else {
    res.status(404);
    throw new Error('Recipient not found');
  }
};

export const bulkDeleteRecipients = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    res.status(400);
    throw new Error('Invalid request');
  }

  await Recipient.deleteMany({ _id: { $in: ids }, userId: req.user._id });
  res.json({ message: 'Recipients removed' });
};

export const exportRecipientsCSV = async (req, res) => {
  const { listId } = req.query;
  let query = { userId: req.user._id };
  if (listId) query.lists = listId;

  const recipients = await Recipient.find(query).populate('lists', 'name');

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'lists', title: 'Lists' },
      { id: 'createdAt', title: 'Added Date' }
    ]
  });

  const records = recipients.map(r => ({
    name: r.name,
    email: r.email,
    lists: r.lists.map(l => l.name).join(', '),
    createdAt: new Date(r.createdAt).toISOString()
  }));

  const csvHeader = csvStringifier.getHeaderString();
  const csvRecords = csvStringifier.stringifyRecords(records);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="recipients.csv"');
  res.send(csvHeader + csvRecords);
};

export const uploadRecipientsCSV = async (req, res) => {
  const { listId } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const results = [];
  const parseErrors = [];

  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (data) => {
      const email = data.email || data.Email || data.EMAIL;
      const name = data.name || data.Name || data.NAME || '';

      if (email) {
        results.push({ email, name, userId: req.user._id, lists: listId ? [listId] : [] });
      } else {
        parseErrors.push(data);
      }
    })
    .on('end', async () => {
      let added = 0;
      let updated = 0;

      for (const item of results) {
        try {
          const existing = await Recipient.findOne({ email: item.email, userId: req.user._id });
          if (existing) {
            if (listId && !existing.lists.includes(listId)) {
              existing.lists.push(listId);
              await existing.save();
              updated++;
            }
          } else {
            await Recipient.create(item);
            added++;
          }
        } catch (error) {
          // ignoring dup errors inherently
        }
      }

      fs.unlinkSync(req.file.path); 

      res.json({
        message: 'CSV processing complete',
        added,
        updated,
        parseErrors: parseErrors.length,
      });
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500);
      throw new Error(`CSV Parsing error: ${error.message}`);
    });
};

export const uploadMiddleware = upload.single('file');
