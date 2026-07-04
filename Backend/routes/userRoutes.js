import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  googleLogin, 
  enrollCourse, 
  getEnrolledCourses,
  markAsComplete,
  unenrollCourse,
  passExam
} from '../controllers/userController.js';

const router = express.Router();

// --- AUTHENTICATION ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/', getAllUsers); 

// --- LEARNER DASHBOARD ROUTES ---
router.post('/enroll', enrollCourse); // To join a course
router.get('/:id/enrolled', getEnrolledCourses); // To fetch courses for the dashboard
router.put('/progress', markAsComplete); // To save video progress
router.post('/unenroll', unenrollCourse); // To remove a student from a course
router.put('/pass-exam', passExam); // To save passed exam status

export default router;