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

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, iid } = req.body;

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
      profilePicture: dynamicAvatar // Saved to DB
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // Sent to frontend
        token: generateToken(user._id),
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
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').populate('enrolledCourses');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.enrolledCourses.includes(courseId)) return res.status(400).json({ message: 'You are already enrolled in this course.' });

    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: 'Successfully enrolled!', enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('enrolledCourses');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsComplete = async (req, res) => {
  try {
    const { userId, contentId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.completedContent.includes(contentId)) {
      user.completedContent = user.completedContent.filter(id => id !== contentId);
    } else {
      user.completedContent.push(contentId);
    }
    await user.save();
    res.status(200).json({ message: 'Progress updated', completedContent: user.completedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unenrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
    await user.save();
    res.status(200).json({ message: 'User unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const passExam = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.passedExams) {
      user.passedExams = [];
    }
    if (!user.passedExams.includes(courseId)) {
      user.passedExams.push(courseId);
      await user.save();
    }
    res.status(200).json({ message: 'Exam passed successfully', passedExams: user.passedExams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};