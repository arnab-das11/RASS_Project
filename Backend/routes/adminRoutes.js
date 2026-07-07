import express from 'express';
import { getAdminStats, clearUsers } from '../controllers/adminController.js';

const router = express.Router();
router.get('/stats', getAdminStats);
router.delete('/reset-users', clearUsers);

export default router;