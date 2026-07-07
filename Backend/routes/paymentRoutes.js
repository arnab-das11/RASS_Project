import express from 'express';
import { createOrder, verifyAndEnroll, claimReward } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-enroll', verifyAndEnroll);
router.post('/claim-reward', claimReward);

export default router;
