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
  addLecture,
  updateCourse,
  requestEditCourse,
  approveEditCourse,
  rejectEditCourse,
  deleteLecture
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/pending", getPendingCourses); // Admin
router.post("/", upload.single('thumbnail'), createCourse);
router.get("/instructor/:instructorId", getInstructorCourses);

// --- NEW ROUTES ---
router.put("/:id/request-delete", requestDeleteCourse);
router.put("/:id/request-edit", requestEditCourse);
router.put("/:id/approve-edit", approveEditCourse);
router.put("/:id/reject-edit", rejectEditCourse);
router.delete("/:id/lectures/:lectureId", deleteLecture);

router.put("/:id/status", updateCourseStatus);
router.post("/:id/lectures", upload.fields([
  { name: 'videos', maxCount: 5 }, 
  { name: 'resources', maxCount: 5 } 
]), addLecture);

router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse); // Admin Force Delete
router.put('/:id', upload.single('thumbnail'), updateCourse); // Allows Admin/Instructor to edit course details with optional thumbnail upload

export default router;