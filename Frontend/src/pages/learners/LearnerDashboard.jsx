import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, MonitorPlay, ChevronDown, CheckCircle, ArrowLeft, Loader, FileText, Link as LinkIcon, ExternalLink, Award, Home } from 'lucide-react';
import axios from 'axios';

const LearnerDashboard = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedItems, setCompletedItems] = useState([]); // Tracks progress
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // View Controllers
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [activeContent, setActiveContent] = useState(null); // Replaced activeVideo
  const [expandedSections, setExpandedSections] = useState({});

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const userInfoString = localStorage.getItem("userInfo");
        if (!userInfoString) return navigate("/learner-signup");
        
        const userInfo = JSON.parse(userInfoString);
        
        // Fetch user's courses AND their completed progress
        const { data } = await axios.get(`http://localhost:5000/api/users/${userInfo._id}/enrolled`);
        
        // For this to work perfectly, you'd fetch the user profile again to get completedContent.
        // Assuming we store it in localStorage for now, or fetch it:
        const userRes = await axios.get('http://localhost:5000/api/users'); // Adjust if you have a getProfile route
        const currentUser = userRes.data.find(u => u._id === userInfo._id);
        
        setEnrolledCourses(data);
        if (currentUser && currentUser.completedContent) {
            setCompletedItems(currentUser.completedContent);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [navigate]);

  // --- HELPER FUNCTIONS ---
  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    if (course.lectures && course.lectures.length > 0) {
        setExpandedSections({ 0: true });
        // Auto-select the first available content (video or resource)
        const firstSec = course.lectures[0];
        if (firstSec.videos?.length > 0) setActiveContent({ type: 'video', data: firstSec.videos[0] });
        else if (firstSec.resources?.length > 0) setActiveContent({ type: 'resource', data: firstSec.resources[0] });
        else if (firstSec.links?.length > 0) setActiveContent({ type: 'link', data: firstSec.links[0] });
    }
  };

  const toggleSection = (index) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));

  // PROGRESS LOGIC
  const handleMarkComplete = async () => {
    if (!activeContent || !activeContent.data._id) return;
    
    const contentId = activeContent.data._id;
    if (completedItems.includes(contentId)) return; // Already done

    setProgressLoading(true);
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const { data } = await axios.put('http://localhost:5000/api/users/progress', {
            userId: userInfo._id,
            contentId: contentId
        });
        setCompletedItems(data.completedContent); // Update UI
    } catch (error) {
        console.error("Failed to update progress", error);
    } finally {
        setProgressLoading(false);
    }
  };

  const calculateProgress = (course) => {
    if (!course.lectures) return 0;
    let totalItems = 0;
    let finishedItems = 0;

    course.lectures.forEach(sec => {
        const items = [...(sec.videos||[]), ...(sec.resources||[]), ...(sec.links||[])];
        totalItems += items.length;
        items.forEach(item => {
            if (completedItems.includes(item._id)) finishedItems++;
        });
    });
    return totalItems === 0 ? 0 : Math.round((finishedItems / totalItems) * 100);
  };

  // --- RENDER DYNAMIC CONTENT WINDOW ---
  const renderActiveContent = () => {
    if (!activeContent) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a lesson from the curriculum to begin.</p>
            </div>
        );
    }

    if (activeContent.type === 'video') {
        return <video src={activeContent.data.videoUrl} controls autoPlay className="w-full h-full object-contain" />;
    }

    if (activeContent.type === 'resource') {
        // The Google Docs Viewer Hack for PDFs and DOCX
        const docUrl = encodeURIComponent(activeContent.data.url.replace("/image/upload/", "/raw/upload/"));
        return (
            <iframe 
                src={`https://docs.google.com/viewer?url=${docUrl}&embedded=true`} 
                className="w-full h-full bg-white"
                title="Document Viewer"
            ></iframe>
        );
    }

    if (activeContent.type === 'link') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900">
                <LinkIcon className="w-20 h-20 text-purple-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">{activeContent.data.title || "External Resource"}</h3>
                <p className="text-gray-400 mb-8 max-w-md">This is an external link or BibTeX reference. Click the button below to open it in a new secure tab.</p>
                <a 
                   href={activeContent.data.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 transition"
                >
                   Open Resource <ExternalLink size={18} />
                </a>
            </div>
        );
    }
  };

  // --- UI RENDERING ---
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><Loader className="w-8 h-8 animate-spin text-blue-500 mr-3" /></div>;

  // VIEW B: THE PLAYER MODE
  if (selectedCourse) {
    const currentProgress = calculateProgress(selectedCourse);
    const isCurrentItemDone = activeContent && completedItems.includes(activeContent.data._id);

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white">
        
        {/* LEFT COLUMN: Dynamic Player & Controls */}
        <div className="w-full lg:w-2/3 flex flex-col border-r border-gray-800">
          <div className="p-4 bg-gray-950 flex items-center justify-between border-b border-gray-800">
              <button onClick={() => setSelectedCourse(null)} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="font-bold text-gray-200 truncate max-w-md">{selectedCourse.title}</h2>
          </div>
          
          <div className="aspect-video bg-black flex items-center justify-center relative shadow-2xl">
             {renderActiveContent()}
          </div>
          
          <div className="p-6 md:p-8 flex-1 bg-gray-900">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {activeContent ? activeContent.data.title : "Course Overview"}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${activeContent?.type === 'video' ? 'bg-blue-900 text-blue-300' : activeContent?.type === 'resource' ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'}`}>
                        {activeContent?.type || "Information"}
                    </span>
                </div>
                
                {activeContent && (
                    <button 
                        onClick={handleMarkComplete}
                        disabled={isCurrentItemDone || progressLoading}
                        className={`px-6 py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg ${isCurrentItemDone ? 'bg-gray-800 text-green-500 cursor-default' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}`}
                    >
                        {progressLoading ? <Loader className="animate-spin" size={20}/> : <CheckCircle size={20} />}
                        {isCurrentItemDone ? "Completed" : "Mark as Complete"}
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Curriculum Sidebar */}
        <div className="w-full lg:w-1/3 bg-gray-950 h-screen lg:sticky top-0 overflow-hidden flex flex-col border-l border-gray-800">
          <div className="p-6 bg-gray-900 border-b border-gray-800 z-10 shadow-md">
             <h3 className="text-xl font-bold text-white">Curriculum</h3>
             <div className="mt-4">
                 <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                     <span>Course Progress</span>
                     <span className={currentProgress === 100 ? "text-green-400" : "text-blue-400"}>{currentProgress}%</span>
                 </div>
                 <div className="w-full bg-gray-800 rounded-full h-2">
                     <div className={`h-2 rounded-full transition-all duration-500 ${currentProgress === 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${currentProgress}%` }}></div>
                 </div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
             {selectedCourse.lectures?.map((section, index) => (
                  <div key={index} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition text-left">
                      <span className="font-bold text-gray-200 text-sm line-clamp-1">{section.title}</span>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSections[index] && (
                      <div className="bg-gray-950/50">
                        
                        {/* VIDEOS */}
                        {section.videos?.map((vid, vIdx) => (
                          <div key={vIdx} onClick={() => setActiveContent({type: 'video', data: vid})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === vid._id ? "border-l-blue-500 bg-gray-800/80" : "border-l-transparent hover:bg-gray-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <MonitorPlay size={16} className={activeContent?.data._id === vid._id ? "text-blue-400" : "text-gray-600"}/>
                                 <span className={`text-sm ${activeContent?.data._id === vid._id ? "text-blue-100 font-medium" : "text-gray-400"}`}>{vid.title}</span>
                             </div>
                             {completedItems.includes(vid._id) && <CheckCircle size={14} className="text-green-500"/>}
                          </div>
                        ))}

                        {/* PDFs/RESOURCES */}
                        {section.resources?.map((res, rIdx) => (
                          <div key={rIdx} onClick={() => setActiveContent({type: 'resource', data: res})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === res._id ? "border-l-green-500 bg-gray-800/80" : "border-l-transparent hover:bg-gray-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <FileText size={16} className={activeContent?.data._id === res._id ? "text-green-400" : "text-gray-600"}/>
                                 <span className={`text-sm ${activeContent?.data._id === res._id ? "text-green-100 font-medium" : "text-gray-400"}`}>{res.title}</span>
                             </div>
                             {completedItems.includes(res._id) && <CheckCircle size={14} className="text-green-500"/>}
                          </div>
                        ))}

                        {/* LINKS/BIBTEX */}
                        {section.links?.map((link, lIdx) => (
                          <div key={lIdx} onClick={() => setActiveContent({type: 'link', data: link})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === link._id ? "border-l-purple-500 bg-gray-800/80" : "border-l-transparent hover:bg-gray-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <LinkIcon size={16} className={activeContent?.data._id === link._id ? "text-purple-400" : "text-gray-600"}/>
                                 <span className={`text-sm ${activeContent?.data._id === link._id ? "text-purple-100 font-medium" : "text-gray-400"}`}>{link.title}</span>
                             </div>
                             {completedItems.includes(link._id) && <CheckCircle size={14} className="text-green-500"/>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  }

  // VIEW A: THE DASHBOARD GRID
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      
      {/* Header Profile Area WITH NEW BUTTONS */}
      <div className="bg-gray-900 border-b border-gray-800 pt-8 pb-16 px-8 relative">
          <div className="max-w-7xl mx-auto">
              
              {/* --- NEW NAVIGATION BUTTONS --- */}
              <div className="flex items-center gap-4 mb-6">
                  <button 
                      onClick={() => navigate('/')} 
                      className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2 transition bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700"
                  >
                      <Home size={16} /> Home
                  </button>
              </div>
              {/* -------------------------------- */}

              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Learning Arena</h1>
              <p className="text-gray-400">Pick up right where you left off.</p>
          </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 -mt-8">
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
              <div className="bg-gray-800 p-6 rounded-full mb-6"><BookOpen className="w-12 h-12 text-blue-500" /></div>
              <h2 className="text-2xl font-bold mb-3 text-white">Your journey has not yet begun</h2>
              <p className="text-gray-400 mb-8 text-center max-w-md">You aren't enrolled in any courses yet.</p>
              <Link to="/courses" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg">Browse Available Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((course) => {
                const prog = calculateProgress(course);
                return (
                <div key={course._id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all shadow-xl group flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-black">
                      <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                      
                      {/* REAL PROGRESS BAR */}
                      <div className="mb-6 mt-auto pt-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                              <span>Overall Progress</span>
                              <span className={prog === 100 ? "text-green-400" : "text-blue-400"}>{prog}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full transition-all duration-500 ${prog === 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${prog}%` }}></div>
                          </div>
                      </div>
                      
                      <button onClick={() => handleStartCourse(course)} className="w-full py-3 bg-gray-800 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        {prog === 100 ? <><Award size={18} className="text-yellow-400"/> Review Course</> : <><PlayCircle size={18} /> Resume Journey</>}
                      </button>
                  </div>
                </div>
              )})}
            </div>
          )}
      </div>
    </div>
  );
};

export default LearnerDashboard;