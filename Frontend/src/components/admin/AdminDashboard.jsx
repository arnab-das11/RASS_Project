import { useState, useEffect } from "react";
import {
  Menu, X, Users, GraduationCap, LayoutDashboard,
  CheckCircle, XCircle, LogOut, BookOpen, Trash2, Edit3, Eye, Mail
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
// --- NEW: IMPORT RECHARTS ---
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("userInfo");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  const [users, setUsers] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [viewLearner, setViewLearner] = useState(null);
  const [viewInstructor, setViewInstructor] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const [usersRes, pendingRes, coursesRes, contactsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/courses/pending'),
        axios.get('http://localhost:5000/api/courses'),
        axios.get('http://localhost:5000/api/contact')
      ]);
      setUsers(usersRes.data);
      setPendingList(pendingRes.data);
      setAllCourses(coursesRes.data);
      setContacts(contactsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Admin Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate("/");
      return;
    }
    fetchData();
  }, [userInfo, navigate]);

  const learnersList = users.filter(u => u.role === 'learner');
  const instructorsList = users.filter(u => u.role === 'instructor');

  // --- ANALYTICS DATA CALCULATION ---
  // 1. Pie Chart Data (Users)
  const userRoleData = [
    { name: 'Learners', value: learnersList.length },
    { name: 'Instructors', value: instructorsList.length }
  ];
  const PIE_COLORS = ['#3b82f6', '#8b5cf6']; // Blue and Purple

  // 2. Bar Chart Data (Courses by Category)
  const categoryCounts = allCourses.reduce((acc, course) => {
    const cat = course.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const courseCategoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    Courses: categoryCounts[key]
  }));

  // --- HANDLERS ---
  const handleAction = async (course, actionType) => {
    if (course.status === 'deletion_pending') {
      const isApprove = actionType === 'approve';
      if (!window.confirm(isApprove ? "PERMANENTLY DELETE this course?" : "Cancel deletion?")) return;
      setPendingList(prev => prev.filter(c => c._id !== course._id));
      try {
        if (isApprove) {
          await axios.delete(`http://localhost:5000/api/courses/${course._id}`);
          setAllCourses(prev => prev.filter(c => c._id !== course._id));
        } else {
          await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: 'approved' });
          fetchData();
        }
      } catch (error) { alert("Error processing request."); }
    } else {
      if (!window.confirm(actionType === 'approve' ? "Approve this new course?" : "Reject this new course?")) return;
      setPendingList(prev => prev.filter(c => c._id !== course._id));
      try {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
        await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: newStatus });
        if (actionType === 'approve') fetchData();
      } catch (error) { alert("Error updating status."); }
    }
  };

  const handleDeleteDirectly = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to FORCE DELETE this course?")) return;
    setAllCourses(prev => prev.filter(c => c._id !== id));
    try { await axios.delete(`http://localhost:5000/api/courses/${id}`); }
    catch (error) { alert("Failed to delete course."); }
  };

  const handleUnenroll = async (userId, courseId) => {
    if (!window.confirm("Remove this student from the course?")) return;
    try {
      await axios.post('http://localhost:5000/api/users/unenroll', { userId, courseId });
      setViewLearner(prev => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.filter(c => c._id !== courseId)
      }));
      fetchData();
    } catch (error) { alert("Failed to unenroll student."); }
  };

  const handleSaveCourseEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, editingCourse);
      setEditingCourse(null);
      fetchData();
      alert("Course updated successfully!");
    } catch (error) { alert("Failed to update course."); }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/contact/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      alert("Message deleted successfully.");
    } catch (error) {
      alert("Failed to delete message: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  if (!userInfo) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* --- SIDEBAR --- */}
      <aside className={`fixed z-30 top-0 left-0 h-screen bg-gray-900 text-white w-64 p-6 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative shadow-2xl`}>
        <div className="mb-10 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl flex items-center gap-2 text-blue-400">
            <LayoutDashboard size={24} /> <span>Admin Panel</span>
          </Link>
          <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview & Analytics' },
            { id: 'all-courses', icon: BookOpen, label: 'Manage Courses' },
            { id: 'learners', icon: GraduationCap, label: 'Student Roster' },
            { id: 'instructors', icon: Users, label: 'Instructors' },
            { id: 'contacts', icon: Mail, label: 'Contact Queries' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition font-semibold"><LogOut size={20} /> System Logout</button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600 hover:text-blue-600 transition" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight capitalize">
              {activeTab === 'all-courses' ? 'Manage Courses' : activeTab === 'dashboard' ? 'System Overview' : activeTab === 'contacts' ? 'Contact Queries' : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">{userInfo.name}</p>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Super Admin</p>
            </div>

            {/* THE FIX: Bulletproof Avatar Logic */}
            {userInfo?.profilePicture ? (
              <img
                src={userInfo.profilePicture}
                alt={userInfo.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Admin')}&background=random&color=fff`;
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 shadow-sm uppercase">
                {userInfo?.name?.charAt(0) || "A"}
              </div>
            )}

          </div>
        </header>

        <main className="p-8 overflow-y-auto bg-gray-50 flex-1 relative">
          {loading ? <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div> : (
            <>
              {/* --- DASHBOARD TAB (WITH CHARTS) --- */}
              {activeTab === "dashboard" && (
                <div className="max-w-7xl mx-auto animate-fade-in">

                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-300 transition cursor-default">
                      <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Actions</p>
                        <h3 className="text-4xl font-black text-gray-800 group-hover:text-orange-500 transition">{pendingList.length}</h3>
                      </div>
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500"><LayoutDashboard size={28} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition cursor-default">
                      <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Active Courses</p>
                        <h3 className="text-4xl font-black text-gray-800 group-hover:text-blue-600 transition">{allCourses.length}</h3>
                      </div>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><BookOpen size={28} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-300 transition cursor-default">
                      <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                        <h3 className="text-4xl font-black text-gray-800 group-hover:text-purple-600 transition">{users.length}</h3>
                      </div>
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600"><Users size={28} /></div>
                    </div>
                  </div>

                  {/* --- NEW: ANALYTICS CHARTS ROW --- */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                    {/* Pie Chart: User Demographics */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="text-blue-500" size={20} /> User Demographics
                      </h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userRoleData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {userRoleData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart: Course Library */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="text-purple-500" size={20} /> Course Library by Category
                      </h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={courseCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <RechartsTooltip
                              cursor={{ fill: '#F3F4F6' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="Courses" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals Table */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                      <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span> Action Required Queue
                    </h2>

                    {pendingList.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
                        <h3 className="text-lg font-bold text-gray-700">All Caught Up!</h3>
                        <p className="text-gray-500 font-medium">No pending requests at this time.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingList.map(course => (
                          <div key={course._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition group">
                            <div className="flex gap-5 items-center">
                              <img src={course.thumbnail} className="w-32 h-20 object-cover rounded-lg bg-gray-200 border border-gray-100" alt="" />
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{course.title}</h3>
                                <div className="flex items-center gap-3 text-sm font-medium">
                                  <span className="text-gray-500 flex items-center gap-1"><Users size={14} /> {course.instructorId?.name || "Unknown"}</span>
                                  {course.status === 'deletion_pending'
                                    ? <span className="bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">Deletion Request</span>
                                    : <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">New Course Request</span>
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                              {course.status === 'deletion_pending' ? (
                                <>
                                  <button onClick={() => handleAction(course, 'reject')} className="flex-1 md:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition">Deny Deletion</button>
                                  <button onClick={() => handleAction(course, 'approve')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-bold transition shadow-md"><Trash2 size={16} /> Delete</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleAction(course, 'reject')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-bold transition"><XCircle size={16} /> Reject</button>
                                  <button onClick={() => handleAction(course, 'approve')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 font-bold transition shadow-md"><CheckCircle size={16} /> Approve</button>
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
                <div className="max-w-7xl mx-auto animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCourses.map(course => (
                      <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className="h-44 bg-gray-200 relative overflow-hidden">
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-gray-800 uppercase tracking-wide shadow-sm">
                            {course.category}
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1">
                            <Users size={14} className="text-blue-500" /> {course.instructorId?.name || "Unknown Instructor"}
                          </p>
                          <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                            <span className="font-black text-gray-800">${course.price}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingCourse(course)} className="text-blue-600 hover:text-white p-2 hover:bg-blue-600 bg-blue-50 rounded-lg transition" title="Edit Course">
                                <Edit3 size={18} />
                              </button>
                              <button onClick={() => handleDeleteDirectly(course._id)} className="text-red-600 hover:text-white p-2 hover:bg-red-600 bg-red-50 rounded-lg transition" title="Delete Course">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- LEARNERS TAB --- */}
              {activeTab === "learners" && (
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto scrollbar-thin animate-fade-in">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-5">Student Name</th>
                        <th className="p-5">Email</th>
                        <th className="p-5 text-center">Enrolled Courses</th>
                        <th className="p-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {learnersList.map(user => (
                        <tr key={user._id} className="hover:bg-blue-50/50 transition">
                          <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-black shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                            {user.name}
                          </td>
                          <td className="p-5 text-gray-600 font-medium">{user.email}</td>
                          <td className="p-5 text-center">
                            <span className="bg-gray-100 text-gray-700 font-bold py-1 px-3 rounded-full border border-gray-200">
                              {user.enrolledCourses?.length || 0}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <button
                              onClick={() => setViewLearner(user)}
                              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 font-bold py-1.5 px-4 rounded-lg shadow-sm transition"
                            >
                              <Eye size={16} /> View Activity
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- INSTRUCTORS TAB --- */}
              {activeTab === "instructors" && (
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto scrollbar-thin animate-fade-in">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-5">Instructor Name</th>
                        <th className="p-5">Email</th>
                        <th className="p-5 text-center">Published Courses</th>
                        <th className="p-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {instructorsList.map(user => {
                        const myCourses = allCourses.filter(c => c.instructorId?._id === user._id || c.instructorId === user._id);
                        return (
                          <tr key={user._id} className="hover:bg-purple-50/50 transition">
                            <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-purple-700 font-black shadow-sm">
                                {user.name.charAt(0)}
                              </div>
                              {user.name}
                            </td>
                            <td className="p-5 text-gray-600 font-medium">{user.email}</td>
                            <td className="p-5 text-center">
                              <span className="bg-purple-50 text-purple-700 font-bold py-1 px-3 rounded-full border border-purple-200">
                                {myCourses.length}
                              </span>
                            </td>
                            <td className="p-5 text-center">
                              <button
                                onClick={() => setViewInstructor({ ...user, courses: myCourses })}
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-purple-500 hover:text-purple-600 text-gray-600 font-bold py-1.5 px-4 rounded-lg shadow-sm transition"
                              >
                                <BookOpen size={16} /> View Portfolio
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- CONTACT QUERIES TAB --- */}
              {activeTab === "contacts" && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-blue-600" /> Messages Box ({contacts.length})
                      </h2>
                    </div>
                    {contacts.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-xl m-6 border-2 border-dashed border-gray-200">
                        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
                        <h3 className="text-lg font-bold text-gray-700">Inbox is empty</h3>
                        <p className="text-gray-500 font-medium">No contact form submissions at this time.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {contacts.map((msg) => (
                          <div key={msg._id} className="p-6 hover:bg-gray-50/50 transition duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900 text-lg">{msg.name}</span>
                                <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1">
                                  &lt;{msg.email}&gt;
                                </a>
                              </div>
                              {msg.subject && (
                                <p className="text-sm font-semibold text-gray-700">
                                  Subject: <span className="text-gray-500 font-medium">{msg.subject}</span>
                                </p>
                              )}
                              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                              <p className="text-xs text-gray-400">
                                Submitted on: {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
                                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-sm transition shadow-sm"
                              >
                                Reply via Email
                              </a>
                              <button
                                onClick={() => handleDeleteContact(msg._id)}
                                className="p-2 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* MODALS OVERLAYS */}
          {/* ========================================================= */}

          {/* 1. LEARNER DETAILS MODAL */}
          {viewLearner && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                    <GraduationCap className="text-blue-600" /> {viewLearner.name}'s Enrollments
                  </h2>
                  <button onClick={() => setViewLearner(null)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {viewLearner.enrolledCourses?.length > 0 ? (
                    <div className="space-y-4">
                      {viewLearner.enrolledCourses.map(course => (
                        <div key={course._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-200 transition">
                          <div className="flex items-center gap-4">
                            <img src={course.thumbnail} alt="" className="w-16 h-10 object-cover rounded bg-gray-100" />
                            <span className="font-bold text-gray-800">{course.title}</span>
                          </div>
                          <button
                            onClick={() => handleUnenroll(viewLearner._id, course._id)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-sm transition border border-transparent hover:border-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10 font-medium">This student is not enrolled in any courses.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. INSTRUCTOR DETAILS MODAL */}
          {viewInstructor && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                    <Users className="text-purple-600" /> {viewInstructor.name}'s Portfolio
                  </h2>
                  <button onClick={() => setViewInstructor(null)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {viewInstructor.courses?.length > 0 ? (
                    <div className="space-y-4">
                      {viewInstructor.courses.map(course => (
                        <div key={course._id} className="flex items-center p-4 border border-gray-200 rounded-xl bg-white">
                          <img src={course.thumbnail} alt="" className="w-16 h-10 object-cover rounded bg-gray-100 mr-4" />
                          <div>
                            <p className="font-bold text-gray-800">{course.title}</p>
                            <p className="text-xs font-bold text-purple-600 uppercase mt-1">{course.category} • ${course.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-10 font-medium">This instructor has not published any courses yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. EDIT COURSE MODAL */}
          {editingCourse && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                    <Edit3 className="text-blue-600" /> Edit Course Details
                  </h2>
                  <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveCourseEdit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={editingCourse.category}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Price (USD)</label>
                      <input
                        type="number"
                        value={editingCourse.price}
                        onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setEditingCourse(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;