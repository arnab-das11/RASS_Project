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
    const { title, description, category, level, instructorId } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail image is required" });
    }

    const course = new Course({
      title,
      description,
      category,
      level,
      instructorId,
      thumbnail: req.file.path, // Save the Cloudinary URL
      status: "pending",
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
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// ... imports

export const addLecture = async (req, res) => {
  try {
    // We expect 'links' to be a JSON string array if sending multiple links from frontend
    // e.g., links = '[{"title":"Wiki","url":"..."}]'
    const { title, links } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // 1. Process Videos (Multiple)
    const videoList = [];
    if (req.files && req.files['videos']) {
      req.files['videos'].forEach((file) => {
        videoList.push({
          title: file.originalname, // Or pass specific titles from frontend
          videoUrl: file.path,
          videoPublicId: file.filename,
          freePreview: false // You can make this dynamic if needed
        });
      });
    }

    // 2. Process Resources (Multiple PDFs/Docs/BibTex)
    const resourceList = [];
    if (req.files && req.files['resources']) {
      req.files['resources'].forEach((file) => {
        resourceList.push({
          title: file.originalname,
          url: file.path,
          publicId: file.filename,
          type: file.mimetype.split('/')[1] // e.g., 'pdf'
        });
      });
    }

    // 3. Process Links (Parse JSON string)
    let linkList = [];
    if (links) {
        try {
            linkList = JSON.parse(links);
        } catch (e) {
            console.log("Error parsing links JSON", e);
        }
    }

    // 4. Create the "Section" (formerly Lecture)
    const newLectureSection = {
      title,
      videos: videoList,
      resources: resourceList,
      links: linkList
    };

    course.lectures.push(newLectureSection);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error("Add Lecture Error:", error);
    res.status(500).json({ message: "Upload failed: " + error.message });
  }
};