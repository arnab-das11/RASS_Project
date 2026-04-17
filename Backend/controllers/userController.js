import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'; // NEW IMPORT

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

    // Manual registration requires a password
    if (!password) {
      return res.status(400).json({ message: 'Password is required for manual registration' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, 
      instructorId: iid || null 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

    // Ensure user exists and has a password (Google users might not have one)
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW GOOGLE LOGIN CONTROLLER ---
export const googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    
    const { email, name, sub: googleId } = ticket.getPayload();

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // SECURITY CHECK: Do not allow Admin/Instructors to use Google Login
      if (user.role !== 'learner') {
        return res.status(403).json({ message: 'Access Denied: Please use standard login for Instructor/Admin accounts.' });
      }
      
      // Update googleId if it was missing
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // 3. Create new Learner if they don't exist
      user = await User.create({
        name,
        email,
        googleId,
        role: 'learner', // FORCE role to learner
      });
    }

    // 4. Send back standard JWT token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
};
// -----------------------------------

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};