import express from 'express';
import {
  sendMessage,
  getChatHistory,
  markAsRead,
  getUnreadMessages,
  getAdmins
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);
router.get('/chat/:userId1/:userId2', getChatHistory);
router.put('/read', markAsRead);
router.get('/unread/:receiverId', getUnreadMessages);
router.get('/admins', getAdmins);

export default router;
