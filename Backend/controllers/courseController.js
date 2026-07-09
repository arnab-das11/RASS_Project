import Course from "../models/Course.js";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

// @desc    Get all approved courses (Public)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "approved" }).populate("instructorId", "name");
    
    const coursesWithRatings = await Promise.all(courses.map(async (course) => {
      const feedbacks = await Feedback.find({ courseId: course._id });
      let rating = 4.8;
      if (feedbacks.length > 0) {
        const likes = feedbacks.filter(f => f.liked).length;
        rating = parseFloat((1 + (likes / feedbacks.length) * 4).toFixed(1));
      }
      return {
        ...course.toObject(),
        rating,
        totalRatings: feedbacks.length
      };
    }));

    res.json(coursesWithRatings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructorId", "name");
    if (course) {
      const feedbacks = await Feedback.find({ courseId: course._id });
      let rating = 4.8;
      if (feedbacks.length > 0) {
        const likes = feedbacks.filter(f => f.liked).length;
        rating = parseFloat((1 + (likes / feedbacks.length) * 4).toFixed(1));
      }
      res.json({
        ...course.toObject(),
        rating,
        totalRatings: feedbacks.length
      });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
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

// @desc    Get all pending courses (New Requests, Deletion Requests, and Edit Requests)
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      $or: [
        { status: { $in: ["pending", "deletion_pending"] } },
        { editPermission: "requested" }
      ]
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
    const { title, links, videoDescriptions, resourceDescriptions, youtubeVideos } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Parse descriptions lists
    let videoDescList = [];
    if (videoDescriptions) {
      try {
        videoDescList = JSON.parse(videoDescriptions);
      } catch (e) {
        videoDescList = Array.isArray(videoDescriptions) ? videoDescriptions : [videoDescriptions];
      }
    }

    let resourceDescList = [];
    if (resourceDescriptions) {
      try {
        resourceDescList = JSON.parse(resourceDescriptions);
      } catch (e) {
        resourceDescList = Array.isArray(resourceDescriptions) ? resourceDescriptions : [resourceDescriptions];
      }
    }

    const videoList = [];
    // Process YouTube Videos
    if (youtubeVideos) {
      try {
        const ytList = JSON.parse(youtubeVideos);
        ytList.forEach((yt) => {
          videoList.push({
            title: yt.title,
            videoUrl: yt.url,
            videoPublicId: "youtube",
            description: yt.description || ""
          });
        });
      } catch (e) {
        console.error("Failed to parse youtubeVideos", e);
      }
    }

    if (req.files && req.files['videos']) {
      req.files['videos'].forEach((file, index) => {
        videoList.push({ 
          title: file.originalname, 
          videoUrl: file.path, 
          videoPublicId: file.filename,
          description: videoDescList[index] || ""
        });
      });
    }
    const resourceList = [];
    if (req.files && req.files['resources']) {
      req.files['resources'].forEach((file, index) => {
        resourceList.push({ 
          title: file.originalname, 
          url: file.path, 
          publicId: file.filename, 
          type: file.mimetype.split('/')[1],
          description: resourceDescList[index] || ""
        });
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

// @desc    Update entire course details (Admin/Instructor Edit)
export const updateCourse = async (req, res) => {
    try {
      const { title, description, category, level, duration, price, learningObjectives, submitEdit, resetProgress } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });

      // Update text fields
      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (category !== undefined) course.category = category;
      if (level !== undefined) course.level = level;
      if (duration !== undefined) course.duration = parseFloat(duration);
      if (price !== undefined) course.price = Number(price) || 0;

      // Handle objectives
      if (learningObjectives !== undefined) {
        try {
          course.learningObjectives = JSON.parse(learningObjectives);
        } catch (e) {
          course.learningObjectives = Array.isArray(learningObjectives) ? learningObjectives : [learningObjectives];
        }
      }

      // Handle thumbnail upload
      if (req.file) {
        course.thumbnail = req.file.path;
      }

      // Lock down course after instructor submits edits
      if (submitEdit === "true" || submitEdit === true) {
        course.editPermission = "none";
      }

      // Progression Reset for active/in-progress students
      if (resetProgress === "true" || resetProgress === true) {
        const contentIdsToClear = [];
        course.lectures.forEach(lecture => {
          if (lecture.videos) {
            lecture.videos.forEach(v => {
              contentIdsToClear.push(v._id.toString());
              if (v.videoUrl) contentIdsToClear.push(v.videoUrl);
            });
          }
          if (lecture.resources) {
            lecture.resources.forEach(r => {
              contentIdsToClear.push(r._id.toString());
              if (r.url) contentIdsToClear.push(r.url);
            });
          }
          if (lecture.links) {
            lecture.links.forEach(l => {
              contentIdsToClear.push(l._id.toString());
              if (l.url) contentIdsToClear.push(l.url);
            });
          }
        });

        if (contentIdsToClear.length > 0) {
          await User.updateMany(
            { 
              role: 'learner',
              passedExams: { $ne: course._id } // Only clear for non-graduates
            },
            {
              $pull: { completedContent: { $in: contentIdsToClear } }
            }
          );
        }
      }

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Request Course Edit permission (Instructor)
export const requestEditCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.editPermission = "requested";
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Course Edit request (Admin)
export const approveEditCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.editPermission = "allowed";
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject/Deny Course Edit request (Admin)
export const rejectEditCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.editPermission = "none";
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a specific lecture from course
export const deleteLecture = async (req, res) => {
  try {
    const { id, lectureId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.lectures = course.lectures.filter(lecture => lecture._id.toString() !== lectureId);
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};