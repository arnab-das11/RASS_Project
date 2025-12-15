import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  level: { type: String },
  duration: { type: String },
  
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

  // --- NEW: Approval System ---
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' // Default is HIDDEN until Admin approves
  },

  // --- NEW: Materials Container ---
  // This is where your Excel/BibTeX data will eventually go
  resources: [{
    title: String,
    url: String, // Link to PDF/Video
    type: { type: String, enum: ['video', 'pdf', 'link', 'citation'] },
    isCompleted: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;