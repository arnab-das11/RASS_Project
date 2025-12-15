import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  BarChart,
  CheckCircle,
  PlayCircle,
  Star,
  User,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const CourseDetailsPage = () => {
  const { id } = useParams(); // Get the ID from the URL (e.g. /courses/65a...)
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/courses/${id}`
        ); // We need to create this route!
        setCourse(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Course not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4">
            <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30">
              {course.level || "Beginner"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-300 text-lg">{course.description}</p>

            <div className="flex items-center gap-6 text-sm text-gray-300 pt-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                {course.duration || "Self-paced"}
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-yellow-400" />
                {course.instructor?.name || "Instructor"}
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                4.8 <Star size={16} fill="currentColor" />
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105">
                Enroll Now
              </button>
            </div>
          </div>

          {/* Thumbnail Card */}
          <div className="w-full md:w-1/3">
            <div className="bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition duration-500">
              <img
                src={
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                }
                alt="Course"
                className="rounded-xl w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* What you'll learn */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              What You Will Learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* If you had learningOutcomes in DB, map them here. For now, static or description split */}
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="text-green-500 shrink-0 mt-1"
                  size={20}
                />
                <span className="text-gray-600">
                  Master the core concepts effectively.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="text-green-500 shrink-0 mt-1"
                  size={20}
                />
                <span className="text-gray-600">
                  Build real-world projects from scratch.
                </span>
              </div>
            </div>
          </div>

          {/* Syllabus / Resources */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Course Content
            </h3>
            <div className="space-y-3">
              {course.resources && course.resources.length > 0 ? (
                course.resources.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <PlayCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {res.title}
                        </h4>
                        <span className="text-xs text-gray-500 uppercase">
                          {res.type}
                        </span>
                      </div>
                    </div>
                    {/* Only show link if enrolled (we will add logic later) */}
                    <a
                      href={res.url}
                      target="_blank"
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-gray-100 rounded-xl text-center text-gray-500">
                  No materials uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <h4 className="font-bold text-gray-800 mb-4">Course Features</h4>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex justify-between border-b pb-2">
                <span>Duration</span>
                <span className="font-semibold">{course.duration}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Skill Level</span>
                <span className="font-semibold">{course.level}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Language</span>
                <span className="font-semibold">English</span>
              </li>
              <li className="flex justify-between pt-2">
                <span>Certificate</span>
                <span className="font-semibold text-green-600">Yes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetailsPage;
