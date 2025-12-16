import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, PlusCircle, Trash2, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  
  // Default image constant
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    thumbnail: "",
    description: "",
    duration: "6 Weeks",
    level: "Beginner"
  });

  const navigate = useNavigate();

  // 1. Load User & Courses
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
      navigate("/instructor-signup");
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

  // 2. Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newCourse, instructorId: userInfo._id };
      const { data } = await axios.post("http://localhost:5000/api/courses", payload);
      
      setCourses([...courses, data]);
      setShowModal(false);
      setNewCourse({ title: "", thumbnail: "", description: "", duration: "6 Weeks", level: "Beginner" });
      alert("Course Created! It is now PENDING Admin Approval.");
    } catch (error) {
      alert("Error creating course: " + error.message);
    }
  };

  // 3. Delete Course
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      alert("Error deleting course");
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/instructor-signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] text-white p-6 relative">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
            Instructor Panel
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sky-200">Hello, {userInfo?.name}</span>
            <button onClick={handleLogout} className="p-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Actions */}
          <aside className="lg:col-span-1 space-y-6">
             <div className="p-6 bg-[#112240] rounded-2xl border border-blue-800/50 shadow-lg">
                <h2 className="text-lg font-semibold text-sky-100 mb-4">Actions</h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-medium transition shadow-lg"
                >
                  <PlusCircle size={20} /> Create New Course
                </button>
             </div>
          </aside>

          {/* Course List */}
          <section className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">My Courses</h2>
            
            {courses.length === 0 ? (
              <div className="text-center p-12 bg-[#112240] rounded-2xl border border-dashed border-slate-600">
                <p className="text-slate-400">You haven't created any courses yet.</p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="flex flex-col md:flex-row gap-6 p-6 bg-[#112240] rounded-2xl border border-blue-800/30 shadow-xl hover:shadow-2xl transition">
                   {/* Thumbnail */}
                   <img 
                      src={course.thumbnail ? course.thumbnail : DEFAULT_IMAGE} 
                      alt={course.title}
                      className="w-full md:w-48 h-32 object-cover rounded-xl"
                      onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                   />
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-sky-100">{course.title}</h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          course.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                          course.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                        }`}>
                          {course.status || 'Pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
                        <span className="bg-[#1a2a44] px-2 py-1 rounded">{course.level}</span>
                      </div>
                   </div>

                   {/* Delete Action */}
                   <div className="flex items-center">
                      <button 
                        onClick={() => handleDelete(course._id)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
                        title="Delete Course"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>
              ))
            )}
          </section>
        </main>

        {/* Create Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f2744] border border-blue-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
              >
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
                <h2 className="text-2xl font-bold text-sky-400 mb-6">Create New Course</h2>
                
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300">Title</label>
                    <input type="text" required className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                      value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Thumbnail URL</label>
                    <input type="text" className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                      placeholder="https://example.com/image.jpg"
                      value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Description</label>
                    <textarea required rows="3" className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                      value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Duration" className="p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white"
                      value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} />
                    <select className="p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white"
                      value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})}>
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition">Publish Course</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstructorDashboard;