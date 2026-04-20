import { useState, useEffect } from "react";
import { Search, Star, Loader, Clock, User, IndianRupee, BookOpen } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// ⚠️ IMPORTANT: These strings must match the 'category' field in your Database EXACTLY.
const categories = [
  "All",
  "Web Development",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Cybersecurity", 
  "Cloud Computing",
  "Mobile Development",
  "Data Science"
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
        // This endpoint returns ONLY 'approved' courses based on our backend update
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

  // ✅ YOUR FIXED FILTER SYSTEM (Preserved and perfectly intact)
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* --- HERO SECTION WITH YOUR SEARCH BAR --- */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 pt-32 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Explore The <span className="text-blue-400">Library</span></h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10 font-medium">Discover top-tier courses crafted by industry experts. Master new skills and accelerate your career today.</p>
        
        {/* Your Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-white rounded-full shadow-2xl px-4 w-full md:w-1/2 max-w-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <Search className="text-gray-400 mr-3" size={24} />
            <input
              type="text"
              placeholder="Search for React, AI, Algorithms..."
              className="flex-grow py-4 outline-none text-gray-700 font-medium text-lg rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        
        {/* --- YOUR CATEGORIES FILTER --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 transform scale-105"
                  : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- COURSES GRID --- */}
        {loading ? (
           <div className="flex flex-col justify-center items-center h-40">
             <Loader className="animate-spin text-blue-600 mb-4" size={48} />
             <p className="text-gray-500 font-bold tracking-wide">Loading Curriculum...</p>
           </div>
        ) : filteredCourses.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center mt-10 bg-white py-16 rounded-3xl border border-gray-100 shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h2>
              <p className="text-gray-500 text-lg max-w-md">We couldn't find any courses matching your criteria.</p>
              <button 
                onClick={() => {setSelectedCategory("All"); setSearchTerm("");}}
                className="mt-6 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                Clear Filters
              </button>
           </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden group"
              >
                {/* Image Logic */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                        src={course.thumbnail ? course.thumbnail : DEFAULT_IMAGE}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                        }}
                    />
                    {/* Badge for Category */}
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-blue-800 uppercase tracking-wide shadow-sm">
                        {course.category || "General"}
                    </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm mb-3">
                    <Star size={16} fill="currentColor" /> 4.8 <span className="text-gray-400 font-medium ml-1">(Highly Rated)</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {course.title}
                  </h3>
                  
                  {/* Syncing Instructor and Duration */}
                  <div className="space-y-2 mt-auto mb-6">
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <User size={16} className="text-blue-400"/> By {course.instructorId?.name || "Expert Instructor"}
                      </p>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <Clock size={16} className="text-blue-400"/> {course.duration || "Self-paced"} Hours • {course.level || "All Levels"}
                      </p>
                  </div>

                  {/* Price & Action Button Row */}
                  <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                    <div className="text-2xl font-black text-gray-900 flex items-center">
                        {course.price === 0 ? <span className="text-green-500 tracking-wide">Free</span> : <><IndianRupee size={22}/>{course.price}</>}
                    </div>
                    <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold
                                  group-hover:bg-blue-600 group-hover:text-white active:scale-95 transition-all"
                    >
                        View Details
                    </button>
                  </div>
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