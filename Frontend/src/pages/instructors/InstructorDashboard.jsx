import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Plus, Clock, IndianRupee,
  Trash2, MonitorPlay, FileText, CheckCircle2, AlertCircle, LogOut,
  Menu, X, LayoutDashboard, MessageSquare
} from "lucide-react";
import axios from "axios";
import ChatModal from "../../components/ChatModal";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("courses");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchUnread = async (instId) => {
    try {
      const unreadRes = await axios.get(`http://localhost:5000/api/messages/unread/${instId}`);
      setUnreadMessages(unreadRes.data);
    } catch (e) {
      console.error("Error updating unread messages count:", e);
    }
  };

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

    const fetchAdminAndUnread = async () => {
      try {
        // Fetch Admin user
        const adminRes = await axios.get('http://localhost:5000/api/messages/admins');
        if (adminRes.data && adminRes.data.length > 0) {
          setAdminUser(adminRes.data[0]);
        }
        // Fetch Unread count
        fetchUnread(user._id);
      } catch (error) {
        console.error("Error fetching message/admin details:", error);
      }
    };

    fetchInstructorData();
    fetchAdminAndUnread();

    const interval = setInterval(() => {
      fetchUnread(user._id);
    }, 5000);

    return () => clearInterval(interval);
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
    if (!window.confirm("Log out of Instructor Portal?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const getAdminUnreadCount = () => {
    if (!adminUser?._id) return 0;
    return unreadMessages.filter(msg => msg.sender?._id === adminUser._id || msg.sender === adminUser._id).length;
  };

  const handleContactAdmin = () => {
    if (!adminUser) {
      alert("The Administrator (Supreme Leader) account is not active or registered in the database yet.");
      return;
    }
    setIsChatOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed z-30 top-0 left-0 h-screen bg-slate-900 text-white w-64 p-6 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative shadow-2xl`}>
        <div className="mb-10 flex justify-between items-center">
          <div className="font-bold text-xl flex items-center gap-2 text-indigo-400">
            <LayoutDashboard size={24} /> <span>Instructor Portal</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Tab item: My Arsenal */}
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === "courses"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BookOpen size={20} /> <span>My Course Arsenal</span>
          </button>

          {/* Option: Contact Supreme Leader */}
          <button
            onClick={handleContactAdmin}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold text-slate-400 hover:bg-slate-800 hover:text-white relative cursor-pointer"
          >
            <MessageSquare size={20} /> 
            <span className="flex-1 text-left">Contact Supreme Leader</span>
            {getAdminUnreadCount() > 0 && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md" title={`${getAdminUnreadCount()} unread messages`} />
            )}
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition font-semibold"
        >
          <LogOut size={20} /> Portal Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 hover:text-indigo-650 transition" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'courses' ? 'My Course Arsenal' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userInfo?.name}</p>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Expert Instructor</p>
            </div>
            
            {userInfo?.profilePicture ? (
              <img
                src={userInfo.profilePicture}
                alt={userInfo.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Instructor')}&background=random&color=fff`;
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-indigo-200 shadow-sm uppercase">
                {userInfo?.name?.charAt(0) || "I"}
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="p-8 overflow-y-auto bg-slate-50 flex-1 relative">
          <div className="max-w-7xl mx-auto animate-fade-in">
            
            {/* Header / Forge course card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 tracking-tight mb-2">My Course Blueprints</h2>
                <p className="text-slate-500 font-semibold">Manage your published and pending courses.</p>
              </div>
              <button onClick={() => navigate('/instructor-course')} className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-505 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer">
                <Plus size={20} /> Forge New Course
              </button>
            </div>

            {/* Course Grid */}
            {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl">
                <BookOpen className="mx-auto w-16 h-16 text-indigo-500/40 mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No courses forged yet.</h3>
                <p className="text-slate-500 mb-6 font-medium">Your teaching journey begins with a single step.</p>
                <button onClick={() => navigate('/instructor-course')} className="px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200/50 hover:border-transparent rounded-full font-bold transition cursor-pointer">Start Building</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myCourses.map(course => (
                  <div key={course._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-indigo-500/50 hover:shadow-2xl transition-all shadow-md group flex flex-col">
                    
                    {/* Thumbnail */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-lg border bg-white/80">
                        {course.status === 'approved' && <span className="text-green-600 border-green-600/30 flex items-center gap-1"><CheckCircle2 size={14} /> Active</span>}
                        {course.status === 'pending' && <span className="text-amber-600 border-amber-600/30 flex items-center gap-1"><Clock size={14} /> Pending Review</span>}
                        {course.status === 'deletion_pending' && <span className="text-red-650 border-red-650/30 flex items-center gap-1"><AlertCircle size={14} /> Deleting</span>}
                        {course.status === 'rejected' && <span className="text-red-700 border-red-700/30 flex items-center gap-1"><AlertCircle size={14} /> Rejected</span>}
                      </div>
                    </div>

                    {/* Content details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                      <div className="flex gap-4 text-xs font-bold text-slate-500 mb-6">
                        <span className="flex items-center gap-1"><Clock size={14} className="text-indigo-500" /> {course.duration}h</span>
                        <span className="flex items-center gap-1"><IndianRupee size={14} className="text-emerald-600" /> {course.price}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex justify-between items-center border-t border-slate-105 border-slate-100 pt-5">
                        <span className="text-xs text-slate-450 uppercase font-black tracking-wider">{course.category}</span>
                        <div className="flex gap-2">
                          {course.status === 'approved' && (
                            <button onClick={() => handleRequestDelete(course._id)} className="p-2 bg-red-50 text-red-650 hover:bg-red-600 hover:text-white rounded-lg transition border border-red-200/40 cursor-pointer" title="Request Deletion">
                              <Trash2 size={18} />
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
        </main>
      </div>

      {/* Chat modal room overlay */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={userInfo}
        otherUser={adminUser}
        onMessagesRead={() => userInfo && fetchUnread(userInfo._id)}
      />

    </div>
  );
};

export default InstructorDashboard;