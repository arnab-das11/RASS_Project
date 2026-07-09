import { useState, useEffect } from "react";
import {
  Menu, X, Users, GraduationCap, LayoutDashboard,
  CheckCircle, XCircle, LogOut, BookOpen, Trash2, Edit3, Eye, Mail,
  Clock, Award, CheckCircle2, MonitorPlay, FileText, ChevronDown, ChevronUp, Link as LinkIcon,
  MessageSquare, ShieldAlert, DollarSign, TrendingUp, AlertTriangle, Settings, RefreshCw, BarChart2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ChatModal from "../ChatModal";
// --- NEW: IMPORT RECHARTS ---
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area
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
  const [previewCourse, setPreviewCourse] = useState(null);
  const [expandedLectures, setExpandedLectures] = useState({});
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  
  // Security Reset Modal States
  const [generatedVerificationCode, setGeneratedVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

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

  const fetchUnread = async () => {
    if (!userInfo?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/unread/${userInfo._id}`);
      setUnreadMessages(data);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  const getUnreadCountForUser = (userId) => {
    return unreadMessages.filter(msg => msg.sender?._id === userId || msg.sender === userId).length;
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate("/");
      return;
    }
    fetchData();
    fetchUnread();

    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [userInfo, navigate]);

  const learnersList = users.filter(u => u.role === 'learner');
  const instructorsList = users.filter(u => u.role === 'instructor');

  // --- DYNAMIC CODE GENERATION FOR SYSTEM MAINTENANCE ---
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // --- ANALYTICS DATA CALCULATION ---
  // 1. Demographics
  const userRoleData = [
    { name: 'Learners', value: learnersList.length },
    { name: 'Instructors', value: instructorsList.length }
  ];
  const PIE_COLORS = ['#3b82f6', '#8b5cf6']; // Blue and Purple

  // 2. Courses by Category
  const categoryCounts = allCourses.reduce((acc, course) => {
    const cat = course.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const courseCategoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    Courses: categoryCounts[key]
  }));

  // 3. Platform Revenue
  let totalRevenuePaise = 0;
  users.forEach(user => {
    if (user.enrolledCourses && Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses.forEach(enroll => {
        if (enroll.purchaseDetails && enroll.purchaseDetails.amountPaid) {
          totalRevenuePaise += Number(enroll.purchaseDetails.amountPaid);
        }
      });
    }
  });
  const totalRevenueRupees = totalRevenuePaise / 100;

  // 4. Cumulative XP
  const cumulativeStudentXP = learnersList.reduce((acc, learner) => acc + (learner.xp || 0), 0);

  // 5. Popular Courses by Enrollment
  const courseEnrollmentCounts = allCourses.reduce((acc, course) => {
    acc[course._id] = 0;
    return acc;
  }, {});

  users.forEach(user => {
    if (user.enrolledCourses && Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses.forEach(enroll => {
        const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
        if (courseEnrollmentCounts[courseId] !== undefined) {
          courseEnrollmentCounts[courseId]++;
        }
      });
    }
  });

  const popularCoursesData = allCourses.map(course => ({
    title: course.title,
    Enrollments: courseEnrollmentCounts[course._id] || 0
  }))
  .sort((a, b) => b.Enrollments - a.Enrollments)
  .slice(0, 5); // top 5 popular courses

  // 6. User Signup Growth Trend
  const signupCounts = users.reduce((acc, user) => {
    const dateStr = user.createdAt 
      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {});

  const userTrendData = Object.keys(signupCounts)
    .map(date => ({
      date,
      timestamp: new Date(date + ", " + new Date().getFullYear()).getTime(),
      Registrations: signupCounts[date]
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => ({ date: item.date, Registrations: item.Registrations }));

  // 7. Leaderboard (Top XP Students)
  const topLearners = learnersList
    .map(u => ({
      name: u.name,
      email: u.email,
      xp: u.xp || 0,
      level: Math.floor((u.xp || 0) / 1000) + 1,
      badgesCount: u.badges?.length || 0
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  // 8. Recent Transactions
  const transactions = [];
  users.forEach(user => {
    if (user.enrolledCourses && Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses.forEach(enroll => {
        const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
        const course = allCourses.find(c => c._id === courseId);
        transactions.push({
          id: enroll._id || Math.random().toString(),
          userName: user.name,
          userEmail: user.email,
          courseTitle: course ? course.title : 'Deleted/Unknown Course',
          amount: enroll.purchaseDetails?.amountPaid ? (enroll.purchaseDetails.amountPaid / 100) : 0,
          date: enroll.purchaseDetails?.enrollmentDate ? new Date(enroll.purchaseDetails.enrollmentDate) : new Date(user.createdAt || Date.now())
        });
      });
    }
  });
  transactions.sort((a, b) => b.date - a.date);
  const recentTransactions = transactions.slice(0, 5);

  // --- HANDLERS ---
  const handleAction = async (course, actionType) => {
    if (course.status === 'deletion_pending') {
      const isApprove = actionType === 'approve';
      if (!window.confirm(isApprove ? "PERMANENTLY DELETE this course?" : "Cancel deletion?")) return false;
      setPendingList(prev => prev.filter(c => c._id !== course._id));
      try {
        if (isApprove) {
          await axios.delete(`http://localhost:5000/api/courses/${course._id}`);
          setAllCourses(prev => prev.filter(c => c._id !== course._id));
        } else {
          await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: 'approved' });
          fetchData();
        }
        return true;
      } catch (error) { 
        alert("Error processing request."); 
        return false;
      }
    } else {
      if (!window.confirm(actionType === 'approve' ? "Approve this new course?" : "Reject this new course?")) return false;
      setPendingList(prev => prev.filter(c => c._id !== course._id));
      try {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
        await axios.put(`http://localhost:5000/api/courses/${course._id}/status`, { status: newStatus });
        if (actionType === 'approve') fetchData();
        return true;
      } catch (error) { 
        alert("Error updating status."); 
        return false;
      }
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

  const handleDeleteStudentsInstructors = async () => {
    if (!maintenanceChecked) {
      alert("Please check the acknowledgment box confirming you understand the consequences of this reset.");
      return;
    }
    if (enteredCode.trim().toUpperCase() !== generatedVerificationCode) {
      alert("Invalid verification code. Please type the exact code displayed.");
      return;
    }
    if (!window.confirm("CRITICAL WARNING: This will permanently erase ALL student profiles, grades, progress logs, XP metrics, courses, and portfolios from the system. Are you absolutely certain you wish to proceed?")) {
      return;
    }
    
    try {
      const response = await axios.delete("http://localhost:5000/api/admin/reset-users");
      alert(response.data.message);
      setEnteredCode('');
      setMaintenanceChecked(false);
      setGeneratedVerificationCode(generateRandomCode());
      fetchData(); // Refresh page data
    } catch (error) {
      console.error("Failed to delete user data:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Error: " + errorMsg);
      setGeneratedVerificationCode(generateRandomCode());
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
            { id: 'actions-required', icon: AlertTriangle, label: 'Actions Required' },
            { id: 'all-courses', icon: BookOpen, label: 'Manage Courses' },
            { id: 'learners', icon: GraduationCap, label: 'Student Roster' },
            { id: 'instructors', icon: Users, label: 'Instructors' },
            { id: 'contacts', icon: Mail, label: 'Contact Queries' },
            { id: 'maintenance', icon: Settings, label: 'System Reset' }
          ].map(tab => {
            const hasUnread = tab.id === 'instructors' && unreadMessages.length > 0;
            const hasCount = tab.id === 'actions-required' && pendingList.length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'maintenance') {
                    setEnteredCode('');
                    setMaintenanceChecked(false);
                    setGeneratedVerificationCode(generateRandomCode());
                  }
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              >
                <tab.icon size={20} /> 
                <span className="flex-1 text-left">{tab.label}</span>
                {hasUnread && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md" title={`${unreadMessages.length} unread messages`} />
                )}
                {hasCount && (
                  <span className="bg-orange-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-extrabold shadow-sm animate-pulse">
                    {pendingList.length}
                  </span>
                )}
              </button>
            );
          })}
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
              {activeTab === 'all-courses' ? 'Manage Courses' : 
               activeTab === 'dashboard' ? 'System Overview' : 
               activeTab === 'contacts' ? 'Contact Queries' : 
               activeTab === 'actions-required' ? 'Actions Required' :
               activeTab === 'maintenance' ? 'System Reset' : activeTab}
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
              {/* --- DASHBOARD TAB (WITH CHARTS & LEADERBOARDS) --- */}
              {activeTab === "dashboard" && (
                <div className="max-w-7xl mx-auto animate-fade-in space-y-10">

                  {/* Top Stats KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {/* Stat Card 1: Platform Revenue */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{totalRevenueRupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                          <TrendingUp size={10} /> Paid Enrollments
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500"><DollarSign size={22} /></div>
                    </div>

                    {/* Stat Card 2: Courses Catalog */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Courses</p>
                        <h3 className="text-2xl font-black text-gray-900">{allCourses.length}</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Published blueprints</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><BookOpen size={22} /></div>
                    </div>

                    {/* Stat Card 3: Total Accounts */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                        <h3 className="text-2xl font-black text-gray-900">{users.length}</h3>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {learnersList.length} S / {instructorsList.length} I
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-550"><Users size={22} /></div>
                    </div>

                    {/* Stat Card 4: Cumulative XP */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student XP</p>
                        <h3 className="text-2xl font-black text-gray-900">{cumulativeStudentXP.toLocaleString()}</h3>
                        <p className="text-[10px] text-blue-500 font-semibold">Total Gamification Points</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500"><Award size={22} /></div>
                    </div>

                    {/* Stat Card 5: Action Required (Interactive) */}
                    <div 
                      onClick={() => setActiveTab("actions-required")}
                      className={`p-5 rounded-2xl shadow-sm border transition cursor-pointer flex items-center justify-between group transform hover:-translate-y-1 ${pendingList.length > 0 ? "bg-orange-50/40 hover:bg-orange-50 border-orange-200 shadow-orange-100" : "bg-white border-gray-100 hover:shadow-md"}`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-405 uppercase tracking-wider">Pending Approvals</p>
                        <h3 className={`text-2xl font-black ${pendingList.length > 0 ? "text-orange-600 animate-pulse" : "text-gray-900"}`}>{pendingList.length}</h3>
                        <p className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                          {pendingList.length > 0 ? "Review actions queue →" : "All clean!"}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pendingList.length > 0 ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-gray-100 text-gray-400"}`}><AlertTriangle size={20} /></div>
                    </div>
                  </div>

                  {/* Charts Grid Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Chart 1 (Col span 2): Registration Trend (AreaChart) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <TrendingUp className="text-blue-500" size={18} /> Platform Signups Growth
                        </h3>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Live Registrations</span>
                      </div>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={userTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="Registrations" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRegistrations)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2 (Col span 1): User Demographics (PieChart) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                      <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="text-purple-500" size={18} /> Demographics Distribution
                      </h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userRoleData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {userRoleData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 text-xs font-semibold pt-4">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span> Learners ({learnersList.length})</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-500 rounded-full inline-block"></span> Instructors ({instructorsList.length})</span>
                      </div>
                    </div>

                    {/* Chart 3 (Col span 2): Popular Courses by Enrollment (BarChart) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <BarChart2 className="text-green-500" size={18} /> Popular Courses by Enrollment
                        </h3>
                        <span className="text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Top 5 Courses</span>
                      </div>
                      {popularCoursesData.length === 0 ? (
                        <div className="h-[250px] flex items-center justify-center text-gray-400 font-medium italic">No enrollments recorded yet.</div>
                      ) : (
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularCoursesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis 
                                dataKey="title" 
                                tick={{ fontSize: 9, fill: '#6B7280' }} 
                                axisLine={false} 
                                tickLine={false}
                                tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                              />
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#F9FAFB' }}
                              />
                              <Bar dataKey="Enrollments" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Content 4 (Col span 1): Course Library Category List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                      <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BookOpen className="text-orange-500" size={18} /> Library Categories ({courseCategoryData.length})
                      </h3>
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                        {courseCategoryData.map((cat, idx) => {
                          const percentage = allCourses.length > 0 ? (cat.Courses / allCourses.length) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-gray-700">
                                <span>{cat.name}</span>
                                <span>{cat.Courses} {cat.Courses === 1 ? 'course' : 'courses'}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {courseCategoryData.length === 0 && (
                          <div className="text-center py-10 text-gray-400 font-medium italic">No courses in database.</div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Leaderboards and Activities row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left: Gamified Leaderboard */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Award className="text-indigo-600" size={18} /> Top Performing Students
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                              <th className="pb-3">Rank</th>
                              <th className="pb-3">Student</th>
                              <th className="pb-3 text-center">Level</th>
                              <th className="pb-3 text-right">Cumulative XP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-xs">
                            {topLearners.map((learner, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 transition">
                                <td className="py-3 font-bold text-gray-500">
                                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                </td>
                                <td className="py-3">
                                  <div>
                                    <p className="font-bold text-gray-800">{learner.name}</p>
                                    <p className="text-[10px] text-gray-400">{learner.email}</p>
                                  </div>
                                </td>
                                <td className="py-3 text-center">
                                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-extrabold text-[10px] border border-blue-100">
                                    Lvl {learner.level}
                                  </span>
                                </td>
                                <td className="py-3 text-right font-black text-gray-800">{learner.xp.toLocaleString()} XP</td>
                              </tr>
                            ))}
                            {topLearners.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-400 font-medium italic">No students registered yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Recent Transactions Log */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <DollarSign className="text-green-600" size={18} /> Recent Enrollments
                      </h3>
                      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                        {recentTransactions.map((tx, idx) => (
                          <div key={tx.id || idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-50 bg-gray-50/20 hover:border-gray-100 transition">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{tx.courseTitle}</p>
                              <p className="text-[10px] text-gray-450 font-semibold">{tx.userName} ({tx.userEmail})</p>
                              <p className="text-[9px] text-gray-400">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${tx.amount > 0 ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-100 text-gray-600"}`}>
                                {tx.amount > 0 ? `₹${tx.amount}` : "Free"}
                              </span>
                            </div>
                          </div>
                        ))}
                        {recentTransactions.length === 0 && (
                          <div className="text-center py-10 text-gray-400 font-medium italic">No enrollments recorded yet.</div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* --- ACTION REQUIRED QUEUE TAB --- */}
              {activeTab === "actions-required" && (
                <div className="max-w-7xl mx-auto animate-fade-in bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span> Action Required Queue
                  </h2>

                  {pendingList.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
                      <h3 className="text-lg font-bold text-gray-700">All Caught Up!</h3>
                      <p className="text-gray-500 font-medium">No pending course approval or deletion requests at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingList.map(course => (
                        <div key={course._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition group">
                          <div
                            className="flex gap-5 items-center cursor-pointer hover:opacity-85 transition"
                            onClick={() => {
                              setPreviewCourse(course);
                              setExpandedLectures({ 0: true });
                            }}
                            title="Click to review course overview"
                          >
                            <img src={course.thumbnail} className="w-32 h-20 object-cover rounded-lg bg-gray-200 border border-gray-100 shadow-sm" alt="" />
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition">{course.title}</h3>
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
                            <button
                              onClick={() => {
                                setPreviewCourse(course);
                                setExpandedLectures({ 0: true });
                              }}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold transition"
                              title="Review complete course overview"
                            >
                              <Eye size={16} /> Review
                            </button>
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
              )}

              {/* --- SYSTEM MAINTENANCE & RESET TAB --- */}
              {activeTab === "maintenance" && (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-red-200 animate-fade-in space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 text-red-650">
                    <ShieldAlert size={28} className="text-red-600" />
                    <div>
                      <h2 className="text-xl font-black text-gray-800">Administrative System Maintenance</h2>
                      <p className="text-xs text-gray-400 font-semibold">DANGER ZONE &bull; HIGH CONTEXT AUTHORIZATION REQUIRED</p>
                    </div>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 p-5 rounded-xl space-y-3">
                    <h3 className="font-bold text-red-800 text-sm flex items-center gap-1.5"><AlertTriangle size={16} /> Irreversible Wipe Operation</h3>
                    <p className="text-xs text-gray-650 leading-relaxed font-medium">
                      Executing this utility will completely delete all records for <strong>learners</strong>, <strong>instructors</strong>, <strong>course blueprints</strong>, <strong>quizzes/exams</strong>, <strong>gamification history</strong>, and <strong>completion certificates</strong>. 
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-gray-600 pt-2">
                      <div className="bg-white p-3 rounded-lg border border-red-100/30">
                        <p className="text-red-750 font-bold uppercase tracking-wider mb-1">Items Purged:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Student roster & enrollments</li>
                          <li>Instructor bios & course catalogs</li>
                          <li>Quizzes, notes & course feedback</li>
                          <li>Level progression, XP, badges</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-red-100/30">
                        <p className="text-green-700 font-bold uppercase tracking-wider mb-1">Items Preserved:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Super Admin accounts</li>
                          <li>Contact/Inquiry logs</li>
                          <li>Asynchronous messaging history</li>
                          <li>Database schema models</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Verification checkbox */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <input 
                      type="checkbox"
                      id="reset-acknowledge"
                      checked={maintenanceChecked}
                      onChange={(e) => setMaintenanceChecked(e.target.checked)}
                      className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor="reset-acknowledge" className="text-xs text-gray-600 font-bold leading-normal select-none cursor-pointer">
                      I explicitly acknowledge that this action is irreversible, will wipe all course progression database documents, and cannot be reverted under any circumstances.
                    </label>
                  </div>

                  {/* Verification Voucher Display */}
                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex flex-col items-center space-y-4">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-gray-500 font-bold">Verification Authorization Code</p>
                      <p className="text-[10px] text-gray-400">Type the monospace code below to authorize this reset</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-white px-6 py-2.5 rounded-xl border border-gray-300 shadow-sm text-xl font-black font-mono tracking-widest text-red-600 select-none">
                        {generatedVerificationCode.split('').join(' ')}
                      </div>
                      <button 
                        onClick={() => {
                          setGeneratedVerificationCode(generateRandomCode());
                          setEnteredCode('');
                        }}
                        type="button"
                        className="p-2.5 bg-white border border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-500 rounded-xl shadow-sm transition"
                        title="Regenerate verification code"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>

                    <div className="w-full max-w-xs">
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="ENTER 6-DIGIT CODE"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                        className="w-full text-center px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 font-mono font-bold tracking-widest outline-none bg-white uppercase text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('dashboard');
                        setEnteredCode('');
                        setMaintenanceChecked(false);
                      }}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition text-sm cursor-pointer"
                    >
                      Cancel & Return
                    </button>
                    <button
                      onClick={handleDeleteStudentsInstructors}
                      disabled={!maintenanceChecked || enteredCode.trim().length !== 6}
                      className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer ${(!maintenanceChecked || enteredCode.trim().length !== 6) ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white hover:shadow-md"}`}
                    >
                      <Trash2 size={16} /> Reset User & Course Catalog
                    </button>
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
                            <span className="font-black text-gray-800">₹{course.price}</span>
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
                            <td className="p-5 text-center flex items-center justify-center gap-2">
                               <button
                                 onClick={() => setViewInstructor({ ...user, courses: myCourses })}
                                 className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-purple-500 hover:text-purple-600 text-gray-600 font-bold py-1.5 px-4 rounded-lg shadow-sm transition cursor-pointer"
                               >
                                 <BookOpen size={16} /> View Portfolio
                               </button>
                               <button
                                 onClick={() => setActiveChatUser(user)}
                                 className="relative inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-1.5 px-4 rounded-lg shadow-sm transition cursor-pointer"
                               >
                                 <MessageSquare size={16} /> Chat
                                 {getUnreadCountForUser(user._id) > 0 && (
                                   <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                                     {getUnreadCountForUser(user._id)}
                                   </span>
                                 )}
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
                            <p className="text-xs font-bold text-purple-600 uppercase mt-1">{course.category} • ₹{course.price}</p>
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
                      <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
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

          {/* 4. COURSE PREVIEW/OVERVIEW MODAL */}
          {previewCourse && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white shadow-md">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-blue-400/20">
                        {previewCourse.category || "General"}
                      </span>
                      {previewCourse.status === 'deletion_pending' ? (
                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-red-400/20">
                          Deletion Request
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/20">
                          Approval Request
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black mt-2 leading-snug">
                      {previewCourse.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Instructor: <span className="font-semibold text-gray-200">{previewCourse.instructorId?.name || "Unknown"}</span> ({previewCourse.instructorId?.email || "No email"})
                    </p>
                  </div>
                  <button onClick={() => setPreviewCourse(null)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition shrink-0 ml-4 cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Panel: Description & Objectives */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Description Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
                        <h3 className="font-bold text-gray-900 text-lg mb-3">Course Description</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                          {previewCourse.description}
                        </p>
                      </div>

                      {/* Learning Objectives Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Learning Objectives</h3>
                        {previewCourse.learningObjectives && previewCourse.learningObjectives.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {previewCourse.learningObjectives.map((obj, index) => (
                              <div key={index} className="flex items-start gap-2.5">
                                <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
                                <span className="text-gray-600 text-sm leading-relaxed font-medium">{obj}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No specific learning objectives listed.</p>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Specifications & Syllabus Checklist */}
                    <div className="space-y-6">
                      
                      {/* Quick Specifications Card */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/60 flex flex-col items-center">
                        <img
                          src={previewCourse.thumbnail}
                          className="w-full aspect-video object-cover rounded-xl bg-gray-100 border border-gray-200 shadow-sm mb-4"
                          alt="Course Thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                          }}
                        />
                        <div className="w-full space-y-3">
                          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Price</span>
                            <span className="font-black text-gray-900 text-base">{previewCourse.price === 0 ? <span className="text-green-600">Free</span> : `₹${previewCourse.price}`}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Duration</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1"><Clock size={14} className="text-blue-500" /> {previewCourse.duration} Hours</span>
                          </div>
                          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                            <span className="text-gray-500 font-medium">Level</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1"><Award size={14} className="text-purple-500" /> {previewCourse.level}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                              <p className="font-black text-blue-700 text-lg">
                                {previewCourse.lectures?.reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) || 0}
                              </p>
                              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Videos</p>
                            </div>
                            <div className="bg-green-50/50 p-2.5 rounded-xl border border-green-100/50">
                              <p className="font-black text-green-700 text-lg">
                                {previewCourse.lectures?.reduce((acc, sec) => acc + (sec.resources?.length || 0), 0) || 0}
                              </p>
                              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Files</p>
                            </div>
                            <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50">
                              <p className="font-black text-purple-700 text-lg">
                                {previewCourse.lectures?.reduce((acc, sec) => acc + (sec.links?.length || 0), 0) || 0}
                              </p>
                              <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Links</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Syllabus / Curriculum Card */}
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-150">
                          <h3 className="font-bold text-gray-900 text-sm">Course Curriculum</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{previewCourse.lectures?.length || 0} Modules / Sections</p>
                        </div>
                        <div className="max-h-[260px] overflow-y-auto p-2.5 space-y-2">
                          {previewCourse.lectures && previewCourse.lectures.length > 0 ? (
                            previewCourse.lectures.map((section, index) => {
                              const isExpanded = !!expandedLectures[index];
                              return (
                                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedLectures(prev => ({ ...prev, [index]: !isExpanded }))}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-55/40 transition text-left"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="w-5.5 h-5.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{index + 1}</span>
                                      <span className="font-bold text-gray-800 text-xs truncate">{section.title}</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                                  </button>
                                  {isExpanded && (
                                    <div className="px-3.5 pb-3 pt-1.5 border-t border-gray-50 bg-gray-50/20 space-y-2.5 text-[11px] max-h-[160px] overflow-y-auto">
                                      {/* Videos */}
                                      {section.videos && section.videos.length > 0 && (
                                        <div className="space-y-1">
                                          <p className="font-extrabold text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">Videos</p>
                                          {section.videos.map((vid, vIdx) => (
                                            <div key={vIdx} className="flex items-start gap-1.5 text-gray-650">
                                              <MonitorPlay size={10} className="text-blue-500 shrink-0 mt-0.5" />
                                              <span className="font-semibold line-clamp-1">{vid.title || `Video ${vIdx + 1}`}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Resources */}
                                      {section.resources && section.resources.length > 0 && (
                                        <div className="space-y-1">
                                          <p className="font-extrabold text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">Resources</p>
                                          {section.resources.map((res, rIdx) => (
                                            <div key={rIdx} className="flex items-start gap-1.5 text-gray-650">
                                              <FileText size={10} className="text-green-500 shrink-0 mt-0.5" />
                                              <span className="font-semibold line-clamp-1">{res.title || `Resource ${rIdx + 1}`}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Links */}
                                      {section.links && section.links.length > 0 && (
                                        <div className="space-y-1">
                                          <p className="font-extrabold text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">Links</p>
                                          {section.links.map((link, lIdx) => (
                                            <div key={lIdx} className="flex items-start gap-1.5 text-gray-650">
                                              <LinkIcon size={10} className="text-purple-500 shrink-0 mt-0.5" />
                                              <span className="font-semibold line-clamp-1">{link.title || `Link ${lIdx + 1}`}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {!section.videos?.length && !section.resources?.length && !section.links?.length && (
                                        <p className="text-gray-400 italic text-[10px]">No assets attached to this lecture.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-400 italic text-xs text-center py-4">No sections added to syllabus yet.</p>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Modal Footer / Actions Panel */}
                <div className="p-6 border-t border-gray-150 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-gray-500 font-semibold">
                    Status: <span className="font-extrabold capitalize text-gray-700">{previewCourse.status.replace("_", " ")}</span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewCourse(null)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition text-sm shadow-sm cursor-pointer"
                    >
                      Close Overview
                    </button>
                    {previewCourse.status === 'deletion_pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleAction(previewCourse, 'reject');
                            if (success) setPreviewCourse(null);
                          }}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition text-sm shadow-sm border border-gray-200 cursor-pointer"
                        >
                          Deny Deletion
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleAction(previewCourse, 'approve');
                            if (success) setPreviewCourse(null);
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-750 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm shadow-md cursor-pointer"
                        >
                          <Trash2 size={16} /> Delete Course
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleAction(previewCourse, 'reject');
                            if (success) setPreviewCourse(null);
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-bold transition text-sm border border-red-150 cursor-pointer animate-pulse-subtle"
                        >
                          <XCircle size={16} /> Reject Blueprint
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleAction(previewCourse, 'approve');
                            if (success) setPreviewCourse(null);
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition text-sm shadow-md shadow-green-200/50 cursor-pointer"
                        >
                          <CheckCircle size={16} /> Approve & Publish
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 5. CHAT MODAL */}
          <ChatModal
            isOpen={!!activeChatUser}
            onClose={() => setActiveChatUser(null)}
            currentUser={userInfo}
            otherUser={activeChatUser}
            onMessagesRead={fetchUnread}
          />

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;