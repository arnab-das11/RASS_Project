import { useState, useEffect } from "react";
import { Menu, X, Users, BookOpen, GraduationCap, Settings, BarChart3, LogOut, LayoutDashboard, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import logo from "../../assets/logo.png"; // Ensure this path is correct

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate();

  // Real Data State
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeCourses: 0,
    totalInstructors: 0,
    pendingCourses: 0
  });
  
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Stats & Pending Courses on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Stats
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(statsRes.data);

        // Get Pending Courses
        const pendingRes = await axios.get('http://localhost:5000/api/courses/admin/pending');
        setPendingList(pendingRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Handle Approve/Reject
  const handleCourseAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/courses/admin/approve/${id}`, { status });
      
      // Remove from list locally to update UI instantly
      setPendingList(prev => prev.filter(course => course._id !== id));
      
      // Update stats locally
      setStats(prev => ({
        ...prev,
        pendingCourses: prev.pendingCourses - 1,
        activeCourses: status === 'approved' ? prev.activeCourses + 1 : prev.activeCourses
      }));
      
      alert(`Course ${status} successfully!`);
    } catch (error) {
      alert("Action failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside
        className={`fixed z-20 top-0 left-0 h-screen bg-yellow-200 text-black w-64 p-6 flex flex-col transition-transform duration-500 ease-in-out transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        md:translate-x-0 md:relative`}>

        <div className="flex items-center justify-between mb-10">
          <Link to="/">
            {/* If logo is missing, fallback text ensures layout doesn't break */}
            <img
              src={logo}
              alt="Logo"
              className="w-28 sm:w-32 cursor-pointer"
              onError={(e) => {e.target.style.display='none'}} 
            />
            <span className="font-bold text-xl md:hidden">Admin</span>
          </Link>
          <button className="md:hidden text-black" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs uppercase text-indigo-500 font-semibold mb-3 px-2">Main</p>
          <div className="space-y-2 mb-6">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-yellow-400 shadow-sm transition">
              <LayoutDashboard size={20} /> Dashboard
            </button>
          </div>

          <p className="text-xs uppercase text-indigo-500 font-semibold mb-3 px-2">Management</p>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-300 transition">
              <Users size={20} /> Learners
            </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-300 transition">
              <Users size={20} /> Instructors
            </button>
            <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-300 transition">
              <BookOpen size={20} /> Courses
            </button>
          </div>
        </nav>

        <div className="pt-4 border-t border-yellow-400 mt-6">
          <button onClick={handleLogout} className="flex items-center gap-3 text-left w-full px-3 py-2 rounded-lg hover:bg-red-400 hover:text-white transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-indigo-700" onClick={toggleSidebar}>
              <Menu size={26} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-600">Admin Account</span>
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
               A
             </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Total Learners", value: stats.totalLearners, icon: <GraduationCap size={36} className="text-indigo-500" /> },
              { title: "Active Courses", value: stats.activeCourses, icon: <BookOpen size={36} className="text-green-500" /> },
              { title: "Instructors", value: stats.totalInstructors, icon: <Users size={36} className="text-blue-500" /> },
              { title: "Pending Approvals", value: stats.pendingCourses, icon: <BarChart3 size={36} className="text-orange-500" /> },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">{card.title}</h3>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{loading ? "..." : card.value}</p>
                  </div>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Courses Approval Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Pending Course Approvals</h2>
            
            {loading ? (
              <p>Loading...</p>
            ) : pendingList.length === 0 ? (
              <p className="text-gray-500 italic">No pending courses to review.</p>
            ) : (
              <div className="space-y-4">
                {pendingList.map((course) => (
                  <div key={course._id} className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500">Instructor: {course.instructor?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-400 mt-1">{course.description?.substring(0, 100)}...</p>
                    </div>
                    <div className="flex gap-3 mt-3 md:mt-0">
                      <button 
                        onClick={() => handleCourseAction(course._id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button 
                        onClick={() => handleCourseAction(course._id, 'approved')}
                        className="flex items-center gap-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;