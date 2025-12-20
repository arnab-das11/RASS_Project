import express from "express";
import upload from "../config/cloudinary.js"; 
import {
  getAllCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  deleteCourse,
  getPendingCourses,
  updateCourseStatus,
  requestDeleteCourse, // <--- NEW IMPORT
  addLecture
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/pending", getPendingCourses); // Admin
router.post("/", upload.single('thumbnail'), createCourse);
router.get("/instructor/:instructorId", getInstructorCourses);

// --- NEW ROUTE ---
router.put("/:id/request-delete", requestDeleteCourse);

router.put("/:id/status", updateCourseStatus);
router.post("/:id/lectures", upload.fields([
  { name: 'videos', maxCount: 5 }, 
  { name: 'resources', maxCount: 5 } 
]), addLecture);

router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse); // Admin Force Delete

export default router;