import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  BarChart,
  IndianRupee,
  ShoppingCart,
  Download,
  Loader
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null); 
  const [expandedSections, setExpandedSections] = useState({}); 
  
  // --- Enroll State ---
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  
  // --- File Download State ---
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(data);
        
        if (data.lectures && data.lectures.length > 0) {
           setExpandedSections({ 0: true });
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

  // --- THE NUCLEAR FIX: FORCE DOWNLOAD VIA BLOB ---
  const handleResourceDownload = async (e, resourceUrl, filename, resourceId) => {
    e.preventDefault(); // Stop default browser "open" behavior
    setDownloadingFileId(resourceId);

    try {
      // 1. Fetch the file as raw data (Blob)
      const response = await fetch(resourceUrl);
      if (!response.ok) throw new Error("Network error");
      
      const blob = await response.blob();
      
      // 2. Create a temporary local URL for this blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 3. Create a hidden link and click it
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || "download"; // Forces the filename
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: If fetch fails (CORS issue), open in new tab
      window.open(resourceUrl, '_blank');
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleEnroll = async () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
        alert("Please login to enroll.");
        return navigate("/login");
    }
    setEnrollLoading(true);
    setTimeout(() => {
        setIsEnrolled(true);
        setEnrollLoading(false);
        alert("Successfully Enrolled! (Simulation)");
    }, 1500);
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getTotalVideos = () => {
    return course?.lectures?.reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) || 0;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30">
                {course.level}
              </span>
              <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm">
                 4.8 <Star size={14} fill="currentColor" /> (120 ratings)
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg line-clamp-2">{course.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                {course.duration ? `${course.duration} Hours` : "Self-paced"}
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-yellow-400" />
                {course.instructorId?.name || "Instructor"}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
                 <div className="text-3xl font-bold text-white">
                    {course.price === 0 ? <span className="text-green-400">Free</span> : <span className="flex items-center"><IndianRupee size={28}/> {course.price}</span>}
                 </div>
                 {!isEnrolled ? (
                     <button onClick={handleEnroll} disabled={enrollLoading} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-900/30 transition-transform transform hover:-translate-y-1 flex items-center gap-2">
                        {enrollLoading ? "Processing..." : <><ShoppingCart size={20}/> Enroll Now</>}
                     </button>
                 ) : (
                     <button className="bg-blue-500/20 text-blue-200 px-8 py-3 rounded-xl font-bold text-lg border border-blue-400/30 cursor-default">Already Enrolled</button>
                 )}
            </div>
          </div>

          <div className="hidden md:block w-1/3 max-w-sm">
            <div className="bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition duration-500">
              <img src={course.thumbnail || DEFAULT_IMAGE} alt={course.title} className="h-48 w-full object-cover rounded-xl" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-800 relative group">
            {activeVideo ? (
              <div className="aspect-video relative">
                <video key={activeVideo._id || activeVideo.videoUrl} src={activeVideo.videoUrl} controls className="w-full h-full object-contain" poster={course.thumbnail}>Your browser does not support the video tag.</video>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-500 bg-gray-900"><p>Select a video to start watching.</p></div>
            )}
            {activeVideo && (
              <div className="p-6 bg-white border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeVideo.title}</h2>
                <p className="text-gray-500 text-sm">Now Playing</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">About This Course</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 h-fit">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200"><h3 className="font-bold text-lg text-gray-800">Course Content</h3></div>
            
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {course.lectures && course.lectures.length > 0 ? (
                course.lectures.map((section, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0">
                    <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left">
                      <span className="font-bold text-gray-700 text-sm line-clamp-1">{section.title}</span>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSections[index] && (
                      <div className="bg-white animate-fade-in">
                        {/* VIDEOS */}
                        {section.videos && section.videos.map((vid, vIdx) => (
                          <div key={vIdx} onClick={() => setActiveVideo(vid)} className={`p-3 pl-6 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition border-l-4 ${activeVideo?._id === vid._id ? "border-l-blue-600 bg-blue-50" : "border-l-transparent"}`}>
                             <div className="shrink-0">{activeVideo?._id === vid._id ? <MonitorPlay size={16} className="text-blue-600"/> : <PlayCircle size={16} className="text-gray-400"/>}</div>
                             <span className={`text-sm ${activeVideo?._id === vid._id ? "text-blue-700 font-medium" : "text-gray-600"}`}>{vid.title || `Video ${vIdx+1}`}</span>
                          </div>
                        ))}

                        {/* --- RESOURCES (UPDATED FORCE DOWNLOAD) --- */}
                        {section.resources && section.resources.map((res, rIdx) => (
                          <a 
                             key={rIdx} 
                             href={res.url}
                             onClick={(e) => handleResourceDownload(e, res.url, res.title, res._id)} 
                             className="p-3 pl-6 flex items-center gap-3 hover:bg-green-50 transition border-l-4 border-l-transparent cursor-pointer block group"
                          >
                             {downloadingFileId === res._id ? (
                                <Loader size={16} className="text-green-600 animate-spin shrink-0"/>
                             ) : (
                                <FileText size={16} className="text-green-600 shrink-0 group-hover:scale-110 transition"/>
                             )}
                             
                             <div className="flex flex-col">
                               <span className="text-sm text-gray-700 font-medium group-hover:text-green-700 transition">
                                  {res.title || "Download Resource"}
                               </span>
                               <span className="text-[10px] text-gray-400 uppercase">
                                  {downloadingFileId === res._id ? "Downloading..." : "Click to Download"}
                               </span>
                             </div>
                          </a>
                        ))}

                        {/* LINKS */}
                        {section.links && section.links.map((link, lIdx) => (
                          <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 pl-6 flex items-center gap-3 hover:bg-purple-50 transition border-l-4 border-l-transparent cursor-pointer block">
                             <LinkIcon size={16} className="text-purple-600 shrink-0"/>
                             <span className="text-sm text-gray-600 font-medium hover:text-purple-700 truncate">{link.title || "External Link"}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">No content uploaded yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Course Features</h4>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex justify-between items-center border-b border-gray-50 pb-3"><div className="flex items-center gap-2 text-gray-500"><Clock size={18} /> <span>Duration</span></div><span className="font-semibold text-gray-800">{course.duration} Hours</span></li>
              <li className="flex justify-between items-center border-b border-gray-50 pb-3"><div className="flex items-center gap-2 text-gray-500"><MonitorPlay size={18} /> <span>Lectures</span></div><span className="font-semibold text-gray-800">{getTotalVideos()} Videos</span></li>
              <li className="flex justify-between items-center border-b border-gray-50 pb-3"><div className="flex items-center gap-2 text-gray-500"><BarChart size={18} /> <span>Skill Level</span></div><span className="font-semibold text-gray-800 capitalize">{course.level}</span></li>
              <li className="flex justify-between items-center border-b border-gray-50 pb-3"><div className="flex items-center gap-2 text-gray-500"><Globe size={18} /> <span>Language</span></div><span className="font-semibold text-gray-800">English</span></li>
              <li className="flex justify-between items-center pt-1"><div className="flex items-center gap-2 text-gray-500"><Award size={18} /> <span>Certificate</span></div><span className="font-semibold text-green-600">Yes</span></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetailsPage;