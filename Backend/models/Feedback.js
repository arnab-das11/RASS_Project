import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  liked: {
    type: Boolean,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  voiceUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
