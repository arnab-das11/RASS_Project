import express from 'express';
import { generateQuiz, generateFinalExam, getRecommendations, generateVoiceQuestion, verifyVoiceAnswer, generateSummary } from '../controllers/aiController.js';

const router = express.Router();

// POST route to send the course info and get a quiz back
router.post('/generate-quiz', generateQuiz);
router.post('/generate-final-exam', generateFinalExam);
router.post('/recommendations', getRecommendations);
router.post('/generate-voice-question', generateVoiceQuestion);
router.post('/verify-voice-answer', verifyVoiceAnswer);
router.post('/generate-summary', generateSummary);

export default router;