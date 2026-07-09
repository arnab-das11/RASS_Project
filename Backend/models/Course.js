import mongoose from "mongoose";

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    learningObjectives: [{ type: String }], // Add this under description
    category: { type: String, required: true },
    level: { type: String, required: true },
    
    // --- UPDATED FIELD ---
    duration: { type: Number, required: true }, // In Hours
    price: { type: Number, default: 0 },        // 0 = Free
    // ---------------------

    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    thumbnail: { type: String, required: true },

    lectures: [
      {
        title: { type: String, required: true },
        videos: [
          {
            title: { type: String },
            videoUrl: { type: String },
            videoPublicId: { type: String },
            freePreview: { type: Boolean, default: false },
            description: { type: String }
          }
        ],
        resources: [
          {
            title: { type: String },
            url: { type: String },
            publicId: { type: String },
            type: { type: String },
            description: { type: String }
          }
        ],
        links: [
          {
            title: { type: String },
            url: { type: String },
            description: { type: String }
          }
        ]
      }
    ],

    status: {
      type: String,
      // --- IMPORTANT: ADDED 'deletion_pending' HERE ---
      enum: ["pending", "approved", "rejected", "deletion_pending"],
      default: "pending",
    },
    editPermission: {
      type: String,
      enum: ["none", "requested", "allowed"],
      default: "none",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;