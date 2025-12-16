import express from "express";
import upload from "../config/cloudinary.js"; // <--- 1. IMPORT THIS
import {
  getAllCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  deleteCourse,
  getPendingCourses,
  updateCourseStatus,
  addLecture // <--- 2. IMPORT THIS
} from "../controllers/courseController.js";

const router = express.Router();

// 1. Get All Approved Courses (Public)
router.get("/", getAllCourses);

// 2. Get Pending Courses (Admin) 
// !!! MUST BE BEFORE /:id !!!
router.get("/pending", getPendingCourses); 

// 3. Instructor Routes
// CHANGED: Added upload.single('thumbnail') so you can upload the cover image
router.post("/", upload.single('thumbnail'), createCourse);
router.get("/instructor/:instructorId", getInstructorCourses);

// 4. Update Course Status (Approve/Reject)
router.put("/:id/status", updateCourseStatus);

// 5. Add Lecture Route (Video + Resource)
// CHANGED: Fixed typo 'resourses' -> 'fields'
router.post("/:id/lectures", upload.fields([
  { name: 'videos', maxCount: 5 }, 
  { name: 'resources', maxCount: 5 } 
]), addLecture);

// 6. Get Single Course by ID & Delete (Public)
// These catch generic IDs, so they go last
router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse);

export default router;