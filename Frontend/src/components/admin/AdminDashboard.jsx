import { useState, useEffect } from "react";
import { Menu, X, Users, GraduationCap, LayoutDashboard, CheckCircle, XCircle, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Data State
  const [users, setUsers] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching Admin Data...");
        
        // 1. Get All Users
        const usersRes = await axios.get('http://localhost:5000/api/users');
        setUsers(usersRes.data);

        // 2. Get Pending Courses
        const pendingRes = await axios.get('http://localhost:5000/api/courses/pending');
        console.log("Pending fetched:", pendingRes.data);
        setPendingList(pendingRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Admin Fetch Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter lists
  const learnersList = users.filter(u => u.role === 'learner');
  const instructorsList = users.filter(u => u.role === 'instructor');

  // Course Approval
  const handleAction = async (id, status) => {
    try {
      // Matches route router.put("/:id/status", ...)
      await axios.put(`http://localhost:5000/api/courses/${id}/status`, { status });
      
      // Remove from pending list UI immediately
      setPendingList(prev => prev.filter(c => c._id !== id));
      alert(`Course ${status} successfully!`);
    } catch (error) {
      console.error(error);
      alert("Error updating course status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className={`fixed z-20 top-0 left-0 h-screen bg-yellow-200 text-black w-64 p-6 flex flex-col transition-transform duration-500 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative`}>
        <div className="mb-10 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">Admin Panel</Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X/></button>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${activeTab === "dashboard" ? "bg-yellow-400 font-bold" : "hover:bg-yellow-300"}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("learners")} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${activeTab === "learners" ? "bg-yellow-400 font-bold" : "hover:bg-yellow-300"}`}>
            <GraduationCap size={20} /> Learners
          </button>
          <button onClick={() => setActiveTab("instructors")} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${activeTab === "instructors" ? "bg-yellow-400 font-bold" : "hover:bg-yellow-300"}`}>
            <Users size={20} /> Instructors
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-3 py-2 hover:text-red-600"><LogOut size={20}/> Logout</button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu/></button>
          <h1 className="text-xl font-bold capitalize">{activeTab} View</h1>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">A</div>
        </header>

        <main className="p-6 overflow-y-auto">
          {loading ? <p className="text-center mt-10">Loading Data...</p> : (
            <>
              {/* --- DASHBOARD TAB --- */}
              {activeTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-orange-500">
                      <h3 className="text-gray-500">Pending Approvals</h3>
                      <p className="text-3xl font-bold text-orange-500">{pendingList.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-indigo-500">
                      <h3 className="text-gray-500">Total Learners</h3>
                      <p className="text-3xl font-bold text-indigo-700">{learnersList.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-500">
                      <h3 className="text-gray-500">Total Instructors</h3>
                      <p className="text-3xl font-bold text-blue-700">{instructorsList.length}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-bold mb-4">Pending Courses</h2>
                    {pendingList.length === 0 ? <p className="text-gray-400 italic">No courses waiting for approval.</p> : (
                      <div className="space-y-3">
                        {pendingList.map(course => (
                          <div key={course._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                            <div>
                              <h3 className="font-bold">{course.title}</h3>
                              <p className="text-sm text-gray-500">Instructor: {course.instructorId?.name || "Unknown"}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(course._id, 'rejected')} className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"><XCircle size={16}/> Reject</button>
                              <button onClick={() => handleAction(course._id, 'approved')} className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200"><CheckCircle size={16}/> Approve</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* --- LEARNERS TAB --- */}
              {activeTab === "learners" && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learnersList.map(user => (
                        <tr key={user._id} className="border-b">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- INSTRUCTORS TAB --- */}
              {activeTab === "instructors" && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorsList.map(user => (
                        <tr key={user._id} className="border-b">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-gray-600">{user.email}</td>
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