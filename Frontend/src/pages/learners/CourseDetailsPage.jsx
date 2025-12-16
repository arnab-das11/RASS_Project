import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  Star,
  User,
  MonitorPlay,
  CheckCircle,
  ChevronDown,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  Globe,
  Award,
  BarChart
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const CourseDetailsPage = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); 
  const [expandedSections, setExpandedSections] = useState({}); 

  // Default image fallback
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(data);
        
        // Logic: Auto-select the first video available deep inside sections
        if (data.lectures && data.lectures.length > 0) {
           setExpandedSections({ 0: true }); // Open first section

           for (const section of data.lectures) {
             if (section.videos && section.videos.length > 0) {
               setActiveVideo(section.videos[0]);
               break; 
             }
           }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper to count total videos
  const getTotalVideos = () => {
    return course?.lectures?.reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) || 0;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-5">
            <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30">
              {course.level || "Beginner"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-300 text-lg line-clamp-2">{course.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 pt-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                {course.duration ? `${course.duration} mins` : "Self-paced"}
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-yellow-400" />
                {course.instructorId?.name || "Instructor"}
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                4.8 <Star size={16} fill="currentColor" />
              </div>
              <div className="flex items-center gap-2">
                <MonitorPlay size={18} className="text-yellow-400" />
                {getTotalVideos()} Videos
              </div>
            </div>
          </div>

          <div className="hidden md:block w-1/3 max-w-sm">
            <div className="bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition duration-500">
              <img
                src={course.thumbnail || DEFAULT_IMAGE}
                alt={course.title}
                className="h-48 w-full object-cover rounded-xl"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN (2/3): Video Player & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. VIDEO PLAYER */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-800">
            {activeVideo ? (
              <div className="aspect-video relative">
                <video 
                  key={activeVideo._id || activeVideo.videoUrl} 
                  src={activeVideo.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  poster={course.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-500 bg-gray-900">
                <p>Select a video from the curriculum to start watching.</p>
              </div>
            )}
            
            {/* Active Video Title */}
            {activeVideo && (
              <div className="p-6 bg-white border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeVideo.title}</h2>
                <p className="text-gray-500 text-sm">Now Playing</p>
              </div>
            )}
          </div>

          {/* 2. COURSE DESCRIPTION */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">About This Course</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* 3. WHAT YOU WILL LEARN */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">What You Will Learn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                <span className="text-gray-600">Master core concepts efficiently</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                <span className="text-gray-600">Build real-world projects</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                <span className="text-gray-600">Get access to premium resources</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3): Curriculum List & Features */}
        <div className="space-y-6">
          
          {/* A. COURSE CONTENT LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-800">Course Content</h3>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {course.lectures && course.lectures.length > 0 ? (
                course.lectures.map((section, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0">
                    
                    {/* SECTION HEADER (Clickable) */}
                    <button 
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                    >
                      <span className="font-bold text-gray-700 text-sm">{section.title}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-500 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* SECTION CONTENT */}
                    {expandedSections[index] && (
                      <div className="bg-white animate-fade-in">
                        
                        {/* 1. VIDEOS */}
                        {section.videos && section.videos.map((vid, vIdx) => (
                          <div 
                             key={vIdx} 
                             onClick={() => setActiveVideo(vid)}
                             className={`p-3 pl-6 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition border-l-4 
                                ${activeVideo?._id === vid._id ? "border-l-blue-600 bg-blue-50" : "border-l-transparent"}
                             `}
                          >
                             <div className="shrink-0">
                                {activeVideo?._id === vid._id 
                                  ? <MonitorPlay size={16} className="text-blue-600"/> 
                                  : <PlayCircle size={16} className="text-gray-400"/>
                                }
                             </div>
                             <span className={`text-sm ${activeVideo?._id === vid._id ? "text-blue-700 font-medium" : "text-gray-600"}`}>
                                {vid.title || `Video ${vIdx+1}`}
                             </span>
                          </div>
                        ))}

                        {/* 2. RESOURCES */}
                        {section.resources && section.resources.map((res, rIdx) => (
                          <a 
                             key={rIdx} 
                             href={res.url} target="_blank" rel="noopener noreferrer"
                             className="p-3 pl-6 flex items-center gap-3 hover:bg-green-50 transition border-l-4 border-l-transparent cursor-pointer block"
                          >
                             <FileText size={16} className="text-green-600 shrink-0"/>
                             <span className="text-xs text-gray-600 font-medium hover:text-green-700 truncate">
                                {res.title || "Download Resource"}
                             </span>
                          </a>
                        ))}

                        {/* 3. LINKS */}
                        {section.links && section.links.map((link, lIdx) => (
                          <a 
                             key={lIdx} 
                             href={link.url} target="_blank" rel="noopener noreferrer"
                             className="p-3 pl-6 flex items-center gap-3 hover:bg-purple-50 transition border-l-4 border-l-transparent cursor-pointer block"
                          >
                             <LinkIcon size={16} className="text-purple-600 shrink-0"/>
                             <span className="text-xs text-gray-600 font-medium hover:text-purple-700 truncate">
                                {link.title || "External Link"}
                             </span>
                          </a>
                        ))}

                        {(!section.videos?.length && !section.resources?.length && !section.links?.length) && (
                            <div className="p-4 text-xs text-gray-400 italic text-center">Empty Section</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No content uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* B. COURSE FEATURES (RESTORED) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Course Features</h4>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={18} /> <span>Duration</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {/* Fallback to "Self-paced" if duration is missing */}
                  {course.duration ? `${course.duration} mins` : "Self-paced"}
                </span>
              </li>
              
              <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <MonitorPlay size={18} /> <span>Lectures</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {getTotalVideos()} Videos
                </span>
              </li>

              <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <BarChart size={18} /> <span>Skill Level</span>
                </div>
                <span className="font-semibold text-gray-800 capitalize">{course.level}</span>
              </li>

              <li className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Globe size={18} /> <span>Language</span>
                </div>
                <span className="font-semibold text-gray-800">English</span>
              </li>

              <li className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Award size={18} /> <span>Certificate</span>
                </div>
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