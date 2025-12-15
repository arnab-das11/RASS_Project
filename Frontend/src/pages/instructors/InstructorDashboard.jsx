import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, PlusCircle, Edit, Trash2, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]); // Empty initially, will load from DB
  const [requests, setRequests] = useState([]);
  const [editing, setEditing] = useState(null);
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    duration: "6 Months",
    level: "Beginner"
  });

  const navigate = useNavigate();

  // 1. Load User Info & Real Courses from Backend
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
      navigate("/instructor-signup");
      return;
    }
    setUserInfo(user);

    // Fetch Courses for this specific instructor
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/courses/instructor/${user._id}`);
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };

    fetchCourses();
  }, [navigate]);

  // 2. Handle Create Course (Talks to Backend)
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCourse,
        instructorId: userInfo._id // Link course to this instructor
      };

      const { data } = await axios.post("http://localhost:5000/api/courses", payload);
      
      // Add new course to list instantly
      setCourses([...courses, data]);
      setShowModal(false); // Close popup
      setNewCourse({ title: "", description: "", duration: "6 Months", level: "Beginner" }); // Reset form
      alert("Course Created Successfully!");
      
    } catch (error) {
      alert("Error creating course: " + error.message);
    }
  };

  const handleDeleteRequest = (id) => {
    if (!window.confirm("Delete this request?")) return;
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    localStorage.setItem("courseRequests", JSON.stringify(updated));
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/instructor-signup");
  };

  // ... (Keep existing AI Edit logic) ...
  const openEdit = (courseId) => {
    setEditing(courseId);
    setAiEditPrompt("");
  };

  const handleAiEdit = async (courseId) => {
    setAiBusy(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCourses((prev) =>
      prev.map((c) =>
        c._id === courseId // Note: MongoDB uses _id, not id
          ? { ...c, description: c.description + " (Edited: " + aiEditPrompt + ")" }
          : c
      )
    );
    setEditing(null);
    setAiBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] text-white p-6 relative">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg"
          >
            Instructor Portfolio
          </motion.h1>

          <div className="flex items-center gap-3">
             <span className="text-sm text-sky-200 mr-2">Welcome, {userInfo?.name}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a2a44] border border-blue-600/40 hover:bg-blue-900/40 transition"
            >
              <User size={18} /> <span className="hidden sm:block">My Profile</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 transition"
            >
              <LogOut size={18} /> <span className="hidden sm:block">Logout</span>
            </motion.button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar (Requests) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#112240]/70 rounded-2xl shadow-lg backdrop-blur-md border border-blue-800/50 h-fit"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sky-300 text-lg">Course Actions</h2>
              <button
                onClick={() => setShowModal(true)} // Open Modal
                className="flex items-center gap-1 text-green-400 hover:text-green-200 font-medium"
              >
                <PlusCircle size={18} /> Create New
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4">Manage your course content and requests here.</p>
            {/* You can keep your requests list logic here if needed */}
          </motion.section>

          {/* Main Content (Course Cards) */}
          <section className="lg:col-span-2 space-y-8">
            {courses.length === 0 ? (
              <div className="text-center p-10 text-slate-400 bg-[#122a46]/50 rounded-2xl">
                No courses found. Click "Create New" to start teaching!
              </div>
            ) : (
              courses.map((course) => (
                <motion.article
                  key={course._id} // MongoDB ID
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-[#122a46]/80 rounded-2xl border border-blue-800/50 shadow-lg hover:shadow-sky-500/20 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-semibold text-sky-300">{course.title}</h4>
                      <p className="text-sm text-slate-300">{course.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>⏱ {course.duration}</span>
                        <span>📊 {course.level}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(course._id)} className="p-2 rounded bg-sky-500/30 text-sky-200 hover:bg-sky-500/60 transition">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* AI Edit Input */}
                  {editing === course._id && (
                    <div className="mb-4 space-y-2">
                      <input
                        value={aiEditPrompt}
                        onChange={(e) => setAiEditPrompt(e.target.value)}
                        placeholder="Edit description with AI"
                        className="w-full p-2 border border-blue-700 rounded text-sm bg-[#0d1b2a] text-white focus:ring-2 focus:ring-sky-400 outline-none"
                      />
                      <button
                        onClick={() => handleAiEdit(course._id)}
                        disabled={aiBusy}
                        className="px-3 py-2 rounded bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600 transition"
                      >
                        {aiBusy ? "Editing..." : "Apply AI Edit"}
                      </button>
                    </div>
                  )}

                  {/* Learners Section (Mocked for now as DB doesn't have learners yet) */}
                  <div>
                    <h5 className="font-medium mb-2 text-slate-300 mt-4">Enrolled Learners</h5>
                    {(!course.learners || course.learners.length === 0) ? (
                        <p className="text-sm text-slate-500 italic">No learners enrolled yet.</p>
                    ) : (
                        course.learners.map((l, idx) => (
                           <div key={idx}>...</div> // Keep your existing learner mapping logic here if you want
                        ))
                    )}
                  </div>
                </motion.article>
              ))
            )}
          </section>
        </main>
      </div>

      {/* --- CREATE COURSE MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0f2744] border border-blue-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-sky-400 mb-6">Create New Course</h2>
              
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Course Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:outline-none focus:border-sky-500 transition"
                    placeholder="e.g. Advanced Python Masterclass"
                    value={newCourse.title}
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Thumbnail URL (Image)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:outline-none focus:border-sky-500 transition"
                    placeholder="https://example.com/image.jpg"
                    value={newCourse.thumbnail || ""}
                    onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Description</label>
                  <textarea 
                    required
                    className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:outline-none focus:border-sky-500 transition"
                    placeholder="What will students learn?"
                    rows="3"
                    value={newCourse.description}
                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Duration</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:outline-none focus:border-sky-500 transition"
                      placeholder="e.g. 6 Weeks"
                      value={newCourse.duration}
                      onChange={e => setNewCourse({...newCourse, duration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Level</label>
                    <select 
                      className="w-full p-3 rounded-lg bg-[#1a2a44] border border-blue-800 text-white focus:outline-none focus:border-sky-500 transition"
                      value={newCourse.level}
                      onChange={e => setNewCourse({...newCourse, level: e.target.value})}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition"
                >
                  Publish Course
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorDashboard;