import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  deleteCourse,
  getPendingCourses,
  updateCourseStatus // <--- Comma added here to fix the crash
} from "../controllers/courseController.js";

const router = express.Router();

// 1. Get All Approved Courses (Public)
router.get("/", getAllCourses);

// 2. Get Pending Courses (Admin) 
// !!! MUST BE BEFORE /:id !!!
router.get("/pending", getPendingCourses); 

// 3. Instructor Routes
router.post("/", createCourse);
router.get("/instructor/:instructorId", getInstructorCourses);

// 4. Update Course Status (Approve/Reject)
// This matches the frontend call: /api/courses/:id/status
router.put("/:id/status", updateCourseStatus);

// 5. Get Single Course by ID & Delete (Public)
// These catch generic IDs, so they go last
router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse);

export default router;