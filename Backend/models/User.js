import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // Add this inside your userSchema definition in User.js
  completedContent: [{ type: String }], // Stores IDs of completed videos/resources
  
  // PASSWORD IS NO LONGER REQUIRED (Google users won't have one)
  password: { type: String }, 
  
  role: { 
    type: String, 
    enum: ['learner', 'instructor', 'admin'], 
    default: 'learner' 
  },
  // Inside your userSchema:
  profilePicture: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" // A nice default avatar
  },
  
  // NEW: Store Google ID
  googleId: { type: String },
  
  instructorId: { 
    type: String, 
    default: null 
  },
  passedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;