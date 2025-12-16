import mongoose from "mongoose";

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    thumbnail: { type: String, required: true },

    // The Curriculum (Revised for Multiple Items)
    lectures: [
      {
        title: { type: String, required: true }, // e.g., "Chapter 1: Basics"
        
        // Array of Videos
        videos: [
          {
            title: { type: String }, // e.g., "Part 1: Setup"
            videoUrl: { type: String },
            videoPublicId: { type: String },
            freePreview: { type: Boolean, default: false }
          }
        ],

        // Array of Resources (PDF, Doc, BibTex files)
        resources: [
          {
            title: { type: String }, // e.g., "Lecture Notes" or "Citation.bib"
            url: { type: String },
            publicId: { type: String },
            type: { type: String } // 'pdf', 'docx', 'bib', etc.
          }
        ],

        // Array of Links
        links: [
          {
            title: { type: String }, // e.g., "Google Scholar Reference"
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