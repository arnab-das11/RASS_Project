import express from 'express';
import {
  submitFeedback,
  getCourseFeedbacks,
  getInstructorFeedbacks
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/course/:courseId', getCourseFeedbacks);
router.get('/instructor/:instructorId', getInstructorFeedbacks);

export default router;
