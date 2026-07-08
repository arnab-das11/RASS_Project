import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: 'Sender, receiver, and text are required' });
    }

    const message = new Message({
      sender,
      receiver,
      text
    });

    const savedMessage = await message.save();
    
    // Populate sender name/email for immediate rendering
    const populated = await Message.findById(savedMessage._id)
      .populate('sender', 'name email profilePicture')
      .populate('receiver', 'name email profilePicture');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat history between two users
// @route   GET /api/messages/chat/:userId1/:userId2
export const getChatHistory = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email profilePicture')
    .populate('receiver', 'name email profilePicture');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages from a specific sender to receiver as read
// @route   PUT /api/messages/read
export const markAsRead = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver) {
      return res.status(400).json({ message: 'Sender and receiver are required' });
    }

    await Message.updateMany(
      { sender, receiver, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unread messages for a specific receiver
// @route   GET /api/messages/unread/:receiverId
export const getUnreadMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const unread = await Message.find({ receiver: receiverId, read: false })
      .populate('sender', 'name email profilePicture');
    res.json(unread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get administrator users
// @route   GET /api/messages/admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email profilePicture');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
