import { useState, useEffect } from "react";
import { Search, Star, Loader } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const categories = [
  "All",
  "Programming",
  "Web Development",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
];

const CoursePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Real Data State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Approved Courses on Load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/courses');
        setCourses(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading courses:", error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Note: If you haven't added 'category' to your backend model yet, 
    // the category filter might not work perfectly. 
    // For now, we search in title.
    const matchesCategory = selectedCategory === "All" || course.level === selectedCategory; // Temporary fallback
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch; 
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Explore Courses</h1>
          <p className="text-gray-600">Learn new skills and advance your career</p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-white rounded-full shadow-md px-4 w-full md:w-1/2">
            <Search className="text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search courses..."
              className="flex-grow py-2 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories (Optional: You can keep or remove if database doesn't have categories yet) */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-40">
             <Loader className="animate-spin text-blue-500" size={40} />
           </div>
        ) : filteredCourses.length === 0 ? (
           <div className="text-center text-gray-500 text-lg">No courses found matching your criteria.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-md hover:scale-[1.02] transition flex flex-col"
              >
                {/* Fallback Image since we haven't implemented Image Uploads yet */}
                <img
                  src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} 
                  alt={course.title}
                  className="h-48 w-full object-cover rounded-t-2xl"
                />

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{course.level || "Beginner"}</p>
                  
                  {/* Instructor Name (Populated from Backend) */}
                  <p className="text-xs text-gray-400 mb-4">
                    By {course.instructor?.name || "Instructor"}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={18} fill="currentColor" />
                      <span className="text-gray-700 font-medium">4.8</span> {/* Hardcoded Rating for now */}
                    </div>
                    <span className="text-sm text-gray-500">{course.duration}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/courses/${course._id}`)} // Use _id for MongoDB
                    className="mt-auto w-full bg-blue-500 text-white py-2 rounded-full hover:bg-green-500 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CoursePage;