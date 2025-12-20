import { useState, useEffect } from "react";
import { 
  Menu, X, Users, GraduationCap, LayoutDashboard, 
  CheckCircle, XCircle, LogOut, BookOpen, Trash2, PlusCircle 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("userInfo");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  });

  const [users, setUsers] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [allCourses, setAllCourses] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching Admin Data...");
        
        const [usersRes, pendingRes, coursesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/users'),
            // Fetches 'pending' AND 'deletion_pending'
            axios.get('http://localhost:5000/api/courses/pending'),
            axios.get('http://localhost:5000/api/courses')
        ]);

        setUsers(usersRes.data);
        setPendingList(pendingRes.data);
        setAllCourses(coursesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Admin Fetch Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo, navigate]);

  const learnersList = users.filter(u => u.role === 'learner');
  const instructorsList = users.filter(u => u.role === 'instructor');

  // --- HANDLER: Course Actions (Approve/Reject Requests) ---
  const handleAction = async (course, actionType) => {
    // actionType: 'approve' | 'reject'
    
    // SCENARIO 1: DELETION REQUEST
    if (course.status === 'deletion_pending') {
        const isApprove = actionType === 'approve'; // Admin says "Yes, delete it"
        
        const confirmMsg = isApprove 
            ? "PERMANENTLY DELETE this course? This cannot be undone." 
            : "Cancel deletion and keep the course active?";
        
        if (!window.confirm(confirmMsg)) return;

        // Optimistic UI
        setPendingList(prev => prev.filter(c => c._id !== course._id));

        try {
            if (isApprove) {
                // DELETE DATA
                await axios.delete(`http://localhost:5000/api/courses/${course._id}`);
                setAllCourses(prev => prev.filter(c => c._id !== course._id));
            } else {
                // RESTORE TO APPROVED
                await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: 'approved' });
            }
        } catch (error) {
            alert("Error processing request.");
        }
    } 
    // SCENARIO 2: NEW COURSE REQUEST
    else {
        const confirmMsg = actionType === 'approve' ? "Approve this new course?" : "Reject this new course?";
        if (!window.confirm(confirmMsg)) return;

        setPendingList(prev => prev.filter(c => c._id !== course._id));

        try {
            const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
            await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: newStatus });
            
            if (actionType === 'approve') {
                const { data } = await axios.get(`http://localhost:5000/api/courses/${course._id}`);
                setAllCourses(prev => [...prev, data]);
            }
        } catch (error) {
            alert("Error updating status.");
        }
    }
  };

  // --- FORCE DELETE (Directly from All Courses Tab) ---
  const handleDeleteDirectly = async (id) => {
    // This answers your question: YES, it asks for confirmation.
    if(!window.confirm("WARNING: Are you sure you want to FORCE DELETE this approved course?")) return;
    
    setAllCourses(prev => prev.filter(c => c._id !== id));
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
    } catch (error) {
      alert("Failed to delete course.");
    }
  };

  const handleLogout = () => {
    if(!window.confirm("Log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!userInfo) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className={`fixed z-20 top-0 left-0 h-screen bg-gray-900 text-white w-64 p-6 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative shadow-xl`}>
        <div className="mb-10 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl flex items-center gap-2 text-green-400">
              <span>Admin Panel</span>
          </Link>
          <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}><X/></button>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("all-courses")} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition font-medium ${activeTab === "all-courses" ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <BookOpen size={20} /> All Courses
          </button>
          <button onClick={() => setActiveTab("learners")} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition font-medium ${activeTab === "learners" ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <GraduationCap size={20} /> Learners
          </button>
          <button onClick={() => setActiveTab("instructors")} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition font-medium ${activeTab === "instructors" ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <Users size={20} /> Instructors
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"><LogOut size={20}/> Logout</button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10">
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}><Menu/></button>
          <h1 className="text-2xl font-bold capitalize text-gray-800">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-600">Administrator</span>
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border-2 border-green-200">A</div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto bg-gray-50 flex-1">
          {loading ? <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div> : (
            <>
              {/* --- DASHBOARD TAB --- */}
              {activeTab === "dashboard" && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-10 -mt-10"></div>
                      <h3 className="text-gray-500 font-medium relative z-10">Pending Actions</h3>
                      <p className="text-4xl font-bold text-orange-500 mt-2 relative z-10">{pendingList.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
                      <h3 className="text-gray-500 font-medium relative z-10">Approved Courses</h3>
                      <p className="text-4xl font-bold text-blue-600 mt-2 relative z-10">{allCourses.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-10 -mt-10"></div>
                      <h3 className="text-gray-500 font-medium relative z-10">Total Users</h3>
                      <p className="text-4xl font-bold text-indigo-600 mt-2 relative z-10">{users.length}</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-orange-500 rounded-full"></span> 
                        Action Required
                    </h2>
                    
                    {pendingList.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                           <CheckCircle className="mx-auto text-gray-300 mb-2" size={40}/>
                           <p className="text-gray-400 font-medium">No pending requests. All caught up!</p>
                        </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingList.map(course => (
                          <div key={course._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition">
                            <div className="flex gap-4">
                                <img src={course.thumbnail} className="w-24 h-16 object-cover rounded-lg bg-gray-200" alt=""/>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{course.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                       <Users size={14}/> {course.instructorId?.name || "Unknown"}
                                       
                                       {course.status === 'deletion_pending' ? (
                                           <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-bold border border-red-200">Requesting Deletion</span>
                                       ) : (
                                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold border border-blue-200">New Course</span>
                                       )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                              {course.status === 'deletion_pending' ? (
                                  <>
                                    <button onClick={() => handleAction(course, 'reject')} className="flex-1 md:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
                                        Cancel Deletion
                                    </button>
                                    <button onClick={() => handleAction(course, 'approve')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition shadow-lg shadow-red-200">
                                        <Trash2 size={18}/> Confirm Delete
                                    </button>
                                  </>
                              ) : (
                                  <>
                                    <button onClick={() => handleAction(course, 'reject')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium transition">
                                        <XCircle size={18}/> Reject
                                    </button>
                                    <button onClick={() => handleAction(course, 'approve')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition shadow-lg shadow-green-200">
                                        <CheckCircle size={18}/> Approve
                                    </button>
                                  </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- ALL COURSES TAB --- */}
              {activeTab === "all-courses" && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                   <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage All Courses</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allCourses.map(course => (
                            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                <div className="h-40 bg-gray-200 relative">
                                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover"/>
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700">
                                        {course.category}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{course.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                        <Users size={14}/> {course.instructorId?.name || "Unknown"}
                                    </p>
                                    <div className="flex justify-between items-center border-t pt-4">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            Active
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteDirectly(course._id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                                            title="Admin Force Delete"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                   </div>
                   {allCourses.length === 0 && <p className="text-center text-gray-500 mt-10">No approved courses found.</p>}
                </div>
              )}

              {/* --- LEARNERS TAB --- */}
              {activeTab === "learners" && (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Registered Learners</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                      <tr>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {learnersList.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                  {user.name.charAt(0)}
                              </div>
                              {user.name}
                          </td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                          <td className="p-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- INSTRUCTORS TAB --- */}
              {activeTab === "instructors" && (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Verified Instructors</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                      <tr>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {instructorsList.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                                  {user.name.charAt(0)}
                              </div>
                              {user.name}
                          </td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                          <td className="p-4"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Verified</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;