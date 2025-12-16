import Course from "../models/Course.js";

// @desc    Get all approved courses (Public)
// @route   GET /api/courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).populate("instructorId", "name");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructorId", "name");
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, thumbnail, instructorId } = req.body;

    if (!title || !description || !instructorId) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const course = new Course({
      title,
      description,
      category,
      level,
      duration,
      thumbnail, 
      instructorId,
      status: "pending", // Default to pending approval
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses for specific instructor
// @route   GET /api/courses/instructor/:instructorId
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.params.instructorId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      await course.deleteOne();
      res.json({ message: "Course removed" });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending courses (Admin only)
// @route   GET /api/courses/pending
export const getPendingCourses = async (req, res) => {
  try {
    // This specifically looks for "pending" status
    const courses = await Course.find({ status: "pending" }).populate("instructorId", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course status (Approve/Reject)
// @route   PUT /api/courses/:id/status
export const updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expects "approved" or "rejected"
    const course = await Course.findById(req.params.id);

    if (course) {
      course.status = status;
      // Optional: Update boolean flag if you use one
      // course.isApproved = (status === 'approved');
      
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};