import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, PlayCircle, MonitorPlay, ChevronDown, CheckCircle, 
  ArrowLeft, Loader, FileText, Link as LinkIcon, ExternalLink, 
  Award, Home, Download, Trash2, Trophy, Undo, Sparkles, Brain, XCircle
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import { CERT_TEMPLATE_BASE64 } from '../../assets/certificateTemplate';

const LearnerDashboard = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // View Controllers
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [activeContent, setActiveContent] = useState(null); 
  const [expandedSections, setExpandedSections] = useState({});
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  // Celebration & Certificate State
  const [showTrophy, setShowTrophy] = useState(false);
  const [completedCourseName, setCompletedCourseName] = useState("");
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  // --- 🧠 AI QUIZ STATE ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState("");
  const [quizResult, setQuizResult] = useState(null); // 'correct', 'incorrect', null
  const [pendingCompletionId, setPendingCompletionId] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const userInfoString = localStorage.getItem("userInfo");
        if (!userInfoString) return navigate("/learner-signup");
        
        const user = JSON.parse(userInfoString);
        setUserInfo(user);
        
        const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}/enrolled`);
        const userRes = await axios.get('http://localhost:5000/api/users'); 
        const currentUser = userRes.data.find(u => u._id === user._id);
        
        setEnrolledCourses(data);
        if (currentUser && currentUser.completedContent) {
            setCompletedItems(currentUser.completedContent);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [navigate]);

  // --- HELPER FUNCTIONS ---
  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    if (course.lectures && course.lectures.length > 0) {
        setExpandedSections({ 0: true });
        const firstSec = course.lectures[0];
        if (firstSec.videos?.length > 0) setActiveContent({ type: 'video', data: firstSec.videos[0] });
        else if (firstSec.resources?.length > 0) setActiveContent({ type: 'resource', data: firstSec.resources[0] });
        else if (firstSec.links?.length > 0) setActiveContent({ type: 'link', data: firstSec.links[0] });
    }
  };

  const toggleSection = (index) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));

  // --- FILE DOWNLOADER ---
  const getCloudinaryRawUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/image/upload/", "/raw/upload/");
  };

  const handleResourceDownload = async (resourceUrl, filename, resourceId) => {
    setDownloadingFileId(resourceId);
    const fixedUrl = getCloudinaryRawUrl(resourceUrl);
    try {
      const response = await fetch(fixedUrl);
      if (!response.ok) throw new Error("Network error");
      const blob = await response.blob();
      const typedBlob = new Blob([blob], { type: blob.type || "application/pdf" });
      const blobUrl = window.URL.createObjectURL(typedBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "resource";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(fixedUrl, "_blank");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleUnenroll = async (courseId, e) => {
      e.stopPropagation();
      if(!window.confirm("Are you sure you want to drop this course? Your progress will be saved but the course will be removed from your dashboard.")) return;
      try {
          await axios.post('http://localhost:5000/api/users/unenroll', { userId: userInfo._id, courseId });
          setEnrolledCourses(prev => prev.filter(c => c._id !== courseId));
      } catch (error) { alert("Failed to unenroll."); }
  };

  // --- PROGRESS LOGIC ---
  const calculateProgress = (course, currentCompleted = completedItems) => {
    if (!course.lectures) return 0;
    let totalItems = 0;
    let finishedItems = 0;

    course.lectures.forEach(sec => {
        const items = [...(sec.videos||[]), ...(sec.resources||[]), ...(sec.links||[])];
        totalItems += items.length;
        items.forEach(item => {
            if (currentCompleted.includes(item._id)) finishedItems++;
        });
    });
    return totalItems === 0 ? 0 : Math.round((finishedItems / totalItems) * 100);
  };

  // --- 🧠 AI QUIZ LOGIC INTERCEPTOR ---
  const handleToggleComplete = async () => {
    if (!activeContent || !activeContent.data._id) return;
    
    const contentId = activeContent.data._id;
    const isCurrentlyDone = completedItems.includes(contentId);
    
    // IF UNMARKING: Do it directly without a quiz
    if (isCurrentlyDone) {
        setProgressLoading(true);
        const newCompletedList = completedItems.filter(id => id !== contentId);
        setCompletedItems(newCompletedList);
        try {
            const { data } = await axios.put('http://localhost:5000/api/users/progress', {
                userId: userInfo._id, contentId: contentId
            });
            setCompletedItems(data.completedContent);
        } catch (error) { console.error("Failed to update progress", error); } 
        finally { setProgressLoading(false); }
        return;
    }

    // IF MARKING DONE: Trigger the AI Quiz
    setPendingCompletionId(contentId);
    setShowQuizModal(true);
    setQuizLoading(true);
    setQuizData(null);
    setQuizResult(null);
    setQuizSelectedOption("");

    try {
        const response = await axios.post('http://localhost:5000/api/ai/generate-quiz', {
            courseTitle: selectedCourse.title,
            lectureTitle: activeContent.data.title
        });
        setQuizData(response.data);
    } catch (error) {
        console.error("AI Quiz failed to load, skipping...", error);
        // Fallback: If AI fails, let them complete the video anyway so they don't get stuck
        executeCompletion(contentId);
        setShowQuizModal(false);
    } finally {
        setQuizLoading(false);
    }
  };

  // --- THE ACTUAL COMPLETION EXECUTION ---
  const executeCompletion = async (contentId) => {
    setProgressLoading(true);
    const newCompletedList = [...completedItems, contentId];
    setCompletedItems(newCompletedList);

    const newProgress = calculateProgress(selectedCourse, newCompletedList);
    if (newProgress === 100) {
        setCompletedCourseName(selectedCourse.title);
        setShowTrophy(true);
    }

    try {
        const { data } = await axios.put('http://localhost:5000/api/users/progress', {
            userId: userInfo._id, contentId: contentId
        });
        setCompletedItems(data.completedContent);
    } catch (error) { console.error("Failed to update progress", error); } 
    finally { setProgressLoading(false); }
  };

  const handleQuizSubmit = () => {
      if (!quizSelectedOption) return;
      
      if (quizSelectedOption === quizData.correctAnswer) {
          setQuizResult('correct');
          setTimeout(() => {
              setShowQuizModal(false);
              executeCompletion(pendingCompletionId);
          }, 1500); // Give them 1.5s to see the green success state before closing
      } else {
          setQuizResult('incorrect');
      }
  };


  // --- 🌟 CUSTOM NATIVE CERTIFICATE GENERATOR 🌟 ---
  const generateCertificatePDF = () => {
    setIsGeneratingCert(true);
    try {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        if (CERT_TEMPLATE_BASE64) {
            doc.addImage(CERT_TEMPLATE_BASE64, 'PNG', 0, 0, 297, 210);
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50); 
        doc.text("This is to certify that", 148.5, 75, { align: "center" });

        doc.setFontSize(36);
        doc.setFont("times", "normal"); 
        doc.setTextColor(44, 133, 111);
        doc.text(userInfo?.name || "Student Name", 148.5, 92, { align: "center" });

        doc.setLineWidth(0.5);
        doc.setDrawColor(44, 133, 111);
        doc.line(70, 96, 227, 96);
        doc.circle(70, 96, 1, 'F'); 
        doc.circle(227, 96, 1, 'F');

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const paragraph = `has successfully completed a professional training program in "${completedCourseName}".\nTheir dedication and commitment to the learning process are truly commendable.`;
        doc.text(paragraph, 148.5, 115, { align: "center", lineHeightFactor: 1.5 });

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Awarded on ${issueDate}`, 148.5, 140, { align: "center" });

        const signatories = [
            { name: "Arnab Das", title: "Lead System Architect", x: 45 },
            { name: "Rishav Biswas", title: "Full-Stack Developer", x: 114 },
            { name: "Soumyadeep B. Dewan", title: "UI/UX Strategist", x: 183 }, 
            { name: "Sahitya Sk", title: "Backend Engineer", x: 252 },
        ];

        signatories.forEach(signatory => {
            doc.setFont("times", "italic");
            doc.setFontSize(18);
            doc.setTextColor(30, 40, 70); 
            doc.text(signatory.name, signatory.x - 2, 172, { align: "center" });

            doc.setLineWidth(0.3);
            doc.setDrawColor(180, 180, 180);
            doc.line(signatory.x - 25, 178, signatory.x + 25, 178);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(44, 133, 111); 
            doc.text(signatory.name.toUpperCase(), signatory.x, 184, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(signatory.title, signatory.x, 189, { align: "center" });
        });

        doc.save(`${completedCourseName.replace(/\s+/g, '_')}_Certificate.pdf`);
        setShowTrophy(false);
    } catch (error) {
        console.error("Certificate Generation Error:", error);
        alert("Failed to generate certificate.");
    } finally {
        setIsGeneratingCert(false);
    }
  };

  // --- DYNAMIC CONTENT WINDOW ---
  const renderActiveContent = () => {
    if (!activeContent) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a lesson from the curriculum to begin.</p>
            </div>
        );
    }

    if (activeContent.type === 'video') {
        return <video src={activeContent.data.videoUrl} controls autoPlay className="w-full h-full object-contain" />;
    }

    if (activeContent.type === 'resource') {
        const url = activeContent.data.url;
        const extMatch = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';
        const unsupportedTypes = ['zip', 'rar', '7z', 'tar', 'exe', 'xls', 'xlsx', 'csv'];
        const isUnsupported = unsupportedTypes.includes(ext);

        if (isUnsupported) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
                    <FileText className="w-20 h-20 text-emerald-500 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">{activeContent.data.title}</h3>
                    <p className="text-gray-400 mb-8 max-w-md">This file format (<strong>.{ext.toUpperCase()}</strong>) cannot be viewed directly in the browser.</p>
                    <button 
                       onClick={() => handleResourceDownload(url, activeContent.data.title, activeContent.data._id)}
                       className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-900/30"
                    >
                       {downloadingFileId === activeContent.data._id ? <Loader className="animate-spin"/> : <Download size={18} />}
                       Download File
                    </button>
                </div>
            );
        }

        const docUrl = encodeURIComponent(url.replace("/image/upload/", "/raw/upload/"));
        return (
            <div className="w-full h-full flex flex-col bg-slate-900">
                <div className="p-3 flex justify-end bg-slate-950 border-b border-slate-800">
                    <button 
                        onClick={() => handleResourceDownload(url, activeContent.data.title, activeContent.data._id)}
                        className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-4 py-2 rounded-lg transition"
                    >
                        {downloadingFileId === activeContent.data._id ? <Loader className="animate-spin" size={16}/> : <Download size={16}/>}
                        Download Document
                    </button>
                </div>
                <iframe src={`https://docs.google.com/viewer?url=${docUrl}&embedded=true`} className="w-full flex-1 bg-white" title="Viewer"></iframe>
            </div>
        );
    }

    if (activeContent.type === 'link') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
                <LinkIcon className="w-20 h-20 text-purple-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">{activeContent.data.title}</h3>
                <p className="text-gray-400 mb-8 max-w-md">External resource securely linked.</p>
                <a href={activeContent.data.url} target="_blank" rel="noopener noreferrer"
                   className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-purple-900/30">
                   Open Resource <ExternalLink size={18} />
                </a>
            </div>
        );
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><Loader className="w-8 h-8 animate-spin text-blue-500 mr-3" /></div>;

  // =====================================================================
  // VIEW B: THE PLAYER MODE (Active Learning)
  // =====================================================================
  if (selectedCourse) {
    const currentProgress = calculateProgress(selectedCourse);
    const isCurrentItemDone = activeContent && completedItems.includes(activeContent.data._id);

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-200 relative">
        
        {/* 🧠 NEW: AI QUIZ MODAL */}
        {showQuizModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 max-w-xl w-full">
                    
                    {quizLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="relative mb-6">
                                <Brain className="w-16 h-16 text-blue-500 animate-pulse" />
                                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Gemini is analyzing the lecture...</h3>
                            <p className="text-slate-400 text-sm">Generating a custom knowledge check.</p>
                        </div>
                    ) : quizData ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30">
                                    <Brain className="text-blue-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">AI Knowledge Check</h3>
                                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Pass to Complete Lesson</p>
                                </div>
                            </div>

                            <p className="text-lg font-medium text-slate-200 mb-6 leading-relaxed">
                                {quizData.question}
                            </p>

                            <div className="space-y-3 mb-6">
                                {quizData.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setQuizSelectedOption(option);
                                            setQuizResult(null); // Reset result if they change answer
                                        }}
                                        disabled={quizResult === 'correct'}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            quizSelectedOption === option 
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-100' 
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                                        } ${
                                            quizResult === 'correct' && option === quizData.correctAnswer ? 'bg-green-500/20 border-green-500 text-green-100' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {quizSelectedOption === option && quizResult !== 'correct' && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>}
                                            {quizResult === 'correct' && option === quizData.correctAnswer && <CheckCircle className="text-green-500 w-5 h-5" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {quizResult === 'incorrect' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                                    <XCircle className="text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-400 mb-1">Incorrect. Try again!</p>
                                        <p className="text-sm text-slate-300"><strong>Hint:</strong> {quizData.hint}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setShowQuizModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition flex-1">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleQuizSubmit}
                                    disabled={!quizSelectedOption || quizResult === 'correct'}
                                    className={`px-6 py-3 rounded-xl font-black transition shadow-lg flex-1 ${
                                        quizResult === 'correct' 
                                            ? 'bg-green-600 text-white shadow-green-900/50' 
                                            : !quizSelectedOption 
                                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                                    }`}
                                >
                                    {quizResult === 'correct' ? 'Lesson Completed!' : 'Submit Answer'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        )}

        {/* CELEBRATION & CERTIFICATE MODAL */}
        {showTrophy && (
            <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-10 rounded-3xl border border-yellow-500/30 shadow-2xl shadow-yellow-500/20 max-w-md w-full text-center transform scale-105 transition-all">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="text-yellow-400 w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Congratulations, {userInfo?.name}!</h2>
                    <p className="text-slate-300 font-medium mb-6">You have successfully mastered <span className="text-yellow-400">"{completedCourseName}"</span>.</p>
                    
                    <button 
                        onClick={generateCertificatePDF} 
                        disabled={isGeneratingCert}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-slate-900 font-black rounded-xl shadow-lg shadow-yellow-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                    >
                        {isGeneratingCert ? <Loader className="animate-spin"/> : <Award size={20} />}
                        {isGeneratingCert ? "Forging Certificate..." : "Claim Victory & Download Certificate"}
                    </button>

                    <button onClick={() => setShowTrophy(false)} className="text-sm font-bold text-slate-500 hover:text-slate-300 transition">
                        Close and return to course
                    </button>
                </div>
            </div>
        )}

        {/* LEFT COLUMN: Dynamic Player & Controls */}
        <div className="w-full lg:w-2/3 flex flex-col border-r border-slate-800">
          <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800 shadow-sm">
              <button onClick={() => setSelectedCourse(null)} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                <ArrowLeft size={16} /> Dashboard
              </button>
              <h2 className="font-bold text-slate-200 truncate max-w-md">{selectedCourse.title}</h2>
          </div>
          
          <div className="aspect-video bg-black flex items-center justify-center relative shadow-2xl">
             {renderActiveContent()}
          </div>
          
          <div className="p-6 md:p-8 flex-1 bg-slate-900">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
                        {activeContent ? activeContent.data.title : "Course Overview"}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeContent?.type === 'video' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : activeContent?.type === 'resource' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                        {activeContent?.type || "Information"}
                    </span>
                </div>
                
                {activeContent && (
                    <button 
                        onClick={handleToggleComplete}
                        disabled={progressLoading}
                        className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${isCurrentItemDone ? 'bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'}`}
                    >
                        {progressLoading ? <Loader className="animate-spin" size={20}/> : isCurrentItemDone ? <Undo size={20} /> : <><Sparkles size={18}/> Verify Mastery</>}
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Curriculum Sidebar */}
        <div className="w-full lg:w-1/3 bg-slate-950 h-screen lg:sticky top-0 overflow-hidden flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10">
          <div className="p-6 bg-slate-900 border-b border-slate-800 z-10">
             <h3 className="text-xl font-black text-white flex items-center gap-2"><Award className="text-yellow-500"/> Curriculum</h3>
             <div className="mt-5">
                 <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                     <span className="uppercase tracking-wider">Progress</span>
                     <span className={currentProgress === 100 ? "text-yellow-400" : "text-blue-400"}>{currentProgress}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner">
                     <div className={`h-2.5 rounded-full transition-all duration-700 ease-out shadow-lg ${currentProgress === 100 ? "bg-gradient-to-r from-yellow-500 to-amber-400" : "bg-gradient-to-r from-blue-600 to-sky-400"}`} style={{ width: `${currentProgress}%` }}></div>
                 </div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
             {selectedCourse.lectures?.map((section, index) => (
                  <div key={index} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                    <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition text-left">
                      <span className="font-bold text-slate-200 text-sm line-clamp-1 pr-4">{section.title}</span>
                      <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSections[index] && (
                      <div className="bg-slate-950/50 pb-2">
                        {section.videos?.map((vid, vIdx) => (
                          <div key={vIdx} onClick={() => setActiveContent({type: 'video', data: vid})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === vid._id ? "border-l-blue-500 bg-slate-800/80" : "border-l-transparent hover:bg-slate-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <MonitorPlay size={16} className={activeContent?.data._id === vid._id ? "text-blue-400" : "text-slate-500"}/>
                                 <span className={`text-sm ${activeContent?.data._id === vid._id ? "text-blue-100 font-bold" : "text-slate-400 font-medium"}`}>{vid.title}</span>
                             </div>
                             {completedItems.includes(vid._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-md"/>}
                          </div>
                        ))}
                        {section.resources?.map((res, rIdx) => (
                          <div key={rIdx} onClick={() => setActiveContent({type: 'resource', data: res})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === res._id ? "border-l-emerald-500 bg-slate-800/80" : "border-l-transparent hover:bg-slate-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <FileText size={16} className={activeContent?.data._id === res._id ? "text-emerald-400" : "text-slate-500"}/>
                                 <span className={`text-sm ${activeContent?.data._id === res._id ? "text-emerald-100 font-bold" : "text-slate-400 font-medium"}`}>{res.title}</span>
                             </div>
                             {completedItems.includes(res._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-md"/>}
                          </div>
                        ))}
                        {section.links?.map((link, lIdx) => (
                          <div key={lIdx} onClick={() => setActiveContent({type: 'link', data: link})} className={`p-3 pl-6 flex items-center justify-between cursor-pointer transition border-l-2 ${activeContent?.data._id === link._id ? "border-l-purple-500 bg-slate-800/80" : "border-l-transparent hover:bg-slate-800/50"}`}>
                             <div className="flex items-center gap-3">
                                 <LinkIcon size={16} className={activeContent?.data._id === link._id ? "text-purple-400" : "text-slate-500"}/>
                                 <span className={`text-sm ${activeContent?.data._id === link._id ? "text-purple-100 font-bold" : "text-slate-400 font-medium"}`}>{link.title}</span>
                             </div>
                             {completedItems.includes(link._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-md"/>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // VIEW A: THE DASHBOARD GRID
  // =====================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 font-sans relative overflow-x-hidden">
      
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-16 px-8 relative shadow-sm">
          <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                  <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 transition bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl border border-slate-700 shadow-sm">
                      <Home size={16} /> Back to Catalog
                  </button>

                  <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-slate-200">{userInfo?.name}</p>
                          <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Learner</p>
                      </div>
                      {userInfo?.profilePicture ? (
                          <img 
                              src={userInfo.profilePicture} 
                              alt={userInfo.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50 shadow-lg"
                              onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Learner')}&background=random&color=fff`;
                              }}
                          />
                      ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg uppercase">
                              {userInfo?.name?.charAt(0) || "L"}
                          </div>
                      )}
                  </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">My Learning Arena</h1>
              <p className="text-slate-400 font-medium text-lg">Your active quests and ongoing training.</p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-10">
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="bg-blue-500/10 p-6 rounded-full mb-6 border border-blue-500/20"><BookOpen className="w-16 h-16 text-blue-500" /></div>
              <h2 className="text-3xl font-black mb-3 text-white">Your journey has not yet begun</h2>
              <p className="text-slate-400 mb-8 text-center max-w-md font-medium text-lg">The Lands Between await. Discover new skills and begin your training.</p>
              <Link to="/courses" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-black text-lg shadow-xl shadow-blue-900/30 transform hover:-translate-y-1 transition-all">Browse Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((course) => {
                const prog = calculateProgress(course);
                return (
                <div key={course._id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all shadow-xl group flex flex-col">
                  <div className="h-52 relative overflow-hidden bg-slate-950">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100" />
                      <button onClick={(e) => handleUnenroll(course._id, e)} className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-red-400 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-700 hover:border-red-500/50" title="Drop Course">
                         <Trash2 size={18}/>
                      </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-white mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                      <div className="mb-6 mt-auto pt-6">
                          <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                              <span>Progress</span>
                              <span className={prog === 100 ? "text-yellow-400" : "text-blue-400"}>{prog}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 shadow-inner">
                              <div className={`h-2 rounded-full transition-all duration-700 ${prog === 100 ? "bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-gradient-to-r from-blue-600 to-sky-400"}`} style={{ width: `${prog}%` }}></div>
                          </div>
                      </div>
                      <button onClick={() => handleStartCourse(course)} className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 ${prog === 100 ? 'bg-slate-800 text-yellow-500 hover:bg-slate-700 border border-yellow-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'}`}>
                        {prog === 100 ? <><Trophy size={20}/> Revisit Victory</> : <><PlayCircle size={20} /> Resume Training</>}
                      </button>
                  </div>
                </div>
              )})}
            </div>
          )}
      </div>
    </div>
  );
};

export default LearnerDashboard;