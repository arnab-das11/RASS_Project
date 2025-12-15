import Course from '../models/Course.js';

// @desc    Create a new Course
// @route   POST /api/courses
export const createCourse = async (req, res) => {
  try {
    const { title, description, level, duration, thumbnail } = req.body;

    // We assume the user is logged in and we have their ID (we will add security middleware later)
    // For now, we will send the instructorId from the frontend manually
    const newCourse = new Course({
      title,
      description,
      level: level || "Beginner",
      duration: duration || "Self-paced",
      thumbnail: thumbnail || "",
      instructor: req.body.instructorId, // This links the course to the specific instructor
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses by a specific Instructor
// @route   GET /api/courses/instructor/:id
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL courses (For the Explore Page)
// @route   GET /api/courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Course by ID
// @route   GET /api/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};