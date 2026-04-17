import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // PASSWORD IS NO LONGER REQUIRED (Google users won't have one)
  password: { type: String }, 
  
  role: { 
    type: String, 
    enum: ['learner', 'instructor', 'admin'], 
    default: 'learner' 
  },
  
  // NEW: Store Google ID
  googleId: { type: String },
  
  instructorId: { 
    type: String, 
    default: null 
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;