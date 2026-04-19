import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, Plus, Users, Clock, DollarSign, 
  Trash2, Edit, MonitorPlay, FileText, CheckCircle2, AlertCircle, Home, LogOut
} from "lucide-react";
import axios from "axios";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("userInfo");
    if (!userStr) {
      navigate("/");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'instructor') {
      navigate("/");
      return;
    }
    setUserInfo(user);

    const fetchInstructorData = async () => {
      try {
        const [approvedRes, pendingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/courses'),
          axios.get('http://localhost:5000/api/courses/pending')
        ]);

        const allFetched = [...approvedRes.data, ...pendingRes.data];
        
        const filtered = allFetched.filter(c => {
            const instId = c.instructorId?._id || c.instructorId;
            return instId === user._id;
        });

        const uniqueCourses = Array.from(new Map(filtered.map(item => [item._id, item])).values());
        setMyCourses(uniqueCourses);
      } catch (error) {
        console.error("Error fetching instructor courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [navigate]);

  const handleRequestDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to request deletion of this course? The Admin must approve it.")) return;
    try {
        await axios.put(`http://localhost:5000/api/courses/${courseId}/status`, { status: 'deletion_pending' });
        setMyCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: 'deletion_pending' } : c));
        alert("Deletion request sent to Admin.");
    } catch (error) {
        alert("Failed to request deletion.");
    }
  };

  const handleLogout = () => {
    if(!window.confirm("Log out of Instructor Portal?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-[#0a192f] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-300 font-sans pb-20">
      
      {/* Top Navigation */}
      <nav className="bg-[#112240] border-b border-blue-900/50 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
            {/* --- BULLETPROOF AVATAR --- */}
            {userInfo?.profilePicture ? (
                <img 
                    src={userInfo.profilePicture} 
                    alt={userInfo.name} 
                    className="w-10 h-10 rounded-xl object-cover border-2 border-sky-500/50 shadow-lg"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Instructor')}&background=random&color=fff`;
                    }}
                />
            ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg uppercase">
                    {userInfo?.name?.charAt(0) || "I"}
                </div>
            )}
            
            <div>
                <h1 className="text-xl font-bold text-sky-100 tracking-tight">Instructor Portal</h1>
                <p className="text-xs text-sky-400/70 font-semibold uppercase tracking-wider">Welcome back, {userInfo?.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-sky-400 transition" title="Home"><Home size={20}/></button>
            <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-300 transition bg-red-400/10 hover:bg-red-400/20 rounded-lg flex items-center gap-2 text-sm font-bold"><LogOut size={16}/> Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 tracking-tight mb-2">My Arsenal</h2>
                <p className="text-slate-400 font-medium">Manage your published and pending courses.</p>
            </div>
            <button onClick={() => navigate('/instructor-course')} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 transform hover:-translate-y-1">
                <Plus size={20}/> Forge New Course
            </button>
        </div>

        {/* Course Grid */}
        {myCourses.length === 0 ? (
            <div className="bg-[#112240] rounded-3xl p-12 text-center border border-blue-800/40 shadow-2xl">
                <BookOpen className="mx-auto w-16 h-16 text-blue-500/50 mb-4" />
                <h3 className="text-2xl font-bold text-sky-100 mb-2">No courses forged yet.</h3>
                <p className="text-slate-400 mb-6">Your teaching journey begins with a single step.</p>
                <button onClick={() => navigate('/instructor-course')} className="px-6 py-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/50 hover:border-transparent rounded-full font-bold transition">Start Building</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myCourses.map(course => (
                    <div key={course._id} className="bg-[#112240] rounded-3xl overflow-hidden border border-blue-800/40 hover:border-sky-500/50 transition-all shadow-xl group flex flex-col">
                        
                        {/* Thumbnail */}
                        <div className="h-48 relative overflow-hidden bg-[#0a192f]">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" />
                            
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-lg border">
                                {course.status === 'approved' && <span className="text-green-400 border-green-400/30 flex items-center gap-1"><CheckCircle2 size={14}/> Active</span>}
                                {course.status === 'pending' && <span className="text-yellow-400 border-yellow-400/30 flex items-center gap-1"><Clock size={14}/> Pending Review</span>}
                                {course.status === 'deletion_pending' && <span className="text-red-400 border-red-400/30 flex items-center gap-1"><AlertCircle size={14}/> Deleting</span>}
                                {course.status === 'rejected' && <span className="text-red-500 border-red-500/30 flex items-center gap-1"><AlertCircle size={14}/> Rejected</span>}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-sky-100 mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex gap-4 text-xs font-bold text-slate-400 mb-6">
                                <span className="flex items-center gap-1"><Clock size={14} className="text-blue-400"/> {course.duration}h</span>
                                <span className="flex items-center gap-1"><DollarSign size={14} className="text-green-400"/> {course.price}</span>
                            </div>
                            
                            {/* Actions */}
                            <div className="mt-auto flex justify-between items-center border-t border-blue-900/50 pt-5">
                                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{course.category}</span>
                                <div className="flex gap-2">
                                    {course.status === 'approved' && (
                                        <button onClick={() => handleRequestDelete(course._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition border border-red-500/20" title="Request Deletion">
                                            <Trash2 size={18}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;