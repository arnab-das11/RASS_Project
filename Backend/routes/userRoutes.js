import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController.js'; // Import it


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers); // <--- Add this line

export default router;