import { useState, useEffect } from "react";
import { Search, Star, Loader } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// ⚠️ IMPORTANT: These strings must match the 'category' field in your Database EXACTLY.
const categories = [
  "All",
  "Programming",
  "Web Development",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Cyber Security" // Added based on your previous requests
];

const CoursePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/courses');
        setCourses(data);
        
        // 🔍 DEBUG: Check your console to see what fields your backend actually sends!
        console.log("Fetched Courses:", data); 
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading courses:", error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ✅ FIXED FILTER SYSTEM
  const filteredCourses = courses.filter((course) => {
    // 1. Search Filter (Case insensitive)
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category Filter
    // If "All" is selected, pass true.
    // Otherwise, check if the course.category matches exactly OR if the category is inside the title
    const matchesCategory = selectedCategory === "All" || 
      (course.category === selectedCategory) || 
      (course.title.includes(selectedCategory)); // Fallback in case category field is missing

    return matchesSearch && matchesCategory; 
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

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
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
           <div className="flex flex-col items-center justify-center text-center mt-10">
              <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              <button 
                onClick={() => {setSelectedCategory("All"); setSearchTerm("");}}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
           </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Logic */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img
                    src={course.thumbnail ? course.thumbnail : DEFAULT_IMAGE}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE;
                    }}
                    />
                    {/* Badge for Level/Category */}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                        {course.level || "Beginner"}
                    </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  
                  {/* Category Tag */}
                  <p className="text-xs font-medium text-blue-600 mb-3 uppercase tracking-wide">
                    {course.category || "General"}
                  </p>
                  
                  <p className="text-xs text-gray-400 mb-4">
                    By {course.instructor?.name || "Expert Instructor"}
                  </p>

                  <div className="flex justify-between items-center mb-4 mt-auto">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={18} fill="currentColor" />
                      <span className="text-gray-700 font-medium">4.8</span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                        {course.duration || "N/A"}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium
                             hover:bg-blue-700 active:scale-95 transition-all shadow-blue-200 shadow-lg">
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