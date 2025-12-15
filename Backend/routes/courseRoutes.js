import express from 'express';
import { createCourse, getAllCourses, getInstructorCourses } from '../controllers/courseController.js';
import { getCourseById } from '../controllers/courseController.js';



const router = express.Router();

router.post('/', createCourse);               // Create a course
router.get('/', getAllCourses);               // Get all courses (for Learners)
router.get('/instructor/:id', getInstructorCourses); // Get specific instructor's courses
router.get('/:id', getCourseById); // Add this at the end

export default router;