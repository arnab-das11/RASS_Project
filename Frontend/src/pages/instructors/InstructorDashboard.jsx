import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Plus, Clock, IndianRupee,
  Trash2, LogOut, Menu, X, LayoutDashboard, MessageSquare,
  ThumbsUp, ThumbsDown, User, Star, TrendingUp, Users, Award, Percent
} from "lucide-react";
import axios from "axios";
import ChatModal from "../../components/ChatModal";
// --- NEW: IMPORT RECHARTS ---
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  
  // Chatting / Admin / Contacts States
  const [adminUser, setAdminUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [chatContacts, setChatContacts] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Reviews State
  const [feedbacks, setFeedbacks] = useState([]);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUnread = async (instId) => {
    try {
      const unreadRes = await axios.get(`http://localhost:5000/api/messages/unread/${instId}`);
      setUnreadMessages(unreadRes.data);
    } catch (e) {
      console.error("Error updating unread messages count:", e);
    }
  };

  const fetchContacts = async (instId) => {
    try {
      const contactsRes = await axios.get(`http://localhost:5000/api/messages/contacts/${instId}`);
      // Filter contacts to show students who have engaged
      const studentContacts = contactsRes.data.filter(c => c.user?.role === 'learner');
      setChatContacts(studentContacts);
    } catch (e) {
      console.error("Error fetching chat contacts:", e);
    }
  };

  const fetchFeedbacks = async (instId) => {
    try {
      const feedbackRes = await axios.get(`http://localhost:5000/api/feedback/instructor/${instId}`);
      setFeedbacks(feedbackRes.data);
    } catch (e) {
      console.error("Error fetching feedbacks:", e);
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
        const [approvedRes, pendingRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/courses'),
          axios.get('http://localhost:5000/api/courses/pending'),
          axios.get('http://localhost:5000/api/users')
        ]);

        const allFetched = [...approvedRes.data, ...pendingRes.data];

        const filtered = allFetched.filter(c => {
          const instId = c.instructorId?._id || c.instructorId;
          return instId === user._id;
        });

        const uniqueCourses = Array.from(new Map(filtered.map(item => [item._id, item])).values());
        setMyCourses(uniqueCourses);
        setAllUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching instructor courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminAndInitialData = async () => {
      try {
        // Fetch Admin user
        const adminRes = await axios.get('http://localhost:5000/api/messages/admins');
        if (adminRes.data && adminRes.data.length > 0) {
          setAdminUser(adminRes.data[0]);
        }
        
        fetchUnread(user._id);
        fetchContacts(user._id);
        fetchFeedbacks(user._id);
      } catch (error) {
        console.error("Error fetching message/admin details:", error);
      }
    };

    fetchInstructorData();
    fetchAdminAndInitialData();

    const interval = setInterval(() => {
      fetchUnread(user._id);
      fetchContacts(user._id);
      fetchFeedbacks(user._id);
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

  // Unread messages from Supreme Leader (Admin)
  const getAdminUnreadCount = () => {
    if (!adminUser?._id) return 0;
    return unreadMessages.filter(msg => msg.sender?._id === adminUser._id || msg.sender === adminUser._id).length;
  };

  // Unread messages from students
  const getStudentUnreadCount = () => {
    if (!adminUser?._id) return unreadMessages.length;
    return unreadMessages.filter(msg => {
      const senderId = msg.sender?._id || msg.sender;
      return senderId !== adminUser._id;
    }).length;
  };

  const handleContactAdmin = () => {
    if (!adminUser) {
      alert("The Administrator (Supreme Leader) account is not active or registered in the database yet.");
      return;
    }
    setActiveChatUser(adminUser);
    setIsChatOpen(true);
  };

  const handleChatStudent = (student) => {
    setActiveChatUser(student);
    setIsChatOpen(true);
  };

  // Reviews Analytics
  const totalReviews = feedbacks.length;
  const likedReviews = feedbacks.filter(f => f.liked).length;
  const dislikedReviews = totalReviews - likedReviews;
  const likeRatio = totalReviews > 0 ? Math.round((likedReviews / totalReviews) * 100) : 100;

  // --- INSTRUCTOR ANALYTICS & DATA COMPILATION ---
  
  // 1. Instructor Course IDs set
  const myCourseIds = myCourses.map(c => c._id);

  // 2. Filter students enrolled in this instructor's courses
  const enrolledStudents = allUsers.filter(user => {
    if (user.role !== 'learner' || !user.enrolledCourses) return false;
    return user.enrolledCourses.some(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      return myCourseIds.includes(courseId);
    });
  });

  // 3. Total Enrollments Count
  let totalEnrollments = 0;
  enrolledStudents.forEach(user => {
    user.enrolledCourses.forEach(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      if (myCourseIds.includes(courseId)) {
        totalEnrollments++;
      }
    });
  });

  // 4. Instructor Revenue (₹)
  let totalRevenuePaise = 0;
  enrolledStudents.forEach(user => {
    user.enrolledCourses.forEach(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      if (myCourseIds.includes(courseId)) {
        if (enroll.purchaseDetails && enroll.purchaseDetails.amountPaid) {
          totalRevenuePaise += Number(enroll.purchaseDetails.amountPaid);
        }
      }
    });
  });
  const totalRevenueRupees = totalRevenuePaise / 100;

  // 5. Course Graduates
  let totalGraduates = 0;
  enrolledStudents.forEach(user => {
    if (user.passedExams && Array.isArray(user.passedExams)) {
      user.passedExams.forEach(examCourseId => {
        if (myCourseIds.includes(examCourseId)) {
          totalGraduates++;
        }
      });
    }
  });

  // 6. Course Performance Roster (Students list with progression metrics)
  const studentProgressionList = [];
  enrolledStudents.forEach(user => {
    user.enrolledCourses.forEach(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      if (myCourseIds.includes(courseId)) {
        const course = myCourses.find(c => c._id === courseId);
        if (!course) return;

        // Calculate progress percentage
        // Total contents in course = sum of videos, resources, links in all sections
        let totalItems = 0;
        if (course.lectures) {
          course.lectures.forEach(lecture => {
            totalItems += (lecture.videos?.length || 0) + (lecture.resources?.length || 0) + (lecture.links?.length || 0);
          });
        }

        // Count completed contents belonging to this course
        let completedItems = 0;
        if (course.lectures && user.completedContent) {
          course.lectures.forEach(lecture => {
            if (lecture.videos) {
              lecture.videos.forEach(v => {
                if (user.completedContent.includes(v._id) || user.completedContent.includes(v.videoUrl)) {
                  completedItems++;
                }
              });
            }
            if (lecture.resources) {
              lecture.resources.forEach(r => {
                if (user.completedContent.includes(r._id) || user.completedContent.includes(r.url)) {
                  completedItems++;
                }
              });
            }
            if (lecture.links) {
              lecture.links.forEach(l => {
                if (user.completedContent.includes(l._id) || user.completedContent.includes(l.url)) {
                  completedItems++;
                }
              });
            }
          });
        }

        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        studentProgressionList.push({
          studentId: user._id,
          studentName: user.name,
          studentEmail: user.email,
          courseId: course._id,
          courseTitle: course.title,
          progressPercent: Math.min(percentage, 100),
          enrolledAt: enroll.purchaseDetails?.enrollmentDate ? new Date(enroll.purchaseDetails.enrollmentDate).toLocaleDateString() : new Date(user.createdAt || Date.now()).toLocaleDateString()
        });
      }
    });
  });

  // Sort roster by progress percent descending
  studentProgressionList.sort((a, b) => b.progressPercent - a.progressPercent);

  // 7. Course Enrollment Distribution Data (BarChart)
  const courseEnrollmentCounts = myCourses.reduce((acc, course) => {
    acc[course._id] = 0;
    return acc;
  }, {});

  enrolledStudents.forEach(user => {
    user.enrolledCourses.forEach(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      if (courseEnrollmentCounts[courseId] !== undefined) {
        courseEnrollmentCounts[courseId]++;
      }
    });
  });

  const coursePerformanceData = myCourses.map(course => ({
    title: course.title,
    Students: courseEnrollmentCounts[course._id] || 0
  }))
  .sort((a, b) => b.Students - a.Students);

  // 8. Revenue per Course Data (BarChart)
  const courseRevenueCounts = myCourses.reduce((acc, course) => {
    acc[course._id] = 0;
    return acc;
  }, {});

  enrolledStudents.forEach(user => {
    user.enrolledCourses.forEach(enroll => {
      const courseId = enroll._id || enroll.courseId?._id || enroll.courseId;
      if (courseRevenueCounts[courseId] !== undefined) {
        if (enroll.purchaseDetails && enroll.purchaseDetails.amountPaid) {
          courseRevenueCounts[courseId] += Number(enroll.purchaseDetails.amountPaid) / 100;
        }
      }
    });
  });

  const courseRevenueData = myCourses.map(course => ({
    title: course.title,
    Revenue: courseRevenueCounts[course._id] || 0
  }))
  .sort((a, b) => b.Revenue - a.Revenue);

  // 9. Feedback Sentiment Data (PieChart)
  const feedbackSentimentData = [
    { name: 'Endorsed', value: likedReviews },
    { name: 'Disliked', value: dislikedReviews }
  ];
  const SENTIMENT_COLORS = ['#10b981', '#ef4444'];

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
          {/* Tab item: Overview & Analytics */}
          <button
            onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} /> <span>Overview & Analytics</span>
          </button>

          {/* Tab item: My Arsenal */}
          <button
            onClick={() => { setActiveTab("courses"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === "courses"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BookOpen size={20} /> <span>My Course Arsenal</span>
          </button>

          {/* Tab item: Student Chats */}
          <button
            onClick={() => { setActiveTab("chats"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer relative ${
              activeTab === "chats"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MessageSquare size={20} /> <span>Student Chats</span>
            {getStudentUnreadCount() > 0 && (
              <span className="absolute right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md" />
            )}
          </button>

          {/* Tab item: Course Reviews */}
          <button
            onClick={() => { setActiveTab("reviews"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === "reviews"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Star size={20} /> <span>Course Reviews</span>
          </button>

          {/* Option: Contact Supreme Leader */}
          <button
            onClick={handleContactAdmin}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold text-slate-400 hover:bg-slate-800 hover:text-white relative cursor-pointer"
          >
            <User size={20} /> 
            <span className="flex-1 text-left">Contact Supreme Leader</span>
            {getAdminUnreadCount() > 0 && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md" title={`${getAdminUnreadCount()} unread messages`} />
            )}
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition font-semibold cursor-pointer"
        >
          <LogOut size={20} /> Portal Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 hover:text-indigo-650 transition" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Overview & Analytics' : activeTab === 'courses' ? 'My Course Arsenal' : activeTab === 'chats' ? 'Student Q&A Guidance' : 'Student Feedbacks'}
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
            
            {/* VIEW: OVERVIEW & ANALYTICS */}
            {activeTab === "dashboard" && (
              <div className="space-y-10">
                {/* Header Title */}
                <div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 tracking-tight mb-2">Performance Analytics</h2>
                  <p className="text-slate-500 font-semibold">Real-time statistics of your student catalog, course ratings, and platform earnings.</p>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Total Revenue */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                      <h3 className="text-3xl font-black text-slate-800">₹{totalRevenueRupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
                      <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                        <TrendingUp size={10} /> Platform Earnings
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><IndianRupee size={26} /></div>
                  </div>

                  {/* Card 2: Total Students */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
                      <h3 className="text-3xl font-black text-slate-800">{totalEnrollments}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Cumulative enrollments</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Users size={26} /></div>
                  </div>

                  {/* Card 3: Positive Feedback Ratio */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Rate</p>
                      <h3 className="text-3xl font-black text-slate-800">{likeRatio}%</h3>
                      <p className="text-[10px] text-emerald-555 font-semibold text-emerald-600 flex items-center gap-1">
                        <ThumbsUp size={10} /> Positive Feedbacks
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><Star size={26} /></div>
                  </div>

                  {/* Card 4: Course Graduates */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:shadow-md transition">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graduated Students</p>
                      <h3 className="text-3xl font-black text-slate-800">{totalGraduates}</h3>
                      <p className="text-[10px] text-indigo-500 font-semibold">Passed Exam bluepritns</p>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500"><Award size={26} /></div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart 1: Course Enrollment comparison */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Users className="text-blue-500" size={18} /> Student Enrollments by Course
                    </h3>
                    {coursePerformanceData.length === 0 ? (
                      <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium italic">No course blueprint statistics registered yet.</div>
                    ) : (
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={coursePerformanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                              dataKey="title" 
                              tick={{ fontSize: 9, fill: '#64748B' }} 
                              axisLine={false} 
                              tickLine={false} 
                              tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} cursor={{ fill: '#F8FAFC' }} />
                            <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Feedback Sentiment distribution */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col justify-between">
                    <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Star className="text-emerald-500" size={18} /> Student Sentiment Breakdown
                    </h3>
                    {totalReviews === 0 ? (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 font-medium italic">No feedbacks logged yet.</div>
                    ) : (
                      <>
                        <div className="h-[180px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={feedbackSentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {feedbackSentimentData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 text-xs font-semibold pt-4">
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> Endorsed ({likedReviews})</span>
                          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Disliked ({dislikedReviews})</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chart 3: Revenue comparison */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 lg:col-span-3">
                    <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <IndianRupee className="text-green-500" size={18} /> Revenue Share by Course (₹)
                    </h3>
                    {courseRevenueData.length === 0 ? (
                      <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium italic">No course earnings data recorded yet.</div>
                    ) : (
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={courseRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                              dataKey="title" 
                              tick={{ fontSize: 9, fill: '#64748B' }} 
                              axisLine={false} 
                              tickLine={false}
                              tickFormatter={(val) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} cursor={{ fill: '#F8FAFC' }} />
                            <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Progression roster list */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Award className="text-indigo-650" size={18} /> Student Progress Roster
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                          <th className="pb-3">Student Name</th>
                          <th className="pb-3">Course Blueprint</th>
                          <th className="pb-3">Enrolled Date</th>
                          <th className="pb-3 text-right">Progression completion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                        {studentProgressionList.map((roster, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition">
                            <td className="py-4">
                              <div>
                                <p className="font-bold text-slate-850">{roster.studentName}</p>
                                <p className="text-[10px] text-slate-400">{roster.studentEmail}</p>
                              </div>
                            </td>
                            <td className="py-4 font-semibold text-slate-800">{roster.courseTitle}</td>
                            <td className="py-4 text-slate-400 font-semibold">{roster.enrolledAt}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <div className="w-24 bg-slate-100 rounded-full h-1.5 inline-block">
                                  <div 
                                    className={`h-1.5 rounded-full ${roster.progressPercent === 100 ? "bg-green-500" : "bg-indigo-600"}`} 
                                    style={{ width: `${roster.progressPercent}%` }} 
                                  />
                                </div>
                                <span className={`font-black w-8 inline-block text-right ${roster.progressPercent === 100 ? "text-green-600" : "text-slate-800"}`}>
                                  {roster.progressPercent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {studentProgressionList.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-slate-400 font-medium italic">No students are actively learning your courses yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW A: COURSES BLUEPRINTS */}
            {activeTab === "courses" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 tracking-tight mb-2">My Course Blueprints</h2>
                    <p className="text-slate-500 font-semibold">Manage your published and pending courses.</p>
                  </div>
                  <button onClick={() => navigate('/instructor-course')} className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-505 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer">
                    <Plus size={20} /> Forge New Course
                  </button>
                </div>

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
                          <div className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-lg border bg-white/80">
                            {course.status === 'approved' && <span className="text-green-605 text-green-600 border-green-600/30 flex items-center gap-1"><Clock size={14} /> Active</span>}
                            {course.status === 'pending' && <span className="text-amber-605 text-amber-600 border-amber-600/30 flex items-center gap-1"><Clock size={14} /> Pending Review</span>}
                            {course.status === 'deletion_pending' && <span className="text-red-650 border-red-650/30 flex items-center gap-1"><Clock size={14} /> Deleting</span>}
                            {course.status === 'rejected' && <span className="text-red-700 border-red-700/30 flex items-center gap-1"><Clock size={14} /> Rejected</span>}
                          </div>
                        </div>

                        {/* Content details */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                          <div className="flex gap-4 text-xs font-bold text-slate-500 mb-6">
                            <span className="flex items-center gap-1"><Clock size={14} className="text-indigo-500" /> {course.duration}h</span>
                            <span className="flex items-center gap-1"><IndianRupee size={14} className="text-emerald-600" /> {course.price}</span>
                          </div>

                          <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-5">
                            <span className="text-xs text-slate-400 uppercase font-black tracking-wider">{course.category}</span>
                            <div className="flex gap-2">
                              {course.status === 'approved' && (
                                <button onClick={() => handleRequestDelete(course._id)} className="p-2 bg-red-50 text-red-655 hover:bg-red-600 hover:text-white rounded-lg transition border border-red-200/40 cursor-pointer" title="Request Deletion">
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
            )}

            {/* VIEW B: STUDENT CHATS / Q&A GUIDANCE */}
            {activeTab === "chats" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight mb-2">Student Guidance Q&A</h2>
                  <p className="text-slate-500 font-semibold font-semibold">Answer students who get stuck and guide them with voice/text notes.</p>
                </div>

                {chatContacts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl">
                    <MessageSquare className="mx-auto w-16 h-16 text-indigo-500/35 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-805 mb-2">No student queries yet.</h3>
                    <p className="text-slate-500 max-w-md mx-auto font-medium">When students open the Guidance tab inside your courses, they can send chat messages or audio clips here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
                    {chatContacts.map(contact => {
                      const unreadFromStudent = unreadMessages.filter(msg => msg.sender?._id === contact.user._id || msg.sender === contact.user._id).length;
                      return (
                        <div key={contact.user._id} className="p-6 hover:bg-slate-50/50 transition duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            {contact.user.profilePicture ? (
                              <img src={contact.user.profilePicture} alt={contact.user.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                                {contact.user.name?.charAt(0) || "S"}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800 text-sm tracking-tight">{contact.user.name}</h4>
                                {unreadFromStudent > 0 && (
                                  <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                    {unreadFromStudent} New Query
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-semibold">{contact.user.email}</p>
                              <p className="text-xs text-slate-500 mt-1 italic max-w-[350px] truncate">
                                <strong>Last Msg: </strong> {contact.voice ? "🎙️ Audio Message" : contact.lastMessage}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleChatStudent(contact.user)}
                            className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-650 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition shadow-sm border border-indigo-100 hover:border-transparent cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare size={14} /> Guide Student
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: COURSE REVIEWS / FEEDBACKS */}
            {activeTab === "reviews" && (
              <div>
                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
                    <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider block mb-1">Total Feedbacks Received</span>
                    <h3 className="text-3xl font-black text-slate-800">{totalReviews}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
                    <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider block mb-1">Feedback Endorsement Rate</span>
                    <h3 className="text-3xl font-black text-green-600">{likeRatio}% Positive</h3>
                    
                    {/* Animated Analytics Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 border border-slate-200">
                      <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${likeRatio}%` }} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider block mb-1">Likes / Dislikes</span>
                      <div className="flex gap-4 items-center">
                        <span className="text-xl font-bold text-green-600 flex items-center gap-1">
                          <ThumbsUp size={16} className="fill-green-600" /> {likedReviews}
                        </span>
                        <span className="text-xl font-bold text-red-550 text-red-650 flex items-center gap-1">
                          <ThumbsDown size={16} className="fill-red-600" /> {dislikedReviews}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl">
                    <Star className="mx-auto w-16 h-16 text-indigo-500/35 mb-4 fill-indigo-500/10" />
                    <h3 className="text-2xl font-bold text-slate-805 mb-2">No reviews logged.</h3>
                    <p className="text-slate-500 max-w-md mx-auto font-medium">When students finish reviewing your courses or dictate suggestions, they will display here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {feedbacks.map(review => (
                      <div key={review._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition">
                        
                        <div>
                          {/* Course header */}
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                            <img src={review.courseId?.thumbnail} alt={review.courseId?.title} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                            <h4 className="font-bold text-xs text-slate-700 truncate max-w-[200px]" title={review.courseId?.title}>
                              {review.courseId?.title}
                            </h4>
                          </div>

                          <div className="flex justify-between items-start mb-4 gap-2">
                            <div className="flex items-center gap-2">
                              {review.studentId?.profilePicture ? (
                                <img src={review.studentId.profilePicture} alt={review.studentId.name} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                  {review.studentId?.name?.charAt(0) || "S"}
                                </div>
                              )}
                              <div>
                                <h5 className="font-bold text-xs text-slate-800 leading-none">{review.studentId?.name || "Student"}</h5>
                                <span className="text-[9px] text-slate-400 font-semibold">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border ${
                              review.liked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {review.liked ? <ThumbsUp size={10} className="fill-green-600" /> : <ThumbsDown size={10} className="fill-red-600" />}
                              {review.liked ? 'Endorsed' : 'Disliked'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                            {review.text}
                          </p>
                        </div>

                        {review.voiceUrl && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <span className="text-[9px] text-indigo-600 font-black uppercase tracking-wider block">🎙️ Audio Suggestion Playback</span>
                            <audio src={review.voiceUrl} controls className="w-full" style={{ height: '32px' }} />
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
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
        otherUser={activeChatUser}
        onMessagesRead={() => userInfo && fetchUnread(userInfo._id)}
      />

    </div>
  );
};

export default InstructorDashboard;