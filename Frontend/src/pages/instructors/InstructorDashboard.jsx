import { useState, useEffect } from "react";
import { LogOut, PlusCircle, Trash2, Clock, BookOpen, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  
  // Default image constant
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  const navigate = useNavigate();

  // 1. Load User & Courses
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
      navigate("/");
      return;
    }
    setUserInfo(user);
    fetchCourses(user._id);
  }, [navigate]);

  const fetchCourses = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/courses/instructor/${userId}`);
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses", error);
    }
  };

  // 2. Delete Course
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      // Update UI immediately
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      alert("Error deleting course");
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    // --- RESTORED: Dark Gradient Background ---
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            {/* --- RESTORED: Gradient Text --- */}
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
              Instructor Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Manage your content and track status.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-sky-100">{userInfo?.name}</p>
                <p className="text-xs text-sky-300 uppercase">{userInfo?.role}</p>
            </div>
            {/* --- RESTORED: Glassy Red Logout Button --- */}
            <button onClick={handleLogout} className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Actions */}
          <aside className="lg:col-span-1 space-y-6">
             {/* --- RESTORED: Dark Blue Container --- */}
             <div className="p-6 bg-[#112240] rounded-2xl border border-blue-800/50 shadow-lg">
                <h2 className="text-sm font-bold text-sky-200 uppercase tracking-wider mb-4">Quick Actions</h2>
                
                {/* --- NEW FUNCTIONALITY (Link) with OLD COLOR (Green) --- */}
                <Link 
                  to="/instructor-course"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition shadow-lg"
                >
                  <PlusCircle size={20} /> Create New Course
                </Link>

             </div>

            {/* Recolored "Help" widget to fit dark theme */}
             <div className="bg-[#1a2a44] p-6 rounded-2xl border border-blue-800/30">
                <h3 className="font-bold text-sky-100 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-400 mb-4">Check our guide on how to upload high-quality video lectures.</p>
                <button className="text-sm text-sky-400 font-bold hover:underline">Read Guidelines</button>
             </div>
          </aside>

          {/* Course List */}
          <section className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold text-white">My Courses</h2>
            
            {courses.length === 0 ? (
              // --- RESTORED: Dark Empty State ---
              <div className="flex flex-col items-center justify-center p-12 bg-[#112240] rounded-2xl border-2 border-dashed border-slate-600 text-center">
                <div className="bg-[#1a2a44] p-4 rounded-full mb-4">
                    <BookOpen className="text-slate-400" size={32}/>
                </div>
                <h3 className="text-lg font-bold text-sky-100">No courses yet</h3>
                <p className="text-slate-400 max-w-xs mt-2">Start your journey by creating your first course curriculum.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                  // --- RESTORED: Dark Card Style ---
                  <div key={course._id} className="flex flex-col md:flex-row gap-6 p-6 bg-[#112240] rounded-2xl border border-blue-800/30 shadow-xl hover:shadow-2xl transition group">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-[#0a192f] relative shrink-0">
                       <img 
                         src={course.thumbnail || DEFAULT_IMAGE} 
                         alt={course.title}
                         className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                         onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                       />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                       <div>
                          <div className="flex justify-between items-start gap-4">
                             <div>
                                <h3 className="text-xl font-bold text-sky-100 group-hover:text-sky-300 transition">{course.title}</h3>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{course.description}</p>
                             </div>
                             
                             {/* --- RESTORED: Glassy Status Badges --- */}
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 shrink-0 ${
                               course.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                               course.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                               'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                             }`}>
                               {course.status === 'pending' && <AlertCircle size={12}/>}
                               {course.status || 'Pending'}
                             </span>
                          </div>

                          {/* --- RESTORED: Dark Metadata Tags --- */}
                          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 bg-[#1a2a44] px-2 py-1 rounded"><Clock size={14}/> {course.lectures?.length || 0} Lectures</span>
                            <span className="bg-[#1a2a44] px-2 py-1 rounded capitalize">{course.level}</span>
                            <span className="bg-[#1a2a44] px-2 py-1 rounded capitalize">{course.category}</span>
                          </div>
                       </div>

                       {/* Action Buttons */}
                       <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
                          {/* --- RESTORED: Dark Red Delete Button --- */}
                          <button 
                            onClick={() => handleDelete(course._id)}
                            className="flex items-center gap-1 text-sm bg-red-500/10 text-red-400 px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white transition"
                          >
                            <Trash2 size={18} /> Delete
                          </button>
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