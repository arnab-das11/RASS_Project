import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, Star, User, MonitorPlay, CheckCircle2, ChevronDown, 
  FileText, Link as LinkIcon, Globe, Award, BarChart, 
  IndianRupee, ShoppingCart, Lock, ArrowRight, ShieldAlert
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({}); 
  
  // Enrollment State
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

  useEffect(() => {
    // 1. Check User Status
    const userInfoString = localStorage.getItem("userInfo");
    let currentUserId = null;
    
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        setUserRole(userInfo.role);
        currentUserId = userInfo._id;
    }

    // 2. Fetch Course Details
    const fetchCourseDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(data);
        
        // Open the first section of the syllabus by default
        if (data.lectures && data.lectures.length > 0) {
           setExpandedSections({ 0: true });
        }

        // 3. Check if this specific user is already enrolled
        if (currentUserId) {
            const userRes = await axios.get(`http://localhost:5000/api/users/${currentUserId}/enrolled`);
            // userRes.data is an array of populated courses
            const alreadyEnrolled = userRes.data.some(c => c._id === id);
            setIsEnrolled(alreadyEnrolled);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  // --- SMART ENROLLMENT LOGIC ---
  const handleEnrollClick = async () => {
    const userInfoString = localStorage.getItem("userInfo");
    
    // Scenario 1: Not logged in -> Redirect to Signup
    if (!userInfoString) {
        navigate("/learner-signup");
        return;
    }

    const userInfo = JSON.parse(userInfoString);

    // Scenario 2: Wrong Role -> Block action
    if (userInfo.role !== 'learner') {
        alert(`Access Denied: You are logged in as an ${userInfo.role.toUpperCase()}. Only Student accounts can enroll in courses.`);
        return;
    }

    // Scenario 3: Logged in Learner -> Process Enrollment
    setEnrollLoading(true);

    // 3.1: If free course, do direct enrollment
    if (!course.price || course.price === 0) {
      try {
          await axios.post('http://localhost:5000/api/users/enroll', {
              userId: userInfo._id,
              courseId: course._id
          });

          setIsEnrolled(true);
          navigate('/learner-dashboard'); 
      } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          alert("Enrollment Error: " + errorMsg);
      } finally {
          setEnrollLoading(false);
      }
      return;
    }

    // 3.2: Paid course, process Razorpay Checkout
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setEnrollLoading(false);
        return;
      }

      // Create Razorpay order
      const { data: order } = await axios.post('http://localhost:5000/api/payments/create-order', {
        amount: course.price
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: "LearnX",
        description: `Enrollment for ${course.title}`,
        image: course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post('http://localhost:5000/api/payments/verify-enroll', {
              userId: userInfo._id,
              courseId: course._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amountPaid: order.amount
            });

            alert(verifyData.message);
            setIsEnrolled(true);
            navigate('/learner-dashboard');
          } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            alert("Payment verification failed: " + errorMsg);
            setEnrollLoading(false);
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
            setEnrollLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay initiation error:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Failed to initialize payment: " + errorMsg);
      setEnrollLoading(false);
    }
  };

  const toggleSection = (index) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  
  const getTotalVideos = () => course?.lectures?.reduce((acc, sec) => acc + (sec.videos?.length || 0), 0) || 0;
  const getTotalResources = () => course?.lectures?.reduce((acc, sec) => acc + (sec.resources?.length || 0), 0) || 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* --- PREMIUM HERO SECTION --- */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center relative z-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                {course.category || "General"}
              </span>
              <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm bg-yellow-400/10 px-3 py-1 rounded-full">
                 4.8 <Star size={14} fill="currentColor" /> (Highly Rated)
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">{course.title}</h1>
            <p className="text-blue-100 text-lg md:text-xl line-clamp-2 max-w-2xl font-light">{course.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-2"><Clock size={18} className="text-blue-400" /> {course.duration ? `${course.duration} Hours` : "Self-paced"}</div>
              <div className="flex items-center gap-2"><BarChart size={18} className="text-blue-400" /> {course.level || "All Levels"}</div>
              <div className="flex items-center gap-2"><User size={18} className="text-blue-400" /> Taught by {course.instructorId?.name || "Expert Instructor"}</div>
            </div>

            <div className="flex items-center gap-6 pt-6">
                 <div className="text-4xl font-black text-white">
                    {course.price === 0 ? <span className="text-green-400 drop-shadow-md">Free</span> : <span className="flex items-center"><IndianRupee size={32}/> {course.price}</span>}
                 </div>
                 
                 {/* DYNAMIC BUTTON BASED ON ROLE AND ENROLLMENT */}
                 {userRole === 'admin' || userRole === 'instructor' ? (
                     <div className="flex items-center gap-2 bg-gray-800/80 text-gray-300 px-6 py-3 rounded-xl border border-gray-700 font-medium">
                         <ShieldAlert size={20}/> Admin/Instructor View
                     </div>
                 ) : isEnrolled ? (
                     <button onClick={() => navigate('/learner-dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                        Enter The Arena <ArrowRight size={20}/>
                     </button>
                 ) : (
                     <button onClick={handleEnrollClick} disabled={enrollLoading} className="bg-green-500 hover:bg-green-400 text-gray-900 px-10 py-4 rounded-xl font-black text-lg shadow-xl shadow-green-900/30 transition-all transform hover:-translate-y-1 flex items-center gap-3">
                        {enrollLoading ? "Forging Access..." : <><ShoppingCart size={22}/> Enroll Now</>}
                     </button>
                 )}
            </div>
          </div>

          <div className="w-full lg:w-5/12 max-w-md">
            <div className="bg-white p-3 rounded-3xl shadow-2xl transform lg:rotate-2 hover:rotate-0 transition duration-500">
              <img src={course.thumbnail || DEFAULT_IMAGE} alt={course.title} className="w-full aspect-video object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
        
        {/* LEFT COLUMN: Details & What You'll Learn */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* SYNCED: What You'll Learn Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-6">What you'll learn</h3>
            {course.learningObjectives && course.learningObjectives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.learningObjectives.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20}/>
                            <span className="text-gray-600 leading-relaxed font-medium">{point}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">Objectives will be updated shortly by the instructor.</p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Course Overview</h3>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg font-light">
                {course.description}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Locked Syllabus & Features */}
        <div className="space-y-8 h-fit lg:sticky top-10">
          
          {/* THE LOCKED SYLLABUS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-gray-100">
                <h3 className="font-black text-xl text-gray-900">Course Curriculum</h3>
                <p className="text-sm text-gray-500 mt-1">Enroll to unlock all materials</p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
              {course.lectures && course.lectures.length > 0 ? (
                course.lectures.map((section, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-xl transition text-left border border-transparent hover:border-gray-200">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{index + 1}</div>
                          <span className="font-bold text-gray-800 line-clamp-1">{section.title}</span>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSections[index] && (
                      <div className="pl-14 pr-4 pb-4 pt-1 space-y-3 animate-fade-in">
                        
                        {/* Tease Videos */}
                        {section.videos && section.videos.map((vid, vIdx) => (
                          <div key={`v-${vIdx}`} className="flex items-center justify-between text-gray-500">
                             <div className="flex items-center gap-3">
                                 <MonitorPlay size={16}/>
                                 <span className="text-sm font-medium">{vid.title || `Video Lesson ${vIdx+1}`}</span>
                             </div>
                             {/* THE LOCK ICON */}
                             <Lock size={14} className="text-slate-300"/>
                          </div>
                        ))}

                        {/* Tease Resources */}
                        {section.resources && section.resources.map((res, rIdx) => (
                          <div key={`r-${rIdx}`} className="flex items-center justify-between text-gray-500">
                             <div className="flex items-center gap-3">
                                 <FileText size={16}/>
                                 <span className="text-sm font-medium">{res.title || "Downloadable Resource"}</span>
                             </div>
                             <Lock size={14} className="text-slate-300"/>
                          </div>
                        ))}

                        {/* Tease Links */}
                        {section.links && section.links.map((link, lIdx) => (
                          <div key={`l-${lIdx}`} className="flex items-center justify-between text-gray-500">
                             <div className="flex items-center gap-3">
                                 <LinkIcon size={16}/>
                                 <span className="text-sm font-medium">{link.title || "External Reading"}</span>
                             </div>
                             <Lock size={14} className="text-slate-300"/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">Syllabus is being prepared.</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h4 className="font-black text-gray-900 mb-6 text-xl">This course includes:</h4>
            <ul className="space-y-5 text-gray-600 font-medium">
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><MonitorPlay size={20} /></div> <span>{getTotalVideos()} On-demand Videos</span></li>
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><FileText size={20} /></div> <span>{getTotalResources()} Downloadable Resources</span></li>
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><Globe size={20} /></div> <span>Full Lifetime Access</span></li>
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600"><Award size={20} /></div> <span>Certificate of Completion</span></li>
            </ul>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetailsPage;