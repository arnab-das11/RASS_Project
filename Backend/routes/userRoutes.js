import express from 'express';
// Note: getEnrolledCourses added to the import list!
import { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  googleLogin, 
  enrollCourse, 
  getEnrolledCourses,
  markAsComplete
} from '../controllers/userController.js';

const router = express.Router();

// --- AUTHENTICATION ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/', getAllUsers); 

// --- LEARNER DASHBOARD ROUTES ---
router.post('/enroll', enrollCourse); // To join a course
router.get('/:id/enrolled', getEnrolledCourses); // <--- NEW ROUTE: To fetch courses for the dashboard
// Note: Add markAsComplete to your imports at the top!
router.put('/progress', markAsComplete); // <--- NEW ROUTE

export default router;