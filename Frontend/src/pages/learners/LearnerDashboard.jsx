import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, MonitorPlay, ChevronDown, CheckCircle,
  ArrowLeft, Loader, FileText, Link as LinkIcon, ExternalLink,
  Award, Home, Download, Trash2, Trophy, Undo, Sparkles, Brain, XCircle,
  Lock, LogOut, Flame, Compass, Mic
} from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import { CERT_TEMPLATE_BASE64 } from '../../assets/certificateTemplate';

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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [navigate]);

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
            className="px-8 py-3.5 bg-purple-650 hover:bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-purple-900/40 transform hover:-translate-y-0.5"
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
                        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-ping' : 'bg-indigo-650'}`}></span>
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
                          ? 'bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : !voiceAnswer.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
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
                      <p className="text-slate-650 font-medium mb-6 max-w-md mx-auto">Sensational job! You passed the exam with a score of <span className="text-amber-600 font-black">{finalExamResult.score}/10</span>. You are certified!</p>
                      
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
                      <p className="text-slate-650 font-medium mb-4 max-w-md mx-auto">You scored <span className="text-rose-600 font-black">{finalExamResult.score}/10</span>. A minimum score of 7/10 is required to pass.</p>

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
                          <div className="bg-indigo-650 bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((finalExamCurrentIndex + 1) / 10) * 100}%` }}></div>
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
              <p className="text-slate-650 font-medium mb-6">You have successfully mastered <span className="text-amber-600 font-bold">"{completedCourseName}"</span>.</p>

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
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setSidebarTab("curriculum")}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1.5 ${sidebarTab === "curriculum"
                  ? 'border-indigo-600 text-indigo-650 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              📁 Syllabus
            </button>
            <button
              onClick={() => { setSidebarTab("summary"); fetchAiSummary(); }}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1.5 ${sidebarTab === "summary"
                  ? 'border-indigo-600 text-indigo-650 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              🧠 AI Notes
            </button>
            <button
              onClick={() => setSidebarTab("notes")}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1.5 ${sidebarTab === "notes"
                  ? 'border-indigo-600 text-indigo-650 bg-white font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              📝 Notepad
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
                                      : "text-slate-650 font-medium"
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
                                  <FileText size={16} className={activeContent?.data._id === res._id ? "text-emerald-650" : "text-slate-500"} />
                                )}
                                <span className={`text-sm ${locked
                                    ? "text-slate-400 font-medium"
                                    : activeContent?.data._id === res._id
                                      ? "text-emerald-900 font-bold"
                                      : "text-slate-650 font-medium"
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
                                  <LinkIcon size={16} className={activeContent?.data._id === link._id ? "text-purple-650" : "text-slate-500"} />
                                )}
                                <span className={`text-sm ${locked
                                    ? "text-slate-400 font-medium"
                                    : activeContent?.data._id === link._id
                                      ? "text-purple-900 font-bold"
                                      : "text-slate-650 font-medium"
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
                      <Loader className="animate-spin text-indigo-650 w-8 h-8 mb-3" />
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
  }
  // =====================================================================
  // VIEW A: THE DASHBOARD GRID
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-[#F9FAFB] to-[#EEF2F6] text-slate-800 pb-20 font-sans relative overflow-x-hidden">

      <div className="bg-gradient-to-r from-indigo-100/60 via-white to-violet-50/60 border-b border-indigo-100/80 pt-8 pb-16 px-8 relative shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/')} className="text-sm font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 bg-indigo-50 hover:bg-indigo-100/80 px-5 py-2.5 rounded-xl border border-indigo-100 shadow-sm">
              <Home size={16} /> Back to Catalog
            </button>

            <div className="flex items-center gap-6 relative">
              {/* Streak Flame */}
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 text-xs font-black shadow-sm" title="Daily Streak">
                <Flame size={14} className="fill-orange-500 animate-pulse" />
                <span>{userInfo?.streak || 0}-Day Streak</span>
              </div>

              {/* Level and XP indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-indigo-600 font-black tracking-wider uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Lvl {Math.floor((userInfo?.xp || 0) / 1000) + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{(userInfo?.xp || 0) % 1000}/1000 XP</span>
                </div>
                <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${((userInfo?.xp || 0) % 1000) / 10}%` }}></div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-805">{userInfo?.name}</p>
                <p className="text-xs text-indigo-650 font-bold uppercase tracking-wider">Learner</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="focus:outline-none flex items-center"
                >
                  {userInfo?.profilePicture ? (
                    <img
                      src={userInfo.profilePicture}
                      alt={userInfo.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Learner')}&background=random&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm uppercase hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
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
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 via-violet-750 to-violet-750 to-indigo-900">My Learning Arena</h1>
          <p className="text-slate-650 font-medium text-lg">Your active quests and ongoing training.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Enrolled Courses */}
        <div className="flex-grow">
          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="bg-indigo-50 p-6 rounded-full mb-6 border border-indigo-100"><BookOpen className="w-16 h-16 text-indigo-600" /></div>
              <h2 className="text-3xl font-black mb-3 text-slate-850">Your journey has not yet begun</h2>
              <p className="text-slate-500 mb-8 text-center max-w-md font-medium text-lg">The Lands Between await. Discover new skills and begin your training.</p>
              <Link to="/courses" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-lg shadow-sm transform hover:-translate-y-1 transition-all duration-300">Browse Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {enrolledCourses.map((course) => {
                const prog = calculateProgress(course);
                return (
                  <div key={course._id} className="bg-gradient-to-br from-white via-indigo-50/5 to-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 hover:border-indigo-400 hover:shadow-[0_12px_40px_rgba(99,102,241,0.08)] transform hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 shadow-sm group flex flex-col animate-fade-in">
                    <div className="h-52 relative overflow-hidden bg-slate-100">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100" />
                      <button onClick={(e) => handleUnenroll(course._id, e)} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-550 hover:text-red-650 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-200 hover:border-red-200 hover:scale-105 active:scale-95" title="Drop Course">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-850 transition duration-300">{course.title}</h3>
                      <div className="mb-6 mt-auto pt-6">
                        <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                          <span>Progress</span>
                          <span className={prog === 100 ? "text-amber-600 font-black" : "text-indigo-650 font-black"}>{prog}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
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
                            className="w-full py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                          >
                            <Trophy size={20} /> Claim Certificate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              fetchFinalExam(course);
                            }}
                            className="w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            <Brain size={20} /> Take Final Exam
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleStartCourse(course)}
                          className="w-full py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                        >
                          <PlayCircle size={20} /> Resume Training
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Skills & AI Suggestions */}
        <div className="w-full lg:w-80 shrink-0 space-y-8">
          {/* Achievements & Badges Card */}
          <div className="bg-gradient-to-br from-white to-violet-50/30 p-6 rounded-3xl border border-violet-100 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-black text-slate-805 flex items-center gap-2">
              <Award className="text-violet-600 w-5 h-5" />
              My Medallions
            </h3>
            <p className="text-xs text-slate-505 font-medium">Unlock badges by completing training milestones.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 pt-2">
              {badgeList.map((badge) => {
                const isUnlocked = userInfo?.badges?.includes(badge.id);
                const IconComponent = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center group transition-all duration-300 ${isUnlocked ? 'scale-100 opacity-100 hover:scale-110' : 'scale-95 opacity-35 hover:opacity-50'}`}
                    title={`${badge.name}: ${badge.requirement} (${isUnlocked ? 'Unlocked' : 'Locked'})`}
                  >
                    {/* Relative wrapper for circle + ribbons */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      {/* Ribbon tails */}
                      <svg
                        className={`absolute -bottom-3.5 w-8 h-8 z-0 drop-shadow-sm transition-colors duration-300 ${isUnlocked ? badge.ribbonColor : 'text-slate-300'}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M 6 0 L 11 0 L 8 16 L 5 13 L 2 16 Z" />
                        <path d="M 11 0 L 16 0 L 19 16 L 16 13 L 13 16 Z" />
                      </svg>

                      {/* Main Medal Circle */}
                      <div
                        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center border-4 shadow-md bg-white transition-all duration-300 ${isUnlocked
                            ? `${badge.activeRing} ${badge.color}`
                            : 'border-slate-200 text-slate-400'
                          }`}
                      >
                        <IconComponent size={20} className={isUnlocked ? 'animate-pulse-slow' : ''} />
                      </div>
                    </div>

                    {/* Label */}
                    <span className="text-[10px] font-bold text-slate-500 mt-5 text-center truncate w-14">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="text-emerald-600 w-5 h-5" />
              My Skills
            </h3>
            <p className="text-xs text-slate-500 font-medium">Add your expertise to get tailored course suggestions.</p>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HTML"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="flex-grow p-2 text-sm bg-white border border-slate-205 focus:border-emerald-500 rounded-lg outline-none text-slate-800 shadow-inner"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {userSkills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No skills added yet.</span>
              ) : (
                userSkills.map((skill, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-white text-emerald-850 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-150 shadow-sm hover:scale-105 hover:border-emerald-300 transition-all duration-200">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-655 font-black">
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="bg-gradient-to-br from-white to-indigo-50/30 p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Brain className="text-indigo-655 w-5 h-5 animate-pulse" />
              AI Suggestions
            </h3>

            {recsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="animate-spin text-indigo-600 w-8 h-8 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Consulting AI Advisor...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No recommendations available. Try adding more skills or enrolling in courses!
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-indigo-100/60 space-y-3 shadow-sm hover:border-indigo-300 hover:shadow-md transform hover:-translate-y-1 transition duration-300">
                    <div className="flex gap-3">
                      <img src={rec.course.thumbnail} alt={rec.course.title} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate leading-snug">{rec.course.title}</h4>
                        <span className="text-[10px] bg-indigo-55 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                          {rec.course.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-655 leading-relaxed bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30">
                      <strong>AI Reason:</strong> {rec.reason}
                    </p>
                    <button
                      onClick={() => navigate(`/courses`)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-transparent text-indigo-750 hover:text-white font-bold rounded-lg text-xs transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm"
                    >
                      View Course
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default LearnerDashboard;