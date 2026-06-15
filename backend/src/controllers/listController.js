import RecipientList from '../models/RecipientList.js';
import Recipient from '../models/Recipient.js';

export const getLists = async (req, res) => {
  const lists = await RecipientList.find({ userId: req.user._id }).sort({ createdAt: -1 });
  
  // Get counts for each list
  const listsWithCounts = await Promise.all(lists.map(async (list) => {
    const count = await Recipient.countDocuments({ lists: list._id, userId: req.user._id });
    return { ...list.toObject(), recipientCount: count };
  }));

  res.json(listsWithCounts);
};

export const createList = async (req, res) => {
  const { name, description } = req.body;

  const listExists = await RecipientList.findOne({ name, userId: req.user._id });
  if (listExists) {
    res.status(400);
    throw new Error('List already exists');
  }

  const list = await RecipientList.create({
    name,
    description,
    userId: req.user._id,
  });

  res.status(201).json({ ...list.toObject(), recipientCount: 0 });
};

export const updateList = async (req, res) => {
  const list = await RecipientList.findById(req.params.id);

  if (list && list.userId.toString() === req.user._id.toString()) {
    list.name = req.body.name || list.name;
    list.description = req.body.description !== undefined ? req.body.description : list.description;
    
    const updatedList = await list.save();
    
    const count = await Recipient.countDocuments({ lists: updatedList._id, userId: req.user._id });
    res.json({ ...updatedList.toObject(), recipientCount: count });
  } else {
    res.status(404);
    throw new Error('List not found');
  }
};

export const deleteList = async (req, res) => {
  const list = await RecipientList.findById(req.params.id);

  if (list && list.userId.toString() === req.user._id.toString()) {
    await Recipient.updateMany(
      { lists: list._id },
      { $pull: { lists: list._id } }
    );
    await RecipientList.deleteOne({ _id: list._id });
    res.json({ message: 'List removed' });
  } else {
    res.status(404);
    throw new Error('List not found');
  }
};
