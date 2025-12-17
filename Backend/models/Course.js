import mongoose from "mongoose";

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    
    // --- UPDATED FIELD ---
    duration: { type: Number, required: true }, // In Hours (e.g. 1.5, 10)
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
            freePreview: { type: Boolean, default: false }
          }
        ],
        resources: [
          {
            title: { type: String },
            url: { type: String },
            publicId: { type: String },
            type: { type: String }
          }
        ],
        links: [
          {
            title: { type: String },
            url: { type: String }
          }
        ]
      }
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;