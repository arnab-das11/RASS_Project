import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const activeCourses = await Course.countDocuments({ status: 'approved' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });

    res.json({
      totalLearners,
      totalInstructors,
      activeCourses,
      pendingCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all learners and instructors
// @route   DELETE /api/admin/reset-users
export const clearUsers = async (req, res) => {
  try {
    const usersResult = await User.deleteMany({ role: { $in: ['learner', 'instructor'] } });
    const coursesResult = await Course.deleteMany({});
    
    res.json({ 
      message: `Successfully deleted ${usersResult.deletedCount} learners/instructors and ${coursesResult.deletedCount} courses from the database.` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};