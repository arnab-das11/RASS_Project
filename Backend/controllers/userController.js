import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const updateGamification = async (user, xpEarned, source = "") => {
  if (!user) return;

  user.xp = (user.xp || 0) + xpEarned;

  const today = new Date().toISOString().split('T')[0];
  if (user.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (user.lastActiveDate === yesterdayStr) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = today;
  }

  if (!user.badges) user.badges = [];

  if (user.xp > 0 && !user.badges.includes('first_step')) {
    user.badges.push('first_step');
  }

  if (user.streak >= 3 && !user.badges.includes('streak_maker')) {
    user.badges.push('streak_maker');
  }

  if (source === 'voice' && !user.badges.includes('voice_master')) {
    user.badges.push('voice_master');
  }

  if (source === 'exam_10' && !user.badges.includes('exam_champion')) {
    user.badges.push('exam_champion');
  }

  if (source === 'exam_pass' && !user.badges.includes('graduate')) {
    user.badges.push('graduate');
  }

  await user.save();
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, iid, skills } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required for manual registration' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- DYNAMIC AVATAR FOR MANUAL USERS ---
    const dynamicAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, 
      instructorId: iid || null,
      profilePicture: dynamicAvatar,
      skills: skills || []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // Sent to frontend
        token: generateToken(user._id),
        xp: user.xp || 0,
        streak: user.streak || 0,
        badges: user.badges || []
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // Sent to frontend
        token: generateToken(user._id),
        xp: user.xp || 0,
        streak: user.streak || 0,
        badges: user.badges || []
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    
    // --- EXTRACT REAL GOOGLE PICTURE ---
    const { email, name, sub: googleId, picture: profilePicture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      if (user.role !== 'learner') {
        return res.status(403).json({ message: 'Access Denied: Please use standard login for Instructor/Admin accounts.' });
      }
      if (!user.googleId) {
        user.googleId = googleId;
      }
      // Update Google picture if it changed
      if (profilePicture && user.profilePicture !== profilePicture) {
          user.profilePicture = profilePicture;
      }
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        role: 'learner', 
        profilePicture // Saved to DB
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture, // Sent to frontend
      token: generateToken(user._id),
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges: user.badges || []
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('enrolledCourses')
      .populate('enrolledCourses.courseId');

    const normalizedUsers = users.map(user => {
      const userObj = user.toObject ? user.toObject() : user;
      
      const normalizedCourses = user.enrolledCourses.map(item => {
        if (!item) return null;

        // New structure: { courseId: populatedCourse, purchaseDetails }
        if (item.courseId) {
          const courseObj = item.courseId.toObject ? item.courseId.toObject() : item.courseId;
          if (courseObj && (courseObj.title || courseObj._id)) {
            return {
              ...courseObj,
              purchaseDetails: item.purchaseDetails
            };
          }
        }

        // Legacy structure: populatedCourse (the item itself)
        if (item.title || item._id) {
          const courseObj = item.toObject ? item.toObject() : item;
          return {
            ...courseObj,
            purchaseDetails: null
          };
        }

        return null;
      }).filter(Boolean);

      userObj.enrolledCourses = normalizedCourses;
      return userObj;
    });

    res.json(normalizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isAlreadyEnrolled = user.enrolledCourses.some(item => {
      if (!item) return false;
      const itemId = item.courseId ? item.courseId.toString() : item.toString();
      return itemId === courseId;
    });

    if (isAlreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    user.enrolledCourses.push({ courseId });
    await user.save();

    res.status(200).json({ message: 'Successfully enrolled!', enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledCourses')
      .populate({
        path: 'enrolledCourses.courseId',
        populate: {
          path: 'instructorId',
          select: 'name email profilePicture'
        }
      });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courses = user.enrolledCourses.map(item => {
      if (!item) return null;

      // New structure: { courseId: populatedCourse, purchaseDetails }
      if (item.courseId) {
        const courseObj = item.courseId.toObject ? item.courseId.toObject() : item.courseId;
        if (courseObj && (courseObj.title || courseObj._id)) {
          return {
            ...courseObj,
            purchaseDetails: item.purchaseDetails
          };
        }
      }

      // Legacy structure: populatedCourse (the item itself)
      if (item.title || item._id) {
        const courseObj = item.toObject ? item.toObject() : item;
        return {
          ...courseObj,
          purchaseDetails: null
        };
      }

      return null;
    }).filter(Boolean);

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsComplete = async (req, res) => {
  try {
    const { userId, contentId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let xpGained = 0;
    if (user.completedContent.includes(contentId)) {
      user.completedContent = user.completedContent.filter(id => id !== contentId);
    } else {
      user.completedContent.push(contentId);
      xpGained = 100;
    }
    
    if (xpGained > 0) {
      await updateGamification(user, xpGained);
    } else {
      await user.save();
    }

    res.status(200).json({ 
      message: 'Progress updated', 
      completedContent: user.completedContent,
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges: user.badges || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unenrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.enrolledCourses = user.enrolledCourses.filter(item => {
      if (!item) return false;
      const itemId = item.courseId ? item.courseId.toString() : item.toString();
      return itemId !== courseId;
    });
    await user.save();
    res.status(200).json({ message: 'User unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const passExam = async (req, res) => {
  try {
    const { userId, courseId, score } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.passedExams) {
      user.passedExams = [];
    }
    
    let source = "exam_pass";
    if (score === 10) {
      source = "exam_10";
    }

    if (!user.passedExams.includes(courseId)) {
      user.passedExams.push(courseId);
    }
    
    // Award 500 XP and check badges
    await updateGamification(user, 500, source);

    res.status(200).json({ 
      message: 'Exam passed successfully', 
      passedExams: user.passedExams,
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges: user.badges || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSkills = async (req, res) => {
  try {
    const { userId, skills } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.skills = skills || [];
    await user.save();
    res.status(200).json({ message: 'Skills updated successfully', skills: user.skills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addXP = async (req, res) => {
  try {
    const { userId, xpAmount, source } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await updateGamification(user, xpAmount, source);

    res.status(200).json({ 
      message: 'XP updated successfully', 
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges: user.badges || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};