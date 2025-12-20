import { useState, useEffect } from "react";
import { LogOut, PlusCircle, Trash2, Clock, BookOpen, AlertCircle, Home } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

const InstructorDashboard = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem("userInfo");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  });

  const [courses, setCourses] = useState([]);
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    if (!userInfo) {
      navigate("/");
      return;
    }
    fetchCourses(userInfo._id);
  }, [userInfo, navigate]);

  const fetchCourses = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/courses/instructor/${userId}`);
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses", error);
    }
  };

  // --- NEW: Request Deletion Logic ---
  const handleRequestDelete = async (courseId) => {
    if (!window.confirm("Request Admin to delete this course? It will remain visible until approved.")) return;
    
    // Optimistic UI Update
    setCourses(prevCourses => prevCourses.map(c => 
      c._id === courseId ? { ...c, status: 'deletion_pending' } : c
    ));

    try {
      await axios.put(`http://localhost:5000/api/courses/${courseId}/request-delete`);
      alert("Deletion request sent to Admin.");
    } catch (error) {
      alert("Error sending request");
      fetchCourses(userInfo._id); // Revert on error
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] text-white p-6 md:p-10 relative">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 p-2 bg-[#112240] rounded-full shadow-lg text-slate-400 hover:text-sky-400 border border-blue-800/30 transition z-10 hidden md:flex"
      >
        <Home size={24} />
      </button>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pl-0 md:pl-16">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
              Instructor Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Manage your content and track status.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-sky-100">{userInfo.name}</p>
                <p className="text-xs text-sky-300 uppercase">{userInfo.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
             <div className="p-6 bg-[#112240] rounded-2xl border border-blue-800/50 shadow-lg">
                <h2 className="text-sm font-bold text-sky-200 uppercase tracking-wider mb-4">Quick Actions</h2>
                <Link to="/instructor-course" className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition shadow-lg">
                  <PlusCircle size={20} /> Create New Course
                </Link>
             </div>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold text-white">My Courses</h2>
            
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[#112240] rounded-2xl border-2 border-dashed border-slate-600 text-center">
                <h3 className="text-lg font-bold text-sky-100">No courses yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="flex flex-col md:flex-row gap-6 p-6 bg-[#112240] rounded-2xl border border-blue-800/30 shadow-xl group">
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-[#0a192f] shrink-0">
                       <img 
                         src={course.thumbnail || DEFAULT_IMAGE} 
                         alt={course.title}
                         className="w-full h-full object-cover"
                         onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                       />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                             <div>
                                <h3 className="text-xl font-bold text-sky-100">{course.title}</h3>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{course.description}</p>
                             </div>
                             
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 shrink-0 ${
                               course.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                               course.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                               course.status === 'deletion_pending' ? 'bg-red-500/10 text-red-400 border-red-500/50' :
                               'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                             }`}>
                               {course.status === 'pending' && <AlertCircle size={12}/>}
                               {course.status === 'deletion_pending' ? 'Deletion Pending' : course.status || 'Pending'}
                             </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
                          {/* --- CONDITIONAL BUTTON --- */}
                          {course.status !== 'deletion_pending' && (
                              <button 
                                onClick={() => handleRequestDelete(course._id)}
                                className="flex items-center gap-1 text-sm bg-red-500/10 text-red-400 px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white transition"
                              >
                                <Trash2 size={18} /> Request Delete
                              </button>
                          )}
                          {course.status === 'deletion_pending' && (
                              <span className="text-xs text-red-300 italic">Waiting for Admin...</span>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;