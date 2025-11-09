import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstructorCoursePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseType, setCourseType] = useState("Free");
  const [materials, setMaterials] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setMaterials(files);
    const videoFile = files.find((file) => file.type.includes("video"));
    if (videoFile) {
      const videoURL = URL.createObjectURL(videoFile);
      setVideoPreview(videoURL);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      alert("Please enter a course title first!");
      return;
    }
    setAiGenerating(true);
    try {
      const aiResponse = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve(
              `Course Title: "${title}"\n\n` +
                `Course Overview:\n` +
                `This comprehensive course "${title}" is designed to provide learners with a deep understanding of the subject matter. It covers both theoretical concepts and practical applications.\n\n` +
                `Who This Course Is For:\n` +
                `This course is ideal for beginners as well as intermediate learners.\n\n` +
                `What You'll Learn:\n` +
                `- Fundamental concepts and advanced techniques related to "${title}".\n` +
                `- Hands-on projects and exercises.\n\n` +
                `Course Benefits:\n` +
                `- Gain a strong foundation and confidence in the subject.\n\n` +
                `By the end of this course, learners will have mastered the key concepts of "${title}".`
            ),
          2000
        )
      );
      setDescription(aiResponse);
    } catch (err) {
      console.error(err);
      alert("Failed to generate description. Try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const requestToPublish = () => {
    if (!title.trim()) {
      alert("Course title cannot be empty!");
      return;
    }

    const confirmPublish = window.confirm("Do you want to send this course request?");
    if (!confirmPublish) return;

    const newRequest = {
      id: `r${Date.now()}`,
      title,
      description,
      type: courseType,
      status: "Pending",
      youtubeLink,
      thumbnail,
      materials,
    };

    const existingRequests = JSON.parse(localStorage.getItem("courseRequests")) || [];
    localStorage.setItem("courseRequests", JSON.stringify([newRequest, ...existingRequests]));

    setRequestSent(true);

    setTimeout(() => {
      alert("Request sent to admin for approval!");
      navigate("/instructor-dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Course</h2>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Course Thumbnail</label>
          <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 w-fit">
            <UploadCloud className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Upload Thumbnail</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </label>
          {thumbnail && (
            <img
              src={thumbnail}
              alt="Thumbnail"
              className="mt-3 w-32 h-32 object-cover rounded-lg border shadow-sm"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-blue-50 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter course title"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1 flex justify-between items-center">
            Description
            <button
              onClick={generateDescription}
              className="text-sm text-blue-500 hover:underline"
              disabled={aiGenerating}
            >
              {aiGenerating ? "Generating..." : "Generate Description"}
            </button>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-blue-50 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={8}
            placeholder="Course description will appear here"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Course Type</label>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Free</option>
            <option>Paid</option>
            <option>Premium</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Upload Materials</label>
          <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
            <UploadCloud />
            <span>Click to Upload Files (PDF, PPT, Video, etc.)</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>
          <ul className="mt-2">
            {materials.map((file, idx) => (
              <li key={idx} className="text-gray-600 text-sm">
                {file.name}
              </li>
            ))}
          </ul>
        </div>

        {videoPreview && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Video Preview</label>
            <video
              controls
              src={videoPreview}
              type="video/mp4"
              className="w-full rounded-lg border"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-1">Video / YouTube Link</label>
          <input
            type="url"
            placeholder="Paste YouTube or Video URL here"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="w-full bg-blue-50 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {youtubeLink && (
            <div className="mt-4">
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                🎬 Open Video in New Tab
              </a>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestToPublish}
          disabled={requestSent}
          className={`w-full p-3 mt-4 text-white font-semibold rounded-lg ${
            requestSent
              ? "bg-green-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {requestSent ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle /> Request Sent
            </div>
          ) : (
            "Request to Publish"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InstructorCoursePage;
