import express from 'express';
import { registerUser, loginUser, getAllUsers, googleLogin } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin); // <--- NEW ROUTE
router.get('/', getAllUsers); 

export default router;