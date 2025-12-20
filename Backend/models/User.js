import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['learner', 'instructor', 'admin'], 
    default: 'learner' 
  },
  // Added this because your form has an "IID" field
  instructorId: { 
    type: String, 
    default: null 
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;