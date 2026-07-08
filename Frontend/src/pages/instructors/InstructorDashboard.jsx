import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Plus, Clock, IndianRupee,
  Trash2, LogOut, Menu, X, LayoutDashboard, MessageSquare,
  ThumbsUp, ThumbsDown, User, Star
} from "lucide-react";
import axios from "axios";
import ChatModal from "../../components/ChatModal";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
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
  const [activeTab, setActiveTab] = useState("courses");
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
      const studentContacts = contactsRes.data.filter(c => c.user?.role === 'student');
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
              {activeTab === 'courses' ? 'My Course Arsenal' : activeTab === 'chats' ? 'Student Q&A Guidance' : 'Student Feedbacks'}
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