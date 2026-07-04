import express from 'express';
import { generateQuiz, generateFinalExam, getRecommendations } from '../controllers/aiController.js';

const router = express.Router();

// POST route to send the course info and get a quiz back
router.post('/generate-quiz', generateQuiz);
router.post('/generate-final-exam', generateFinalExam);
router.post('/recommendations', getRecommendations);

export default router;