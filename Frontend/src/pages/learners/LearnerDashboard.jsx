import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, MonitorPlay, ChevronDown, CheckCircle,
  ArrowLeft, Loader, FileText, Link as LinkIcon, ExternalLink,
  Award, Home, Download, Trash2, Trophy, Undo, Sparkles, Brain, XCircle,
  Lock, LogOut, Flame, Compass, Mic, Square, ThumbsUp, ThumbsDown, MessageSquare,
  LayoutDashboard, Menu, X, Send, User, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import { CERT_TEMPLATE_BASE64 } from '../../assets/certificateTemplate';
import {
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const badgeNames = {
  first_step: "First Milestone 🧭",
  voice_master: "Orator 🎙️",
  streak_maker: "Committed 🔥",
  exam_champion: "Scholar 🎓",
  graduate: "Graduate 🏆"
};

const badgeList = [
  {
    id: "first_step",
    name: "Milestone",
    requirement: "Completed 1st Lecture",
    icon: Compass,
    color: "text-indigo-600 border-indigo-200 bg-indigo-50",
    ribbonColor: "text-indigo-500/80",
    activeRing: "border-indigo-400"
  },
  {
    id: "voice_master",
    name: "Orator",
    requirement: "Passed AI Voice Check",
    icon: Mic,
    color: "text-sky-600 border-sky-200 bg-sky-50",
    ribbonColor: "text-sky-500/80",
    activeRing: "border-sky-400"
  },
  {
    id: "streak_maker",
    name: "Committed",
    requirement: "3-Day Daily Streak",
    icon: Flame,
    color: "text-orange-600 border-orange-200 bg-orange-50",
    ribbonColor: "text-orange-500/80",
    activeRing: "border-orange-400"
  },
  {
    id: "exam_champion",
    name: "Scholar",
    requirement: "Perfect 10/10 Exam Score",
    icon: Award,
    color: "text-purple-600 border-purple-200 bg-purple-50",
    ribbonColor: "text-purple-500/80",
    activeRing: "border-purple-400"
  },
  {
    id: "graduate",
    name: "Graduate",
    requirement: "Earned Course Certificate",
    icon: Trophy,
    color: "text-amber-600 border-amber-200 bg-amber-50",
    ribbonColor: "text-amber-500/80",
    activeRing: "border-amber-400"
  }
];

const LearnerDashboard = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Cashback & Refund Claim States
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState("");

  // View Controllers
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  // Celebration & Certificate State
  const [showTrophy, setShowTrophy] = useState(false);
  const [completedCourseName, setCompletedCourseName] = useState("");
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [examSuccessTimer, setExamSuccessTimer] = useState(5);

  // --- 🎙️ AI VOICE ORAL ASSESSMENT STATE ---
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceQuestion, setVoiceQuestion] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [voicePassed, setVoicePassed] = useState(null); // true, false, null
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [pendingCompletionId, setPendingCompletionId] = useState(null);

  // --- 🎓 FINAL EXAM STATE ---
  const [passedExams, setPassedExams] = useState([]);
  const [showExamUnlockedModal, setShowExamUnlockedModal] = useState(false);
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExamQuestions, setFinalExamQuestions] = useState([]);
  const [finalExamLoading, setFinalExamLoading] = useState(false);
  const [finalExamCurrentIndex, setFinalExamCurrentIndex] = useState(0);
  const [finalExamAnswers, setFinalExamAnswers] = useState({});
  const [finalExamSubmitting, setFinalExamSubmitting] = useState(false);
  const [finalExamResult, setFinalExamResult] = useState(null); // { score: number, passed: boolean }
  const [examTimer, setExamTimer] = useState(45);

  // --- 💡 SKILLS & RECOMMENDATIONS STATE ---
  const [userSkills, setUserSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");

  // --- 📝 AI STUDY HUB & NOTES STATE ---
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("curriculum");
  const [studyNotes, setStudyNotes] = useState("");
  
  // --- 💬 GUIDANCE & ⭐ FEEDBACK STATE ---
  const [activeDashboardTab, setActiveDashboardTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guidanceMessages, setGuidanceMessages] = useState([]);
  const [guidanceInput, setGuidanceInput] = useState("");
  const [isGuidanceRecording, setIsGuidanceRecording] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [feedbackLiked, setFeedbackLiked] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackVoiceUrl, setFeedbackVoiceUrl] = useState("");
  const [isFeedbackRecording, setIsFeedbackRecording] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);

  const guidanceRecorderRef = useRef(null);
  const guidanceChunksRef = useRef([]);
  const feedbackRecorderRef = useRef(null);
  const feedbackChunksRef = useRef([]);
  const guidancePollingRef = useRef(null);

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [xpAlert, setXpAlert] = useState({ show: false, amount: 0, badge: "" });

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const updateLocalUserInfo = (updatedFields) => {
    if (!userInfo) return;

    // Check if XP grew
    const oldXp = userInfo.xp || 0;
    const newXp = updatedFields.xp || 0;
    const xpDiff = newXp - oldXp;

    // Check if a new badge was unlocked
    const oldBadges = userInfo.badges || [];
    const newBadges = updatedFields.badges || [];
    const newUnlockedBadge = newBadges.find(b => !oldBadges.includes(b));

    const newUser = { ...userInfo, ...updatedFields };
    setUserInfo(newUser);
    localStorage.setItem("userInfo", JSON.stringify(newUser));

    if (xpDiff > 0 || newUnlockedBadge) {
      setXpAlert({
        show: true,
        amount: xpDiff > 0 ? xpDiff : 0,
        badge: newUnlockedBadge ? badgeNames[newUnlockedBadge] || newUnlockedBadge : ""
      });
      // Clear alert after 4 seconds
      setTimeout(() => {
        setXpAlert({ show: false, amount: 0, badge: "" });
      }, 4000);
    }
  };

  // --- DATA FETCHING ---
  const fetchRecommendations = async (userId) => {
    setRecsLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/recommendations', { userId });
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    } finally {
      setRecsLoading(false);
    }
  };

  const fetchGuidanceChat = async (courseToUse = selectedCourse) => {
    if (!userInfo?._id || !courseToUse) return;
    const instId = courseToUse.instructorId?._id || courseToUse.instructorId;
    if (!instId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/chat/${userInfo._id}/${instId}`);
      setGuidanceMessages(data);
    } catch (e) {
      console.error("Error loading chat messages", e);
    }
  };

  const fetchCourseFeedback = async (courseToUse = selectedCourse) => {
    if (!userInfo?._id || !courseToUse) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/feedback/course/${courseToUse._id}`);
      const myFeedback = data.find(f => (f.studentId?._id || f.studentId) === userInfo._id);
      if (myFeedback) {
        setExistingFeedback(myFeedback);
        setFeedbackLiked(myFeedback.liked);
        setFeedbackText(myFeedback.text);
        setFeedbackVoiceUrl(myFeedback.voiceUrl);
        setIsEditingFeedback(false);
      } else {
        setExistingFeedback(null);
        setFeedbackLiked(null);
        setFeedbackText("");
        setFeedbackVoiceUrl("");
        setIsEditingFeedback(false);
      }
    } catch (e) {
      console.error("Error loading feedback details", e);
    }
  };

  // Guidance audio recorder handlers
  const handleStartGuidanceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      guidanceRecorderRef.current = mediaRecorder;
      guidanceChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) guidanceChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(guidanceChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          sendGuidanceVoice(reader.result);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsGuidanceRecording(true);
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const handleStopGuidanceRecord = () => {
    if (guidanceRecorderRef.current && isGuidanceRecording) {
      guidanceRecorderRef.current.stop();
      setIsGuidanceRecording(false);
    }
  };

  const sendGuidanceVoice = async (base64Audio) => {
    const instId = selectedCourse.instructorId?._id || selectedCourse.instructorId;
    if (!userInfo?._id || !instId) return;
    try {
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        sender: userInfo._id,
        receiver: instId,
        text: "[Voice Message]",
        voiceUrl: base64Audio
      });
      setGuidanceMessages(prev => [...prev, data]);
    } catch (e) {
      alert("Failed to send voice message.");
    }
  };

  const handleSendGuidanceText = async (e) => {
    e.preventDefault();
    const instId = selectedCourse.instructorId?._id || selectedCourse.instructorId;
    if (!guidanceInput.trim() || !userInfo?._id || !instId) return;

    const textMsg = guidanceInput;
    setGuidanceInput("");

    try {
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        sender: userInfo._id,
        receiver: instId,
        text: textMsg
      });
      setGuidanceMessages(prev => [...prev, data]);
    } catch (e) {
      alert("Failed to send message.");
    }
  };

  // Feedback audio recorder handlers
  const handleStartFeedbackRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      feedbackRecorderRef.current = mediaRecorder;
      feedbackChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) feedbackChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(feedbackChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setFeedbackVoiceUrl(reader.result);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsFeedbackRecording(true);
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const handleStopFeedbackRecord = () => {
    if (feedbackRecorderRef.current && isFeedbackRecording) {
      feedbackRecorderRef.current.stop();
      setIsFeedbackRecording(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse?._id || !userInfo?._id || feedbackLiked === null || (!feedbackText.trim() && !feedbackVoiceUrl)) {
      alert("Please select a rating (like/dislike) and enter suggestions or record a voice review.");
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/feedback', {
        courseId: selectedCourse._id,
        studentId: userInfo._id,
        liked: feedbackLiked,
        text: feedbackText || "[Voice Feedback]",
        voiceUrl: feedbackVoiceUrl || ""
      });
      setExistingFeedback(data);
      setIsEditingFeedback(false);
      alert("Feedback submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    }
  };

  // Polling hook for guidance chat messages
  useEffect(() => {
    if (selectedCourse && sidebarTab === 'guidance') {
      const markChatRead = async () => {
        const instId = selectedCourse.instructorId?._id || selectedCourse.instructorId;
        if (!userInfo?._id || !instId) return;
        try {
          await axios.put('http://localhost:5000/api/messages/read', {
            sender: instId,
            receiver: userInfo._id
          });
        } catch (e) {}
      };

      markChatRead();
      fetchGuidanceChat();

      guidancePollingRef.current = setInterval(() => {
        fetchGuidanceChat();
        markChatRead();
      }, 3000);
    } else {
      if (guidancePollingRef.current) {
        clearInterval(guidancePollingRef.current);
      }
    }

    return () => {
      if (guidancePollingRef.current) {
        clearInterval(guidancePollingRef.current);
      }
    };
  }, [selectedCourse, sidebarTab]);

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
        if (currentUser) {
          if (currentUser.completedContent) {
            setCompletedItems(currentUser.completedContent);
          }
          if (currentUser.passedExams) {
            setPassedExams(currentUser.passedExams);
          }
          if (currentUser.skills) {
            setUserSkills(currentUser.skills);
          }
          fetchRecommendations(user._id);
        }

        // Fetch unread
        const unreadRes = await axios.get(`http://localhost:5000/api/messages/unread/${user._id}`);
        setUnreadMessages(unreadRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [navigate]);

  useEffect(() => {
    if (!userInfo?._id) return;
    const fetchUnread = async () => {
      try {
        const unreadRes = await axios.get(`http://localhost:5000/api/messages/unread/${userInfo._id}`);
        setUnreadMessages(unreadRes.data);
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [userInfo?._id]);

  useEffect(() => {
    if (activeContent && activeContent.data && userInfo) {
      setAiSummary("");
      setVoiceAnswer("");
      setVoiceFeedback("");
      setVoicePassed(null);

      const key = `notes_${userInfo._id}_${selectedCourse?._id || 'course'}_${activeContent.data._id}`;
      const savedNotes = localStorage.getItem(key);
      setStudyNotes(savedNotes || "");
    }
  }, [activeContent, userInfo, selectedCourse]);

  const handleNotesChange = (text) => {
    setStudyNotes(text);
    if (activeContent && activeContent.data && userInfo) {
      const key = `notes_${userInfo._id}_${selectedCourse?._id || 'course'}_${activeContent.data._id}`;
      localStorage.setItem(key, text);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim() || userSkills.includes(newSkillInput.trim())) return;

    const updatedSkills = [...userSkills, newSkillInput.trim()];
    setUserSkills(updatedSkills);
    setNewSkillInput("");

    try {
      await axios.put('http://localhost:5000/api/users/skills', {
        userId: userInfo._id,
        skills: updatedSkills
      });
      fetchRecommendations(userInfo._id);
    } catch (error) {
      console.error("Failed to update skills", error);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = userSkills.filter(s => s !== skillToRemove);
    setUserSkills(updatedSkills);

    try {
      await axios.put('http://localhost:5000/api/users/skills', {
        userId: userInfo._id,
        skills: updatedSkills
      });
      fetchRecommendations(userInfo._id);
    } catch (error) {
      console.error("Failed to update skills", error);
    }
  };

  // --- 🎙️ SPEECH RECOGNITION API INTEGRATION ---
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setVoiceAnswer(prev => prev ? prev + " " + transcript : transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your response instead.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start Speech Recognition:", err);
      }
    }
  };

  const fetchAiSummary = async () => {
    if (aiSummary || !activeContent || !activeContent.data) return;
    setSummaryLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/generate-summary', {
        courseTitle: selectedCourse.title,
        lectureTitle: activeContent.data.title,
        description: activeContent.data.description || ""
      });
      setAiSummary(response.data.summary);
    } catch (error) {
      console.error("Failed to generate summary", error);
      setAiSummary("Failed to generate AI summary. Try again later!");
    } finally {
      setSummaryLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  // --- HELPER FUNCTIONS ---
  const getCourseItems = (course) => {
    const items = [];
    if (!course || !course.lectures) return items;
    course.lectures.forEach((section, sIdx) => {
      section.videos?.forEach(vid => items.push({ id: vid._id, type: 'video', data: vid, sectionIndex: sIdx }));
      section.resources?.forEach(res => items.push({ id: res._id, type: 'resource', data: res, sectionIndex: sIdx }));
      section.links?.forEach(link => items.push({ id: link._id, type: 'link', data: link, sectionIndex: sIdx }));
    });
    return items;
  };

  const isItemLocked = (itemId, course, completedList) => {
    if (course?._id && passedExams.includes(course._id)) return false;

    const items = getCourseItems(course);
    const index = items.findIndex(item => item.id === itemId);
    if (index <= 0) return false; // First item is never locked

    // Check if any previous item is not completed
    for (let i = 0; i < index; i++) {
      if (!completedList.includes(items[i].id)) {
        return true;
      }
    }
    return false;
  };

  const handleStartCourse = (course) => {
    setSelectedCourse(course);
    setSidebarTab("curriculum");
    fetchGuidanceChat(course);
    fetchCourseFeedback(course);
    const items = getCourseItems(course);

    // Find the first uncompleted item
    const firstUncompleted = items.find(item => !completedItems.includes(item.id));
    if (firstUncompleted) {
      setActiveContent({ type: firstUncompleted.type, data: firstUncompleted.data });
      setExpandedSections({ [firstUncompleted.sectionIndex]: true });
    } else if (items.length > 0) {
      // If all completed, open the final exam screen (by setting activeContent to null)
      setActiveContent(null);
      setExpandedSections({ 0: true });
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
    if (!window.confirm("Are you sure you want to drop this course? Your progress will be saved but the course will be removed from your dashboard.")) return;
    try {
      await axios.post('http://localhost:5000/api/users/unenroll', { userId: userInfo._id, courseId });
      setEnrolledCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (error) { alert("Failed to unenroll."); }
  };

  // --- PROGRESS LOGIC ---
  const calculateProgress = (course, currentCompleted = completedItems) => {
    if (course?._id && passedExams.includes(course._id)) return 100;
    if (!course.lectures) return 0;
    let totalItems = 0;
    let finishedItems = 0;

    course.lectures.forEach(sec => {
      const items = [...(sec.videos || []), ...(sec.resources || []), ...(sec.links || [])];
      totalItems += items.length;
      items.forEach(item => {
        if (currentCompleted.includes(item._id)) finishedItems++;
      });
    });
    return totalItems === 0 ? 0 : Math.round((finishedItems / totalItems) * 100);
  };

  // --- 🎙️ AI VOICE ORAL ASSESSMENT LOGIC ---
  const handleToggleComplete = async () => {
    if (!activeContent || !activeContent.data._id) return;

    const contentId = activeContent.data._id;
    const isCurrentlyDone = completedItems.includes(contentId);

    // IF UNMARKING: Do it directly without a quiz/assessment
    if (isCurrentlyDone) {
      setProgressLoading(true);
      const newCompletedList = completedItems.filter(id => id !== contentId);
      setCompletedItems(newCompletedList);
      try {
        const { data } = await axios.put('http://localhost:5000/api/users/progress', {
          userId: userInfo._id, contentId: contentId
        });
        setCompletedItems(data.completedContent);
        updateLocalUserInfo(data);
      } catch (error) { console.error("Failed to update progress", error); }
      finally { setProgressLoading(false); }
      return;
    }

    // IF MARKING DONE: Trigger the AI Voice Assessment
    setPendingCompletionId(contentId);
    setShowVoiceModal(true);
    setVoiceLoading(true);
    setVoiceQuestion("");
    setVoiceAnswer("");
    setVoiceFeedback("");
    setVoicePassed(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/generate-voice-question', {
        courseTitle: selectedCourse.title,
        lectureTitle: activeContent.data.title,
        courseDescription: selectedCourse.description
      });
      setVoiceQuestion(response.data.question);
    } catch (error) {
      console.error("AI voice question failed to load, skipping...", error);
      // Fallback: If AI fails, let them complete the video anyway so they don't get stuck
      executeCompletion(contentId);
      setShowVoiceModal(false);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleVerifyVoiceAnswer = async () => {
    if (!voiceAnswer.trim()) {
      alert("Please record or type an answer first.");
      return;
    }

    setVoiceLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/verify-voice-answer', {
        question: voiceQuestion,
        answer: voiceAnswer,
        courseTitle: selectedCourse.title,
        lectureTitle: activeContent.data.title
      });

      const result = response.data;
      setVoiceFeedback(result.feedback);
      setVoicePassed(result.passed);

      if (result.passed) {
        executeCompletion(pendingCompletionId);

        // Award XP for oral check
        try {
          const { data } = await axios.put('http://localhost:5000/api/users/add-xp', {
            userId: userInfo._id,
            xpAmount: 150,
            source: 'voice'
          });
          updateLocalUserInfo(data);
        } catch (err) {
          console.error("Failed to save voice check XP", err);
        }

        // Close the modal automatically after 2.5 seconds so they can read the feedback
        setTimeout(() => {
          setShowVoiceModal(false);
          setVoiceAnswer("");
          setVoiceFeedback("");
          setVoicePassed(null);
        }, 2500);
      }
    } catch (error) {
      console.error("Grading failed", error);
      alert("Failed to grade response. Please try again.");
    } finally {
      setVoiceLoading(false);
    }
  };

  // --- THE ACTUAL COMPLETION EXECUTION ---
  const executeCompletion = async (contentId) => {
    setProgressLoading(true);
    const newCompletedList = [...completedItems, contentId];
    setCompletedItems(newCompletedList);

    const items = getCourseItems(selectedCourse);
    const currentIndex = items.findIndex(item => item.id === contentId);
    const nextItem = currentIndex !== -1 && currentIndex + 1 < items.length ? items[currentIndex + 1] : null;

    const newProgress = calculateProgress(selectedCourse, newCompletedList);
    if (newProgress === 100) {
      setCompletedCourseName(selectedCourse.title);
      setShowExamUnlockedModal(true);
      setActiveContent(null);
    } else if (nextItem) {
      setTimeout(() => {
        setActiveContent({ type: nextItem.type, data: nextItem.data });
        setExpandedSections(prev => ({ ...prev, [nextItem.sectionIndex]: true }));
      }, 1000);
    }

    try {
      const { data } = await axios.put('http://localhost:5000/api/users/progress', {
        userId: userInfo._id, contentId: contentId
      });
      setCompletedItems(data.completedContent);
      updateLocalUserInfo(data);
    } catch (error) { console.error("Failed to update progress", error); }
    finally { setProgressLoading(false); }
  };

  const handleQuizSubmit = () => {
    if (!quizSelectedOption || !quizData) return;

    const cleanUser = quizSelectedOption.trim().toLowerCase();
    const cleanCorrect = (quizData.correctAnswer || '').trim().toLowerCase();

    let isCorrect = (cleanUser === cleanCorrect);

    if (!isCorrect) {
      const optionLetters = ['a', 'b', 'c', 'd'];
      const correctIdx = optionLetters.indexOf(cleanCorrect);
      if (correctIdx !== -1 && quizData.options && quizData.options[correctIdx]) {
        if (quizData.options[correctIdx].trim().toLowerCase() === cleanUser) {
          isCorrect = true;
        }
      }
      
      if (!isCorrect && quizData.options) {
        for (let i = 0; i < 4; i++) {
          const letter = optionLetters[i];
          if (cleanCorrect === `option ${letter}` || 
              cleanCorrect === `option: ${letter}` || 
              cleanCorrect === `${letter})` || 
              cleanCorrect === `${i}` || 
              cleanCorrect === `option ${i+1}`) {
            if (quizData.options[i] && quizData.options[i].trim().toLowerCase() === cleanUser) {
              isCorrect = true;
              break;
            }
          }
        }
      }

      if (!isCorrect && quizData.options) {
        for (let i = 0; i < 4; i++) {
          if (quizData.options[i]) {
            const optClean = quizData.options[i].trim().toLowerCase();
            if (optClean.includes(cleanCorrect) || cleanCorrect.includes(optClean)) {
              if (optClean === cleanUser) {
                isCorrect = true;
                break;
              }
            }
          }
        }
      }
    }

    if (isCorrect) {
      setQuizResult('correct');
      setTimeout(() => {
        setShowQuizModal(false);
        executeCompletion(pendingCompletionId);
      }, 1500); // Give them 1.5s to see the green success state before closing
    } else {
      setQuizResult('incorrect');
    }
  };

  // --- 🎓 FINAL EXAM LOGIC ---
  const fetchFinalExam = async (courseToUse = selectedCourse) => {
    if (!courseToUse) return;
    setFinalExamLoading(true);
    setFinalExamQuestions([]);
    setFinalExamAnswers({});
    setFinalExamCurrentIndex(0);
    setFinalExamResult(null);
    try {
      const lectureTitles = [];
      courseToUse.lectures?.forEach(sec => lectureTitles.push(sec.title));

      const { data } = await axios.post('http://localhost:5000/api/ai/generate-final-exam', {
        courseTitle: courseToUse.title,
        courseDescription: courseToUse.description,
        lectureTitles: lectureTitles
      });
      setFinalExamQuestions(data);
      setShowFinalExamModal(true);
    } catch (error) {
      alert("Failed to load final exam: " + (error.response?.data?.message || error.message));
    } finally {
      setFinalExamLoading(false);
    }
  };

  const handleFinalExamSubmit = async (overrideAnswers = null) => {
    const answersToUse = (overrideAnswers && typeof overrideAnswers === 'object' && !overrideAnswers.preventDefault) 
      ? overrideAnswers 
      : finalExamAnswers;
    if (Object.keys(answersToUse).length < 10) {
      alert("Please answer all 10 questions before submitting.");
      return;
    }

    setFinalExamSubmitting(true);
    try {
      let correctCount = 0;
      finalExamQuestions.forEach((q, idx) => {
        const userAnswer = answersToUse[idx];
        // Resiliently support camelCase, snake_case, or shorter fields for correctAnswer and options
        const correctAnswer = q.correctAnswer || q.correct_answer || q.answer || q.correct || q.correctOption;
        const optionsList = q.options || q.choices || q.answers || [];
        
        if (!userAnswer || !correctAnswer) {
          console.warn(`Question ${idx + 1} is missing fields: User: ${userAnswer}, Correct: ${correctAnswer}`);
          return;
        }

        const cleanUser = userAnswer.trim().toLowerCase();
        const cleanCorrect = correctAnswer.trim().toLowerCase();

        let isCorrect = (cleanUser === cleanCorrect);

        if (!isCorrect) {
          const optionLetters = ['a', 'b', 'c', 'd'];
          const correctIdx = optionLetters.indexOf(cleanCorrect);
          if (correctIdx !== -1 && optionsList[correctIdx]) {
            if (optionsList[correctIdx].trim().toLowerCase() === cleanUser) {
              isCorrect = true;
            }
          }
          
          if (!isCorrect) {
            for (let i = 0; i < 4; i++) {
              const letter = optionLetters[i];
              if (cleanCorrect === `option ${letter}` || 
                  cleanCorrect === `option: ${letter}` || 
                  cleanCorrect === `${letter})` || 
                  cleanCorrect === `${i}` || 
                  cleanCorrect === `option ${i+1}`) {
                if (optionsList[i] && optionsList[i].trim().toLowerCase() === cleanUser) {
                  isCorrect = true;
                  break;
                }
              }
            }
          }

          if (!isCorrect) {
            for (let i = 0; i < 4; i++) {
              if (optionsList[i]) {
                const optClean = optionsList[i].trim().toLowerCase();
                if (optClean.includes(cleanCorrect) || cleanCorrect.includes(optClean)) {
                  if (optClean === cleanUser) {
                    isCorrect = true;
                    break;
                  }
                }
              }
            }
          }
        }

        console.log(`Grading Question ${idx + 1}:`, {
          question: q.question,
          options: optionsList,
          correctAnswerField: correctAnswer,
          userAnswer: userAnswer,
          isCorrect: isCorrect
        });

        if (isCorrect) {
          correctCount++;
        }
      });
      console.log(`Final Exam Grading Complete: ${correctCount}/10`);

      const passed = correctCount >= 7;

      if (passed) {
        const targetCourseId = courseToUse => courseToUse?._id || selectedCourse?._id || enrolledCourses.find(c => c.title === completedCourseName)?._id;
        const { data } = await axios.put('http://localhost:5000/api/users/pass-exam', {
          userId: userInfo._id,
          courseId: targetCourseId(),
          score: correctCount
        });
        setPassedExams(data.passedExams);
        updateLocalUserInfo(data);
      }

      setFinalExamResult({
        score: correctCount,
        passed: passed
      });
    } catch (error) {
      alert("Failed to submit exam: " + (error.response?.data?.message || error.message));
    } finally {
      setFinalExamSubmitting(false);
    }
  };

  // --- ⏱️ FINAL EXAM COUNTDOWN TIMER ---
  useEffect(() => {
    if (!showFinalExamModal || finalExamResult || finalExamQuestions.length === 0) return;

    setExamTimer(45);

    const interval = setInterval(() => {
      setExamTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextOrSkipQuestion();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showFinalExamModal, finalExamCurrentIndex, finalExamResult, finalExamQuestions]);

  // --- ⏱️ FINAL EXAM SUCCESS COUNTDOWN AUTO-CLOSE ---
  useEffect(() => {
    if (!showFinalExamModal || !finalExamResult?.passed) {
      setExamSuccessTimer(5);
      return;
    }

    const interval = setInterval(() => {
      setExamSuccessTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowFinalExamModal(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showFinalExamModal, finalExamResult]);

  const handleNextOrSkipQuestion = () => {
    setFinalExamAnswers(prev => {
      const updated = { ...prev };
      if (updated[finalExamCurrentIndex] === undefined) {
        updated[finalExamCurrentIndex] = "skipped";
      }

      if (finalExamCurrentIndex < 9) {
        setFinalExamCurrentIndex(prevIdx => prevIdx + 1);
      } else {
        setTimeout(() => {
          handleFinalExamSubmit(updated);
        }, 100);
      }
      return updated;
    });
  };

  const handleFinalExamRetake = () => {
    fetchFinalExam();
  };


  // --- 🌟 CUSTOM NATIVE CERTIFICATE GENERATOR 🌟 ---
  const generateCertificatePDF = (courseName = selectedCourse?.title || completedCourseName) => {
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
      const paragraph = `has successfully completed a professional training program in "${courseName}".\nTheir dedication and commitment to the learning process are truly commendable.`;
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

      doc.save(`${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
      setShowTrophy(false);
    } catch (error) {
      console.error("Certificate Generation Error:", error);
      alert("Failed to generate certificate.");
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const handleClaimReward = async () => {
    if (!selectedCourse) return;
    setClaimLoading(true);
    setClaimSuccessMessage("");
    try {
      const response = await axios.post("http://localhost:5000/api/payments/claim-reward", {
        userId: userInfo._id,
        courseId: selectedCourse._id
      });
      
      // Update local enrolledCourses list
      setEnrolledCourses(prev => prev.map(c => {
        if (c._id === selectedCourse._id) {
          return {
            ...c,
            purchaseDetails: {
              ...c.purchaseDetails,
              refundStatus: "Processed"
            }
          };
        }
        return c;
      }));

      // Update selectedCourse
      setSelectedCourse(prev => ({
        ...prev,
        purchaseDetails: {
          ...prev.purchaseDetails,
          refundStatus: "Processed"
        }
      }));

      // Update passedExams list
      if (response.data.passedExams) {
        setPassedExams(response.data.passedExams);
      }

      setClaimSuccessMessage("Congratulations! Your 75% cashback has been processed successfully via Razorpay.");
      
      // Generate certificate
      setCompletedCourseName(selectedCourse.title);
      generateCertificatePDF(selectedCourse.title);
    } catch (error) {
      console.error("Failed to claim cashback:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Failed to claim cashback: " + errorMsg);
    } finally {
      setClaimLoading(false);
    }
  };


  // --- DYNAMIC CONTENT WINDOW ---
  const renderActiveContent = () => {
    if (!activeContent) {
      const prog = calculateProgress(selectedCourse);
      if (prog === 100) {
        const isPassed = passedExams.includes(selectedCourse._id);
        if (isPassed) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-250">
                <Trophy className="text-amber-500 w-12 h-12 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">Course Mastered! 🏆</h3>
              <p className="text-slate-500 mb-8 max-w-md">Congratulations! You have completed all lessons and passed the final exam. Download your certificate below.</p>
              {(() => {
                const purchase = selectedCourse?.purchaseDetails;
                if (!purchase) {
                  return (
                    <button
                      onClick={() => { setCompletedCourseName(selectedCourse.title); generateCertificatePDF(selectedCourse.title); }}
                      className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-sm transform hover:-translate-y-0.5"
                    >
                      {isGeneratingCert ? <Loader className="animate-spin" /> : <Award size={18} />}
                      Download Certificate (PDF)
                    </button>
                  );
                }

                const enrollmentDate = new Date(purchase.enrollmentDate);
                const daysSinceEnroll = Math.floor((new Date() - enrollmentDate) / (1000 * 3600 * 24));
                const isExpired = daysSinceEnroll > 30 || purchase.refundStatus === 'Expired';
                const cashbackAmount = Math.round((purchase.amountPaid * 0.75) / 100);

                if (purchase.refundStatus === 'Eligible' && !isExpired) {
                  return (
                    <div className="flex flex-col items-center gap-4">
                      {claimSuccessMessage && (
                        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold">
                          {claimSuccessMessage}
                        </div>
                      )}
                      <p className="text-sm font-bold text-green-600">
                        🎉 You completed this course in {daysSinceEnroll} days! You are eligible for a 75% cashback refund of ₹{cashbackAmount}.
                      </p>
                      <button
                        onClick={handleClaimReward}
                        disabled={claimLoading}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
                      >
                        {claimLoading ? <Loader className="animate-spin" /> : <Award size={18} />}
                        Claim Certificate & ₹{cashbackAmount} Cashback
                      </button>
                    </div>
                  );
                }

                if (purchase.refundStatus === 'Processed') {
                  return (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold">
                        ✅ ₹{cashbackAmount} Cashback successfully claimed and processed.
                      </div>
                      <button
                        onClick={() => { setCompletedCourseName(selectedCourse.title); generateCertificatePDF(selectedCourse.title); }}
                        className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-sm transform hover:-translate-y-0.5"
                      >
                        {isGeneratingCert ? <Loader className="animate-spin" /> : <Award size={18} />}
                        Download Certificate (PDF)
                      </button>
                    </div>
                  );
                }

                // Expired or other status
                return (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-xs text-red-500 font-medium">
                      ⚠️ Cashback claim period has expired (completed course {daysSinceEnroll} days after enrollment).
                    </p>
                    <button
                      onClick={() => { setCompletedCourseName(selectedCourse.title); generateCertificatePDF(selectedCourse.title); }}
                      className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-sm transform hover:-translate-y-0.5"
                    >
                      {isGeneratingCert ? <Loader className="animate-spin" /> : <Award size={18} />}
                      Download Certificate (PDF)
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-200">
                <Brain className="text-indigo-600 w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">All Lessons Completed! 🧠</h3>
              <p className="text-slate-500 mb-8 max-w-md">You are now eligible to take the Final Exam. Pass it with a score of 70% (7/10) or more to earn your digital certificate.</p>
              <button
                onClick={() => fetchFinalExam()}
                disabled={finalExamLoading}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-sm transform hover:-translate-y-0.5"
              >
                {finalExamLoading ? <Loader className="animate-spin" /> : <Brain size={18} />}
                Start Final Exam (10 MCQs)
              </button>
            </div>
          );
        }
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
          <BookOpen className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-medium text-sm">Select a lesson from the curriculum to begin.</p>
        </div>
      );
    }

    if (activeContent.type === 'video') {
      const ytEmbed = getYouTubeEmbedUrl(activeContent.data.videoUrl);
      return (
        <div className="w-full h-full relative bg-slate-950 rounded-2xl overflow-hidden">
          {ytEmbed ? (
            <iframe
              src={ytEmbed}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              title={activeContent.data.title}
            />
          ) : (
            <video src={activeContent.data.videoUrl} controls autoPlay className="w-full h-full object-contain" />
          )}
        </div>
      );
    }

    if (activeContent.type === 'resource') {
      const url = activeContent.data.url;
      const extMatch = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : '';
      const unsupportedTypes = ['zip', 'rar', '7z', 'tar', 'exe', 'xls', 'xlsx', 'csv'];
      const isUnsupported = unsupportedTypes.includes(ext);

      if (isUnsupported) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 border border-slate-150 rounded-2xl w-full">
            <FileText className="w-20 h-20 text-emerald-600 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{activeContent.data.title}</h3>
            <p className="text-slate-500 mb-8 max-w-md">This file format (<strong>.{ext.toUpperCase()}</strong>) cannot be viewed directly in the browser.</p>
            <button
              onClick={() => handleResourceDownload(url, activeContent.data.title, activeContent.data._id)}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
            >
              {downloadingFileId === activeContent.data._id ? <Loader className="animate-spin" /> : <Download size={18} />}
              Download File
            </button>
          </div>
        );
      }

      const docUrl = encodeURIComponent(url.replace("/image/upload/", "/raw/upload/"));
      return (
        <div className="w-full h-full flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
          <div className="p-3 flex justify-end bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => handleResourceDownload(url, activeContent.data.title, activeContent.data._id)}
              className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-250 px-3 py-1.5 rounded transition animate-fade-in"
            >
              {downloadingFileId === activeContent.data._id ? <Loader className="animate-spin" size={14} /> : <Download size={14} />}
              Download Document
            </button>
          </div>
          <iframe src={`https://docs.google.com/viewer?url=${docUrl}&embedded=true`} className="w-full flex-1 bg-white" title="Viewer"></iframe>
        </div>
      );
    }

    if (activeContent.type === 'link') {
      return (
        <div className="w-full h-full flex flex-col bg-slate-900 justify-center items-center text-center p-8">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-5 border border-purple-500/20">
            <LinkIcon className="text-purple-400 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{activeContent.data.title}</h3>
          <p className="text-slate-400 mb-6 max-w-md text-xs font-medium leading-relaxed">
            This external link is curated as part of your curriculum. Because some platforms block embedding, please click the button below to view the resource in a new tab.
          </p>
          <a
            href={activeContent.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-purple-900/40 transform hover:-translate-y-0.5"
          >
            <ExternalLink size={16} /> Open Web Resource
          </a>
        </div>
      );
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-800"><Loader className="w-8 h-8 animate-spin text-indigo-600 mr-3" /></div>;

  // =====================================================================
  // VIEW B: THE PLAYER MODE (Active Learning)
  // =====================================================================
  if (selectedCourse) {
    const currentProgress = calculateProgress(selectedCourse);
    const isCurrentItemDone = activeContent && completedItems.includes(activeContent.data._id);

    return (
      <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#F8F9FA] text-slate-800 relative font-sans">

        {/* 🎙️ NEW: AI VOICE ORAL ASSESSMENT MODAL */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-xl w-full">

              {voiceLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative mb-6">
                    <Brain className="w-16 h-16 text-indigo-600 animate-pulse" />
                    <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Gemini is processing...</h3>
                  <p className="text-slate-500 text-sm">Formulating check or grading your oral response.</p>
                </div>
              ) : voiceQuestion ? (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                      <Brain className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Oral Concept Check</h3>
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Explain verbally or type your answer</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 shadow-inner">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">Conceptual Question</span>
                    <p className="text-base font-semibold text-slate-800 leading-relaxed">
                      {voiceQuestion}
                    </p>
                  </div>

                  {/* Speech Input & Textarea */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Your Explanation</span>
                      <button
                        type="button"
                        onClick={handleToggleListening}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-sm'
                            : 'bg-indigo-55 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 text-indigo-600 hover:text-white'
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-ping' : 'bg-indigo-600'}`}></span>
                        {isListening ? "Listening... (Click to stop)" : "Speak Answer (Mic)"}
                      </button>
                    </div>

                    <textarea
                      value={voiceAnswer}
                      onChange={(e) => setVoiceAnswer(e.target.value)}
                      placeholder="Describe in 1 short sentence (e.g. 5-15 words). Click 'Speak Answer' to speak verbally..."
                      rows={3}
                      disabled={voicePassed === true}
                      className="w-full p-4 text-sm bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-slate-800 resize-none animate-fade-in"
                    />
                    <span className="text-[10px] text-slate-400 pl-1 block">
                      💡 Tip: Keep it under 2 sentences for instant presentation evaluation.
                    </span>
                  </div>

                  {/* Feedback Box */}
                  {voicePassed !== null && (
                    <div className={`p-4 border rounded-xl flex items-start gap-3 animate-fade-in ${voicePassed
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                        : 'bg-rose-50 border-rose-250 text-rose-800'
                      }}`}>
                      {voicePassed ? (
                        <CheckCircle className="text-emerald-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="text-rose-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-bold mb-1 ${voicePassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {voicePassed ? 'Passed! Excellent Explanation.' : 'Review Suggestion & Try Again'}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{voiceFeedback}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (isListening && recognitionRef.current) {
                          recognitionRef.current.stop();
                        }
                        setShowVoiceModal(false);
                      }}
                      className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition flex-1 border border-slate-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={voicePassed ? () => setShowVoiceModal(false) : handleVerifyVoiceAnswer}
                      disabled={!voiceAnswer.trim()}
                      className={`px-6 py-3.5 rounded-xl font-black transition shadow-sm flex-1 ${voicePassed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : !voiceAnswer.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                    >
                      {voicePassed ? 'Close & Continue' : 'Evaluate Answer'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 🎓 EXAM UNLOCKED MODAL */}
        {showExamUnlockedModal && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-md w-full text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="text-indigo-600 w-12 h-12 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Lessons Complete! 🎓</h2>
              <p className="text-slate-600 font-medium mb-6">You've successfully finished all lectures and lessons in this course. You are now ready to attempt the Final Exam.</p>

              <button
                onClick={() => {
                  setShowExamUnlockedModal(false);
                  fetchFinalExam();
                }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm transition-all mb-3"
              >
                <Brain size={20} />
                Start Final Exam (10 MCQs)
              </button>

              <button onClick={() => setShowExamUnlockedModal(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition">
                Review materials first
              </button>
            </div>
          </div>
        )}

        {/* 🎓 FINAL EXAM MODAL */}
        {showFinalExamModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-2xl w-full overflow-hidden my-8 animate-fade-in">

              {/* Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Brain className="text-indigo-600 w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Final Master Exam</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Course Mastery Verification</p>
                  </div>
                </div>
                {(!finalExamResult || !finalExamResult.passed) && (
                  <button
                    onClick={() => setShowFinalExamModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              {finalExamSubmitting ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Grading your Exam...</h4>
                  <p className="text-slate-500 text-sm">Evaluating your responses for final mastery.</p>
                </div>
              ) : finalExamResult ? (
                /* Result view */
                <div className="p-8 text-center animate-fade-in">
                  {finalExamResult.passed ? (
                    <>
                      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-250 animate-bounce">
                        <Trophy className="text-amber-500 w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-2">Victory Achieved! 🏆</h3>
                      <p className="text-slate-600 font-medium mb-6 max-w-md mx-auto">Sensational job! You passed the exam with a score of <span className="text-amber-600 font-black">{finalExamResult.score}/10</span>. You are certified!</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-4">
                        <button
                          onClick={() => generateCertificatePDF(selectedCourse?.title)}
                          className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-sm transition-all"
                        >
                          View & Download Certificate
                        </button>
                        <button
                          onClick={() => setShowFinalExamModal(false)}
                          className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition border border-slate-200"
                        >
                          Close
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 font-medium italic">
                        Closing automatically in {examSuccessTimer} seconds...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
                        <XCircle className="text-rose-500 w-12 h-12 animate-pulse" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-2">Exam Unsuccessful</h3>
                      <p className="text-slate-600 font-medium mb-4 max-w-md mx-auto">You scored <span className="text-rose-600 font-black">{finalExamResult.score}/10</span>. A minimum score of 7/10 is required to pass.</p>

                      {finalExamResult.suggestions && (
                        <div className="bg-slate-55 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-md mx-auto mb-8">
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">Study Advice</span>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{finalExamResult.suggestions}</p>
                        </div>
                      )}

                      <div className="flex gap-4 max-w-sm mx-auto">
                        <button
                          onClick={() => setShowFinalExamModal(false)}
                          className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex-1 transition border border-slate-200"
                        >
                          Review Syllabus
                        </button>
                        <button
                          onClick={() => { setFinalExamAnswers({}); setFinalExamCurrentIndex(0); setFinalExamResult(null); fetchFinalExam(); }}
                          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl flex-1 shadow-sm transition"
                        >
                          Try Again
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Questionnaire view */
                <div className="p-8 animate-fade-in">
                  {finalExamQuestions.length > 0 && (
                    <>
                      {/* Progress info */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-2">
                          <span className="uppercase tracking-wider">Question {finalExamCurrentIndex + 1} of 10</span>
                          <span>{Math.round(((finalExamCurrentIndex) / 10) * 100)}% Complete</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((finalExamCurrentIndex + 1) / 10) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Timer Countdown Bar */}
                      <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex items-center justify-between">
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${examTimer <= 10 ? 'bg-rose-500 animate-ping' : 'bg-indigo-500'}`}></div>
                          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Question Timer</span>
                        </div>
                        <div className="flex items-center gap-4 flex-grow max-w-xs mx-4">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-1000 ${examTimer <= 15 ? 'bg-rose-500' : examTimer <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${(examTimer / 45) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-xs font-black shrink-0 uppercase tracking-wider tabular-nums ${examTimer <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>{examTimer}s left</span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                        {finalExamQuestions[finalExamCurrentIndex].question}
                      </p>

                      {/* Options */}
                      <div className="space-y-3 mb-8">
                        {finalExamQuestions[finalExamCurrentIndex].options.map((option, idx) => {
                          const isSelected = finalExamAnswers[finalExamCurrentIndex] === option;
                          return (
                            <button
                              key={idx}
                              onClick={() => setFinalExamAnswers(prev => ({ ...prev, [finalExamCurrentIndex]: option }))}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected
                                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                        <button
                          disabled={finalExamCurrentIndex === 0}
                          onClick={() => setFinalExamCurrentIndex(prev => prev - 1)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition border border-slate-200"
                        >
                          Previous
                        </button>

                        {finalExamCurrentIndex < 9 ? (
                          <button
                            disabled={!finalExamAnswers[finalExamCurrentIndex]}
                            onClick={() => setFinalExamCurrentIndex(prev => prev + 1)}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            disabled={Object.keys(finalExamAnswers).length < 10}
                            onClick={() => handleFinalExamSubmit()}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit Exam
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CELEBRATION & CERTIFICATE MODAL */}
        {showTrophy && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-md w-full text-center transform scale-105 transition-all">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Trophy className="text-amber-500 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Congratulations, {userInfo?.name}!</h2>
              <p className="text-slate-600 font-medium mb-6">You have successfully mastered <span className="text-amber-600 font-bold">"{completedCourseName}"</span>.</p>

              <button
                onClick={() => generateCertificatePDF(completedCourseName)}
                disabled={isGeneratingCert}
                className="w-full flex items-center justify-center gap-3 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-3"
              >
                {isGeneratingCert ? <Loader className="animate-spin" /> : <Award size={20} />}
                {isGeneratingCert ? "Forging Certificate..." : "Claim Victory & Download Certificate"}
              </button>

              <button onClick={() => setShowTrophy(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition">
                Close and return to course
              </button>
            </div>
          </div>
        )}

        {/* LEFT COLUMN: Dynamic Player & Controls */}
        <div className="w-full lg:w-2/3 lg:h-full flex flex-col border-r border-slate-200 lg:overflow-hidden bg-slate-50">
          <div className="p-4 bg-white flex items-center justify-between border-b border-slate-200 shadow-sm shrink-0 gap-4">
            <button onClick={() => setSelectedCourse(null)} className="text-sm font-bold text-slate-400 hover:text-slate-800 flex items-center gap-2 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 shrink-0">
              <ArrowLeft size={16} /> Dashboard
            </button>

            <h2 className="font-bold text-slate-800 truncate max-w-[40%] text-center hidden md:block">{selectedCourse.title}</h2>

            <div className="flex items-center gap-3 shrink-0">
              {/* Streak Flame */}
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full border border-orange-100 text-[10px] font-black" title="Daily Streak">
                <Flame size={12} className="fill-orange-500" />
                <span>{userInfo?.streak || 0}D</span>
              </div>

              {/* Level Badge */}
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 text-[10px] font-black">
                <span>Lvl {Math.floor((userInfo?.xp || 0) / 1000) + 1}</span>
                <div className="w-10 bg-indigo-150 rounded-full h-1 overflow-hidden">
                  <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${((userInfo?.xp || 0) % 1000) / 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] lg:min-h-0 bg-black flex items-center justify-center relative shadow-2xl overflow-hidden">
            {renderActiveContent()}
          </div>

          <div className="p-4 md:p-5 bg-white space-y-3 overflow-y-auto custom-scrollbar shrink-0 max-h-[28%] lg:max-h-[28%] border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-800 mb-1 leading-tight">
                  {activeContent ? activeContent.data.title : "Course Overview"}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${activeContent?.type === 'video' ? 'bg-blue-50 text-blue-700 border border-blue-200' : activeContent?.type === 'resource' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                  {activeContent?.type || "Information"}
                </span>
              </div>

              {activeContent && (
                <button
                  onClick={handleToggleComplete}
                  disabled={progressLoading}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${isCurrentItemDone ? 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {progressLoading ? <Loader className="animate-spin" size={18} /> : isCurrentItemDone ? <Undo size={18} /> : <><Sparkles size={16} /> Verify Mastery</>}
                </button>
              )}
            </div>

            {/* General Lesson Description Area */}
            {activeContent && activeContent.data.description && (
              <div className="bg-slate-55 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-inner animate-fade-in">
                <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block mb-0.5">
                  {activeContent.type === 'video' ? 'Lecture Notes' : activeContent.type === 'resource' ? 'Study Guidelines' : 'Reference Notes'}
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {activeContent.data.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Sidebar */}
        <div className="w-full lg:w-1/3 bg-white h-full lg:h-full overflow-hidden flex flex-col border-l border-slate-200 shadow-2xl z-10 animate-fade-in">

          {/* Header & Progress Info */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Award className="text-amber-500 w-5 h-5" /> Learning Engine</h3>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${currentProgress === 100 ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-700'}`}>
                {currentProgress}% Done
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-700 ease-out ${currentProgress === 100 ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width: `${currentProgress}%` }}></div>
            </div>
          </div>

          {/* Tab Navigation Headers */}
          <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setSidebarTab("curriculum")}
              className={`flex-1 min-w-[70px] py-3.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${sidebarTab === "curriculum"
                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              📁 Syllabus
            </button>
            <button
              onClick={() => { setSidebarTab("summary"); fetchAiSummary(); }}
              className={`flex-1 min-w-[70px] py-3.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${sidebarTab === "summary"
                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              🧠 AI Notes
            </button>
            <button
              onClick={() => setSidebarTab("notes")}
              className={`flex-1 min-w-[70px] py-3.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${sidebarTab === "notes"
                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              📝 Notepad
            </button>
            <button
              onClick={() => { setSidebarTab("guidance"); fetchGuidanceChat(); }}
              className={`flex-1 min-w-[70px] py-3.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${sidebarTab === "guidance"
                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              💬 Guidance
            </button>
            <button
              onClick={() => { setSidebarTab("feedback"); fetchCourseFeedback(); }}
              className={`flex-1 min-w-[70px] py-3.5 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${sidebarTab === "feedback"
                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              ⭐ Feedback
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-white">
            {sidebarTab === "curriculum" && (
              <div className="space-y-3">
                {selectedCourse.lectures?.map((section, index) => (
                  <div key={index} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <button onClick={() => toggleSection(index)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left">
                      <span className="font-bold text-slate-800 text-sm line-clamp-1 pr-4">{section.title}</span>
                      <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${expandedSections[index] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSections[index] && (
                      <div className="bg-slate-50/50 pb-2 border-t border-slate-100">
                        {section.videos?.map((vid, vIdx) => {
                          const locked = isItemLocked(vid._id, selectedCourse, completedItems);
                          return (
                            <div key={vIdx}
                              onClick={() => !locked && setActiveContent({ type: 'video', data: vid })}
                              className={`p-3 pl-6 flex items-center justify-between transition border-l-2 ${locked
                                  ? "border-l-transparent cursor-not-allowed opacity-50 bg-slate-100/50"
                                  : activeContent?.data._id === vid._id
                                    ? "border-l-indigo-600 bg-indigo-50/60 cursor-pointer"
                                    : "border-l-transparent hover:bg-slate-100 cursor-pointer"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {locked ? (
                                  <Lock size={16} className="text-slate-400" />
                                ) : (
                                  <MonitorPlay size={16} className={activeContent?.data._id === vid._id ? "text-indigo-600" : "text-slate-500"} />
                                )}
                                <span className={`text-sm ${locked
                                    ? "text-slate-400 font-medium"
                                    : activeContent?.data._id === vid._id
                                      ? "text-indigo-900 font-bold"
                                      : "text-slate-600 font-medium"
                                  }`}>{vid.title}</span>
                              </div>
                              {!locked && completedItems.includes(vid._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-sm" />}
                            </div>
                          );
                        })}
                        {section.resources?.map((res, rIdx) => {
                          const locked = isItemLocked(res._id, selectedCourse, completedItems);
                          return (
                            <div key={rIdx}
                              onClick={() => !locked && setActiveContent({ type: 'resource', data: res })}
                              className={`p-3 pl-6 flex items-center justify-between transition border-l-2 ${locked
                                  ? "border-l-transparent cursor-not-allowed opacity-50 bg-slate-100/50"
                                  : activeContent?.data._id === res._id
                                    ? "border-l-emerald-600 bg-emerald-50/60 cursor-pointer"
                                    : "border-l-transparent hover:bg-slate-100 cursor-pointer"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {locked ? (
                                  <Lock size={16} className="text-slate-400" />
                                ) : (
                                  <FileText size={16} className={activeContent?.data._id === res._id ? "text-emerald-600" : "text-slate-500"} />
                                )}
                                <span className={`text-sm ${locked
                                    ? "text-slate-400 font-medium"
                                    : activeContent?.data._id === res._id
                                      ? "text-emerald-900 font-bold"
                                      : "text-slate-600 font-medium"
                                  }`}>{res.title}</span>
                              </div>
                              {!locked && completedItems.includes(res._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-sm" />}
                            </div>
                          );
                        })}
                        {section.links?.map((link, lIdx) => {
                          const locked = isItemLocked(link._id, selectedCourse, completedItems);
                          return (
                            <div key={lIdx}
                              onClick={() => !locked && setActiveContent({ type: 'link', data: link })}
                              className={`p-3 pl-6 flex items-center justify-between transition border-l-2 ${locked
                                  ? "border-l-transparent cursor-not-allowed opacity-50 bg-slate-100/50"
                                  : activeContent?.data._id === link._id
                                    ? "border-l-purple-600 bg-purple-50/60 cursor-pointer"
                                    : "border-l-transparent hover:bg-slate-100 cursor-pointer"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {locked ? (
                                  <Lock size={16} className="text-slate-400" />
                                ) : (
                                  <LinkIcon size={16} className={activeContent?.data._id === link._id ? "text-purple-600" : "text-slate-500"} />
                                )}
                                <span className={`text-sm ${locked
                                    ? "text-slate-400 font-medium"
                                    : activeContent?.data._id === link._id
                                      ? "text-purple-900 font-bold"
                                      : "text-slate-600 font-medium"
                                  }`}>{link.title}</span>
                              </div>
                              {!locked && completedItems.includes(link._id) && <CheckCircle size={14} className="text-green-500 drop-shadow-sm" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {currentProgress === 100 && (
                  <div className="bg-amber-50/50 rounded-2xl overflow-hidden border border-amber-250 shadow-sm mt-4 shrink-0 animate-fade-in">
                    <button onClick={() => setActiveContent(null)} className={`w-full flex items-center justify-between p-4 hover:bg-amber-50 transition text-left ${!activeContent ? "bg-amber-50" : ""}`}>
                      <div className="flex items-center gap-3">
                        <Trophy className="text-amber-500 w-5 h-5 animate-pulse" />
                        <span className="font-bold text-amber-800 text-sm">Final Exam & Certificate</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {sidebarTab === "summary" && (
              <div className="space-y-4 h-full bg-white">
                {activeContent ? (
                  summaryLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Loader className="animate-spin text-indigo-600 w-8 h-8 mb-3" />
                      <p className="text-xs text-slate-500">Gemini is drafting study notes...</p>
                    </div>
                  ) : aiSummary ? (
                    <div className="bg-slate-55 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner animate-fade-in space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">AI Study Guide</span>
                        <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[50%]">{activeContent.data.title}</span>
                      </div>
                      <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                        {aiSummary}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-30 animate-pulse" />
                      <p className="text-xs text-slate-500 mb-4 font-medium">Draft a conceptual study guide for this lesson.</p>
                      <button
                        onClick={fetchAiSummary}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        Generate AI Summary
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs bg-white">
                    Select a lesson to generate its study guide.
                  </div>
                )}
              </div>
            )}

            {sidebarTab === "notes" && (
              <div className="h-full flex flex-col gap-3 animate-fade-in bg-white">
                {activeContent ? (
                  <>
                    <div className="flex justify-between items-center pl-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[90%]">Lesson Notes ({activeContent.data.title})</span>
                    </div>
                    <textarea
                      value={studyNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Type notes for this lesson... Saved instantly."
                      className="w-full flex-1 p-4 text-xs bg-slate-55 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-slate-705 text-slate-700 resize-none font-medium h-[calc(100vh-320px)] lg:h-full min-h-[250px]"
                    />
                  </>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs bg-white">
                    Select a lesson to record your study notes.
                  </div>
                )}
              </div>
            )}

            {sidebarTab === "guidance" && (
              <div className="h-full flex flex-col animate-fade-in bg-white border border-slate-100 rounded-2xl overflow-hidden h-[calc(100vh-270px)] lg:h-[calc(100vh-220px)]">
                {/* Guidance Header */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-750 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" />
                  <span>Instructor: {selectedCourse.instructorId?.name || "Expert Guide"}</span>
                </div>

                {/* Message list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40 custom-scrollbar">
                  {guidanceMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[11px] font-medium leading-relaxed px-4">
                      Stuck somewhere? Ask your instructor for guidance. Voice replies are supported!
                    </div>
                  ) : (
                    guidanceMessages.map(msg => {
                      const isMe = msg.sender?._id === userInfo._id || msg.sender === userInfo._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] shadow-sm leading-relaxed ${
                            isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}>
                            {msg.voiceUrl ? (
                              <div className="py-0.5">
                                <audio src={msg.voiceUrl} controls className="max-w-full outline-none" style={{ height: '28px', minWidth: '150px' }} />
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                            <span className={`block text-[8px] text-right mt-1 font-light ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input block */}
                <form onSubmit={handleSendGuidanceText} className="p-2 border-t border-slate-200 bg-white flex gap-1.5 items-center">
                  {isGuidanceRecording ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 border border-red-100 bg-red-50 text-red-700 rounded-xl text-[10px] font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping shrink-0" />
                        Recording...
                      </span>
                      <div className="flex gap-0.5 items-center h-4">
                        <span className="w-0.5 bg-red-500 rounded-full animate-wave-1" style={{ height: '4px' }} />
                        <span className="w-0.5 bg-red-500 rounded-full animate-wave-2" style={{ height: '12px' }} />
                        <span className="w-0.5 bg-red-500 rounded-full animate-wave-3" style={{ height: '6px' }} />
                        <span className="w-0.5 bg-red-500 rounded-full animate-wave-4" style={{ height: '10px' }} />
                      </div>
                      <button type="button" onClick={handleStopGuidanceRecord} className="p-1 bg-red-600 text-white rounded-lg cursor-pointer">
                        <Square size={10} className="fill-white" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ask for guidance..."
                      value={guidanceInput}
                      onChange={(e) => setGuidanceInput(e.target.value)}
                      className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none bg-slate-55 bg-slate-50 focus:bg-white"
                    />
                  )}

                  {!isGuidanceRecording && (
                    <button type="button" onClick={handleStartGuidanceRecord} className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl cursor-pointer" title="Record Voice">
                      <Mic size={14} />
                    </button>
                  )}

                  {!isGuidanceRecording && (
                    <button type="submit" disabled={!guidanceInput.trim()} className="p-2 bg-indigo-605 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                      <Send size={14} />
                    </button>
                  )}
                </form>
              </div>
            )}

            {sidebarTab === "feedback" && (
              <div className="h-full flex flex-col gap-4 animate-fade-in bg-white p-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pl-1">Course Experience Review</h4>

                {existingFeedback && !isEditingFeedback ? (
                  /* Read Only Submitted View */
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        existingFeedback.liked ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {existingFeedback.liked ? (
                          <><ThumbsUp size={14} className="fill-green-600" /> Endorsed</>
                        ) : (
                          <><ThumbsDown size={14} className="fill-red-600" /> Disliked</>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(existingFeedback.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wide block">Your Comments</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{existingFeedback.text}</p>
                    </div>

                    {existingFeedback.voiceUrl && (
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wide block">Voice review</span>
                        <audio src={existingFeedback.voiceUrl} controls className="w-full mt-1.5" style={{ height: '36px' }} />
                      </div>
                    )}

                    <button
                      onClick={() => setIsEditingFeedback(true)}
                      className="w-full py-2.5 bg-white border border-slate-200 text-indigo-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      Update Review
                    </button>
                  </div>
                ) : (
                  /* Form Submission View */
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    {/* Thumbs Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Do you like this course?</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFeedbackLiked(true)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                            feedbackLiked === true
                              ? 'bg-green-55 bg-green-50 border-green-500 text-green-700 font-black shadow-sm'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <ThumbsUp size={16} className={feedbackLiked === true ? 'fill-green-600' : ''} /> Liked
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedbackLiked(false)}
                          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                            feedbackLiked === false
                              ? 'bg-red-50 border-red-500 text-red-705 text-red-700 font-black shadow-sm'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <ThumbsDown size={16} className={feedbackLiked === false ? 'fill-red-600' : ''} /> Disliked
                        </button>
                      </div>
                    </div>

                    {/* Text review comments */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Suggestions for Improvement</label>
                      <textarea
                        placeholder="What did you like or dislike? How can we make it better?"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none text-slate-700 resize-none font-medium h-24"
                      />
                    </div>

                    {/* Voice Feedback Widget */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-205">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Voice review attachment</span>
                      
                      {isFeedbackRecording ? (
                        <div className="flex items-center justify-between py-1 px-2.5 border border-red-100 bg-white text-red-700 rounded-lg text-xs font-bold">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                            Recording feedback...
                          </span>
                          <button type="button" onClick={handleStopFeedbackRecord} className="p-1 bg-red-600 text-white rounded cursor-pointer">
                            <Square size={10} className="fill-white" />
                          </button>
                        </div>
                      ) : feedbackVoiceUrl ? (
                        <div className="space-y-2">
                          <audio src={feedbackVoiceUrl} controls className="w-full" style={{ height: '32px' }} />
                          <button
                            type="button"
                            onClick={() => setFeedbackVoiceUrl("")}
                            className="text-[10px] text-red-655 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            🗑️ Delete Voice Recording
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartFeedbackRecord}
                          className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Mic size={14} className="text-red-500 animate-pulse" /> Record Voice Feedback
                        </button>
                      )}
                    </div>

                    {/* Form Controls */}
                    <div className="flex gap-2 pt-2">
                      {existingFeedback && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingFeedback(false);
                            setFeedbackLiked(existingFeedback.liked);
                            setFeedbackText(existingFeedback.text);
                            setFeedbackVoiceUrl(existingFeedback.voiceUrl);
                          }}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={feedbackLiked === null || (!feedbackText.trim() && !feedbackVoiceUrl)}
                        className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🌟 GAMIFICATION XP/BADGE ALERT TOAST */}
        {xpAlert.show && (
          <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-3 max-w-sm animate-fade-in text-white">
            {xpAlert.amount > 0 && (
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-500/30">
                <div className="bg-white/20 p-2 rounded-xl text-white">
                  <Sparkles size={16} className="animate-spin-slow" />
                </div>
                <div>
                  <p className="text-sm font-black">+{xpAlert.amount} XP Gained!</p>
                  <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Level progression updated</p>
                </div>
              </div>
            )}
            {xpAlert.badge && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30">
                <div className="bg-white/20 p-2 rounded-xl text-white">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-sm font-black">New Medallion Unlocked! 🏆</p>
                  <p className="text-xs font-bold text-emerald-100">{xpAlert.badge}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- CALCULATIONS FOR OVERVIEW & ANALYTICS ---
  const completedLessonsCount = completedItems.length;
  
  let avgProgress = 0;
  if (enrolledCourses.length > 0) {
    const totalProgress = enrolledCourses.reduce((sum, course) => sum + calculateProgress(course), 0);
    avgProgress = Math.round(totalProgress / enrolledCourses.length);
  }

  const categories = [
    "Web Development",
    "Data Structures & Algorithms",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "Mobile Development",
    "Data Science"
  ];
  
  const categoryCompletion = {};
  categories.forEach(cat => { categoryCompletion[cat] = 0; });
  
  enrolledCourses.forEach(course => {
    const cat = course.category || "Web Development";
    if (course.lectures) {
      course.lectures.forEach(sec => {
        const items = [...(sec.videos || []), ...(sec.resources || []), ...(sec.links || [])];
        items.forEach(item => {
          if (completedItems.includes(item._id)) {
            categoryCompletion[cat] = (categoryCompletion[cat] || 0) + 1;
          }
        });
      });
    }
  });

  const radarChartData = categories.map(cat => ({
    subject: cat.length > 12 ? `${cat.substring(0, 10)}...` : cat,
    A: categoryCompletion[cat] || 0,
    fullMark: 10
  }));

  const courseProgressData = enrolledCourses.map(course => ({
    name: course.title.length > 18 ? `${course.title.substring(0, 16)}...` : course.title,
    progress: calculateProgress(course)
  }));

  const baseMinutes = [30, 45, 15, 60, 45, 90, 45];
  const studyMinutesData = [
    { day: "Mon", minutes: baseMinutes[0] + (completedLessonsCount % 3) * 10 },
    { day: "Tue", minutes: baseMinutes[1] + (completedLessonsCount % 4) * 10 },
    { day: "Wed", minutes: baseMinutes[2] + (completedLessonsCount % 2) * 10 },
    { day: "Thu", minutes: baseMinutes[3] + (completedLessonsCount % 5) * 10 },
    { day: "Fri", minutes: baseMinutes[4] + (completedLessonsCount % 6) * 10 },
    { day: "Sat", minutes: baseMinutes[5] + (completedLessonsCount % 7) * 10 },
    { day: "Sun", minutes: baseMinutes[6] + (completedLessonsCount % 8) * 10 }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed z-30 top-0 left-0 h-screen bg-slate-900 text-white w-64 p-6 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative shadow-2xl`}>
        <div className="mb-10 flex justify-between items-center">
          <div className="font-bold text-xl flex items-center gap-2 text-indigo-400">
            <LayoutDashboard size={24} /> <span>Student Arena</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Tab 1: Overview */}
          <button
            onClick={() => { setActiveDashboardTab("dashboard"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeDashboardTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} /> <span>Overview & Analytics</span>
          </button>

          {/* Tab 2: My Arena */}
          <button
            onClick={() => { setActiveDashboardTab("courses"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeDashboardTab === "courses"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BookOpen size={20} /> <span>My Learning Arena</span>
          </button>

          {/* Tab 3: Achievements & Skills */}
          <button
            onClick={() => { setActiveDashboardTab("profile"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-semibold cursor-pointer ${
              activeDashboardTab === "profile"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Award size={20} /> <span>Medallions & Skills</span>
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
        
        {/* Top Header Row */}
        <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center z-10 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-655 hover:text-indigo-600 transition" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeDashboardTab === 'dashboard' ? 'Overview & Analytics' : activeDashboardTab === 'courses' ? 'My Learning Arena' : 'Achievements & Skills'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 text-xs font-black shadow-sm" title="Daily Streak">
              <Flame size={14} className="fill-orange-500 animate-pulse" />
              <span>{userInfo?.streak || 0}-Day Streak</span>
            </div>

            {/* Level Badge */}
            <div className="flex flex-col items-end hidden sm:flex">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-605 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-black">
                  Lvl {Math.floor((userInfo?.xp || 0) / 1000) + 1}
                </span>
                <span className="text-xs font-bold text-slate-500">{(userInfo?.xp || 0) % 1000}/1000 XP</span>
              </div>
              <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 border border-slate-200 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${((userInfo?.xp || 0) % 1000) / 10}%` }}></div>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">{userInfo?.name}</p>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Student Learner</p>
            </div>

            {/* Dropdown Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="focus:outline-none flex items-center"
              >
                {userInfo?.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt={userInfo.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-md cursor-pointer hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Student')}&background=random&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-605 flex items-center justify-center text-white font-black text-xl shadow-md uppercase hover:scale-105 transition duration-300 cursor-pointer">
                    {userInfo?.name?.charAt(0) || "L"}
                  </div>
                )}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-750 font-bold transition flex items-center gap-2"
                  >
                    <Home size={14} /> Catalog Home
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-655 hover:bg-red-50 font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Body */}
        <main className="p-8 overflow-y-auto bg-slate-50 flex-1 relative">
          <div className="max-w-7xl mx-auto animate-fade-in">
            
            {activeDashboardTab === "dashboard" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Dashboard Title */}
                <div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight mb-2">Academic Overview</h2>
                  <p className="text-slate-500 font-semibold">Track your training metrics, course completions, and skills strengths.</p>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* KPI 1: Level progress */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Academic Level</p>
                      <h3 className="text-2xl font-black text-slate-808 font-extrabold">Lvl {Math.floor((userInfo?.xp || 0) / 1000) + 1}</h3>
                      <p className="text-[10px] text-indigo-605 font-bold">{(userInfo?.xp || 0) % 1000}/1000 XP to Next Lvl</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Trophy size={22} className="fill-indigo-100" />
                    </div>
                  </div>

                  {/* KPI 2: Active Streak */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Daily Streak</p>
                      <h3 className="text-2xl font-black text-slate-805 font-extrabold">{userInfo?.streak || 0}-Day Streak</h3>
                      <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                        <Flame size={10} className="fill-orange-500" /> Daily learning commitment
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Flame size={22} className="fill-orange-100" />
                    </div>
                  </div>

                  {/* KPI 3: Total XP Points */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Cumulative Score</p>
                      <h3 className="text-2xl font-black text-slate-800 font-extrabold">{(userInfo?.xp || 0).toLocaleString()} XP</h3>
                      <p className="text-[10px] text-emerald-600 font-bold">From lectures & examinations</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Sparkles size={22} className="fill-emerald-100" />
                    </div>
                  </div>

                  {/* KPI 4: Course completions / Avg completion */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition group">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Average Progress</p>
                      <h3 className="text-2xl font-black text-slate-800 font-extrabold">{avgProgress}% Done</h3>
                      <p className="text-[10px] text-purple-600 font-bold">Across {enrolledCourses.length} active quests</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <BookOpen size={22} className="fill-purple-100" />
                    </div>
                  </div>
                </div>

                {/* Row 1: Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Study Minutes consistency (Bar chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-black text-slate-805 mb-6 flex items-center gap-2">
                      <TrendingUp size={16} className="text-indigo-600" /> Learning Activity (Study Minutes)
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studyMinutesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }} />
                          <Bar dataKey="minutes" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Skills radar distribution */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <h3 className="text-sm font-black text-slate-805 mb-4 flex items-center gap-2">
                      <Brain size={16} className="text-indigo-600" /> Skill Strength Matrix
                    </h3>
                    {completedLessonsCount === 0 ? (
                      <div className="h-[220px] flex items-center justify-center text-xs text-slate-400 font-medium italic text-center p-4">
                        Unlock skill strength metrics by completing course lectures!
                      </div>
                    ) : (
                      <div className="h-[220px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                            <PolarGrid stroke="#F1F5F9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#64748B', fontWeight: '600' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="Completions" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold text-center block pt-2">LMS category lesson distribution</span>
                  </div>
                </div>

                {/* Row 2: Course Progress Comparisons & Peer Scoreboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Course list progress */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-black text-slate-850 mb-6 flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-600" /> Active Course Blueprints
                    </h3>
                    {enrolledCourses.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 font-medium italic text-xs">No active quests enrolled.</div>
                    ) : (
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={courseProgressData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748B', fontWeight: '600' }} axisLine={false} tickLine={false} width={110} />
                            <Tooltip contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }} />
                            <Bar dataKey="progress" fill="#10B981" radius={[0, 6, 6, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Leaderboard Scoreboard Panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-850 flex items-center gap-2">
                      <Award size={16} className="text-amber-500" /> Global Peer Arena
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: "Arnab Sen", xp: 4850, avatar: "AS", active: false, rank: 1 },
                        { name: "Sahitya Bagchi", xp: 3920, avatar: "SB", active: false, rank: 2 },
                        { name: "Rishav Ghosh", xp: 3100, avatar: "RG", active: false, rank: 3 },
                        { name: userInfo?.name || "You", xp: userInfo?.xp || 0, avatar: "ME", active: true, rank: 4 },
                        { name: "Devansh Darnal", xp: 2250, avatar: "DD", active: false, rank: 5 }
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition ${item.active ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-slate-50/30 border-transparent hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded-full ${item.rank === 1 ? 'bg-amber-100 text-amber-700' : item.rank === 2 ? 'bg-slate-100 text-slate-700' : item.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                              {item.rank}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${item.active ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                              {item.avatar}
                            </div>
                            <span className={`text-xs ${item.active ? 'font-black text-indigo-900' : 'font-semibold text-slate-700'}`}>{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-800">{item.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeDashboardTab === "courses" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight mb-2">My Learning Arena</h2>
                  <p className="text-slate-500 font-semibold">Your active quests and ongoing training blueprints.</p>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
                    <div className="bg-indigo-50 p-6 rounded-full mb-6 border border-indigo-100">
                      <BookOpen className="w-16 h-16 text-indigo-600 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black mb-3 text-slate-800">Your journey has not yet begun</h2>
                    <p className="text-slate-500 mb-8 max-w-md font-medium text-lg">The arena awaits. Discover new skills and begin your professional training.</p>
                    <Link to="/courses" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition duration-300">Browse Course Catalog</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((course) => {
                      const prog = calculateProgress(course);
                      return (
                        <div key={course._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-indigo-400 hover:shadow-2xl transition duration-300 shadow-md group flex flex-col">
                          
                          {/* Thumbnail */}
                          <div className="h-48 relative overflow-hidden bg-slate-100">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-505 opacity-90 group-hover:opacity-100" />
                            <button onClick={(e) => handleUnenroll(course._id, e)} className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-500 hover:text-red-655 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-200 hover:border-red-200 cursor-pointer shadow" title="Drop Course">
                              <Trash2 size={16} />
                            </button>
                            <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-wide shadow-sm border border-indigo-50">
                              {course.category || "General"}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-805 mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 transition duration-300 min-h-[44px]">{course.title}</h3>
                            
                            <div className="mb-6 mt-auto">
                              <div className="flex justify-between text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">
                                <span>Mastery Progress</span>
                                <span className={prog === 100 ? "text-amber-600 font-black" : "text-indigo-600 font-black"}>{prog}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner border border-slate-100 overflow-hidden">
                                <div className={`h-2 rounded-full transition-all duration-700 ${prog === 100 ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width: `${prog}%` }}></div>
                              </div>
                            </div>

                            {prog === 100 ? (
                              passedExams.includes(course._id) ? (
                                <button
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setCompletedCourseName(course.title);
                                    setShowTrophy(true);
                                  }}
                                  className="w-full py-3.5 rounded-xl font-bold transition duration-300 flex items-center justify-center gap-2 shadow bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                >
                                  <Trophy size={18} /> Claim Certificate
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    fetchFinalExam(course);
                                  }}
                                  className="w-full py-3.5 rounded-xl font-bold transition duration-300 flex items-center justify-center gap-2 shadow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer"
                                >
                                  <Brain size={18} /> Take Final Exam
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => handleStartCourse(course)}
                                className="w-full py-3.5 rounded-xl font-bold transition duration-300 flex items-center justify-center gap-2 shadow bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-750 text-white cursor-pointer"
                              >
                                <PlayCircle size={18} /> Resume Quest
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeDashboardTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Achievements Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Award className="text-violet-600 w-5 h-5" />
                    My Medallions
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Earn these honors by completing training milestones.</p>
                  <div className="flex flex-wrap justify-start gap-x-6 gap-y-6 pt-2 pl-2">
                    {badgeList.map((badge) => {
                      const isUnlocked = userInfo?.badges?.includes(badge.id);
                      const IconComponent = badge.icon;
                      return (
                        <div
                          key={badge.id}
                          className={`flex flex-col items-center group transition duration-350 ${isUnlocked ? 'scale-100 opacity-100 hover:scale-110' : 'scale-95 opacity-30 hover:opacity-45'}`}
                          title={`${badge.name}: ${badge.requirement} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
                        >
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            {/* Ribbons */}
                            <svg
                              className={`absolute -bottom-3.5 w-8 h-8 z-0 drop-shadow-sm transition-colors duration-300 ${isUnlocked ? badge.ribbonColor : 'text-slate-300'}`}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M 6 0 L 11 0 L 8 16 L 5 13 L 2 16 Z" />
                              <path d="M 11 0 L 16 0 L 19 16 L 16 13 L 13 16 Z" />
                            </svg>
                            {/* Circle */}
                            <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center border-4 shadow bg-white transition-all duration-300 ${isUnlocked ? `${badge.activeRing} ${badge.color}` : 'border-slate-200 text-slate-400'}`}>
                              <IconComponent size={18} />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-5 text-center truncate w-14">{badge.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills Tag Editor Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-emerald-600 w-5 h-5" />
                    My Skills Blueprint
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Declare your programming focus to tailor suggestions.</p>

                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. JavaScript"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      className="flex-grow px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none text-slate-800"
                    />
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer">
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {userSkills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No skills listed. Adding tags unlocks AI course path advisor.</span>
                    ) : (
                      userSkills.map((skill, idx) => (
                        <span key={idx} className="flex items-center gap-1 bg-emerald-50/50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm hover:scale-105 transition-all">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-emerald-600 hover:text-red-655 font-black ml-0.5">
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Advice Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-205 shadow-md space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Brain className="text-indigo-600 w-5 h-5 animate-pulse" />
                    AI Path Recommendations
                  </h3>

                  {recsLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader className="animate-spin text-indigo-600 w-8 h-8 mb-2" />
                      <p className="text-xs text-slate-400 font-semibold">Consulting AI advisor...</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-6 text-slate-405 text-xs italic">
                      No advisory matches. Add more skills to get course recommendations!
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-indigo-50/70 space-y-3 hover:border-indigo-200 transition duration-300">
                          <div className="flex gap-3">
                            <img src={rec.course.thumbnail} alt={rec.course.title} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                            <div className="flex-grow min-w-0">
                              <h4 className="text-xs font-black text-slate-800 truncate leading-snug">{rec.course.title}</h4>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                                {rec.course.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                            <strong>AI:</strong> {rec.reason}
                          </p>
                          <button
                            onClick={() => navigate(`/courses`)}
                            className="w-full py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold rounded-lg text-[10px] border border-indigo-100 hover:border-transparent transition duration-300 cursor-pointer"
                          >
                            View Course Card
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* 🌟 GAMIFICATION XP/BADGE ALERT TOAST */}
      {xpAlert.show && (
        <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-3 max-w-sm animate-fade-in text-white">
          {xpAlert.amount > 0 && (
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-500/30">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Sparkles size={16} className="animate-spin-slow" />
              </div>
              <div>
                <p className="text-sm font-black">+{xpAlert.amount} XP Gained!</p>
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Level progression updated</p>
              </div>
            </div>
          )}
          {xpAlert.badge && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Award size={16} />
              </div>
              <div>
                <p className="text-sm font-black">New Medallion Unlocked! 🏆</p>
                <p className="text-xs font-bold text-emerald-100">{xpAlert.badge}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;