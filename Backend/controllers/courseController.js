import Course from "../models/Course.js";

// @desc    Get all approved courses (Public)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).populate("instructorId", "name");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructorId", "name");
    if (course) res.json(course);
    else res.status(404).json({ message: "Course not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, instructorId, learningObjectives } = req.body;
    if (!req.file) return res.status(400).json({ message: "Thumbnail image is required" });

    // --- NEW: Parse learning objectives from the FormData ---
    let parsedObjectives = [];
    if (learningObjectives) {
        try {
            parsedObjectives = JSON.parse(learningObjectives);
        } catch (e) {
            console.error("Error parsing learning objectives", e);
        }
    }

    const course = new Course({
      title, 
      description, 
      category, 
      level,
      duration: parseFloat(duration),
      price: Number(price) || 0,
      instructorId,
      learningObjectives: parsedObjectives, // Saved to database here
      thumbnail: req.file.path,
      status: "pending",
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses for specific instructor
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.params.instructorId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently Delete a course (Admin Final Action)
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

// @desc    Get all pending courses (New Requests AND Deletion Requests)
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      status: { $in: ["pending", "deletion_pending"] } 
    }).populate("instructorId", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course status (Approve/Reject)
export const updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const course = await Course.findById(req.params.id);
    if (course) {
      course.status = status;
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request Course Deletion (Instructor)
export const requestDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.status = "deletion_pending"; 
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addLecture = async (req, res) => {
  try {
    const { title, links } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const videoList = [];
    if (req.files && req.files['videos']) {
      req.files['videos'].forEach((file) => {
        videoList.push({ title: file.originalname, videoUrl: file.path, videoPublicId: file.filename });
      });
    }
    const resourceList = [];
    if (req.files && req.files['resources']) {
      req.files['resources'].forEach((file) => {
        resourceList.push({ title: file.originalname, url: file.path, publicId: file.filename, type: file.mimetype.split('/')[1] });
      });
    }
    let linkList = [];
    if (links) { try { linkList = JSON.parse(links); } catch (e) {} }

    course.lectures.push({ title, videos: videoList, resources: resourceList, links: linkList });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Upload failed: " + error.message });
  }
};

// --- NEW FUNCTION: Edit Course Details (For Admin Dashboard) ---
// @desc    Update entire course details
export const updateCourse = async (req, res) => {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(
          req.params.id, 
          req.body, 
          { new: true } // Returns the newly updated document
      );
      if (updatedCourse) {
          res.json(updatedCourse);
      } else {
          res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };