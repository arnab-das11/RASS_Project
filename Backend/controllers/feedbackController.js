import Feedback from '../models/Feedback.js';
import Course from '../models/Course.js';

// @desc    Submit feedback for a course
// @route   POST /api/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { courseId, studentId, liked, text, voiceUrl } = req.body;
    if (!courseId || !studentId || liked === undefined || (!text && !voiceUrl)) {
      return res.status(400).json({ message: 'Course ID, student ID, rating (liked), and comment/voice suggestion are required.' });
    }

    // Check if the user already submitted feedback for this course
    let feedback = await Feedback.findOne({ courseId, studentId });
    if (feedback) {
      // Update existing feedback
      feedback.liked = liked;
      feedback.text = text || "[Voice Feedback]";
      feedback.voiceUrl = voiceUrl || "";
      await feedback.save();
    } else {
      // Create new feedback
      feedback = new Feedback({
        courseId,
        studentId,
        liked,
        text: text || "[Voice Feedback]",
        voiceUrl: voiceUrl || ""
      });
      await feedback.save();
    }

    const populated = await Feedback.findById(feedback._id)
      .populate('studentId', 'name email profilePicture');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedbacks for a course
// @route   GET /api/feedback/course/:courseId
export const getCourseFeedbacks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const feedbacks = await Feedback.find({ courseId })
      .populate('studentId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedbacks for all courses of an instructor
// @route   GET /api/feedback/instructor/:instructorId
export const getInstructorFeedbacks = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Find all courses for this instructor
    const courses = await Course.find({ instructorId }).select('_id');
    const courseIds = courses.map(c => c._id);

    const feedbacks = await Feedback.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title thumbnail')
      .populate('studentId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
