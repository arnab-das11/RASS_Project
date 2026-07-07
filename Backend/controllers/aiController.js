import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Course from "../models/Course.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash",              // Active high-performance frontier model (2026)
  "gemini-3.1-flash-lite",         // Active ultra-low latency fallback
  "gemini-2.5-flash"               // Stable active fallback
];

const isRetryableError = (error) => {
  return error?.status === 503 || 
         error?.status === 429 || 
         error?.message?.includes("503") || 
         error?.message?.includes("429");
};

const generateWithFallback = async (genAI, prompt) => {
  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`🧠 Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Success with model: ${modelName}`);
      return result;
    } catch (error) {
      const shouldFallback = isRetryableError(error);
      const isLast = modelName === MODEL_FALLBACK_CHAIN.at(-1);

      if (shouldFallback && !isLast) {
        console.warn(`⚠️ ${modelName} failed (${error?.status}). Trying next model...`);
        await sleep(800);
      } else {
        throw error;
      }
    }
  }
};

export const generateQuiz = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseTitle, lectureTitle } = req.body;

    const prompt = `You are an expert programming tutor. Create a single, highly relevant multiple-choice question to test a student who just watched a video called "${lectureTitle}" in the course "${courseTitle}".
    
    Return ONLY a raw JSON object (no markdown formatting, no backticks). It must follow this exact structure:
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact string of the correct option",
      "hint": "A helpful hint if they get it wrong"
    }`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();

    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    res.status(200).json(JSON.parse(cleanText));

  } catch (error) {
    console.error("❌ AI Quiz Critical Error:", error);

    const status = error?.status;
    const messages = {
      429: "Free API quota exceeded for all available models. Please try again tomorrow or upgrade your plan.",
      503: "All AI models are temporarily overloaded. Please try again in a moment.",
    };

    res.status(status === 429 ? 429 : 503).json({
      message: messages[status] ?? "Failed to generate AI quiz.",
    });
  }
};

export const generateFinalExam = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseTitle, courseDescription, lectureTitles } = req.body;

    const prompt = `You are an expert programming tutor. Create a 10-question multiple-choice final exam to test a student who has completed the course "${courseTitle}".
    The course description is: "${courseDescription}".
    The lectures and modules covered in this course are:
    ${lectureTitles.map((title, idx) => `${idx + 1}. ${title}`).join("\n")}
    
    Create exactly 10 questions of varying difficulties (beginner, intermediate, advanced) covering the course content.
    For each question, provide 4 options.
    
    Return ONLY a raw JSON array of 10 objects (no markdown formatting, no backticks). It must follow this exact structure:
    [
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string of the correct option",
        "hint": "A helpful hint explaining the concept"
      }
    ]`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();

    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    res.status(200).json(JSON.parse(cleanText));

  } catch (error) {
    console.error("❌ AI Final Exam Critical Error:", error);
    res.status(500).json({ message: "Failed to generate AI final exam." });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { userId } = req.body;
    
    const user = await User.findById(userId)
      .populate('enrolledCourses')
      .populate('enrolledCourses.courseId');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all approved courses not enrolled by user
    const enrolledCourseIds = user.enrolledCourses.map(item => {
      if (!item) return null;
      return item.courseId ? item.courseId._id || item.courseId : item._id || item;
    }).filter(Boolean);

    const availableCourses = await Course.find({
      status: 'approved',
      _id: { $nin: enrolledCourseIds }
    });

    if (availableCourses.length === 0) {
      return res.status(200).json([]);
    }

    const enrolledCourseList = user.enrolledCourses.map(item => {
      if (!item) return null;
      const course = item.courseId || item;
      return (course && course.title) ? `"${course.title}" (${course.category || ''})` : null;
    }).filter(Boolean);

    const prompt = `You are a professional educational advisor. We want to recommend relevant programming courses to a student.
    
    Student Profile:
    - Declared Skills: ${JSON.stringify(user.skills || [])}
    - Currently Enrolled / Finished Courses: ${enrolledCourseList.join(', ') || 'None'}
    
    Catalog of Available Courses:
    ${availableCourses.map(c => `- ID: ${c._id}, Title: "${c.title}", Category: "${c.category}", Level: "${c.level}", Description: "${c.description.substring(0, 150)}..."`).join('\n')}
    
    Analyze the student's declared skills and enrolled courses. Select up to 3 courses from the available list that will be the most valuable next steps for their learning path.
    For each recommended course, write a short, encouraging explanation (1-2 sentences) of why it was chosen based on their profile.
    
    Return ONLY a raw JSON array of objects (no markdown, no backticks):
    [
      {
        "courseId": "The recommended course ID",
        "reason": "Personalized explanation of why they should take this course"
      }
    ]`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();
    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    const recommendations = JSON.parse(cleanText);
    const populatedRecommendations = [];

    for (const rec of recommendations) {
      const courseObj = await Course.findById(rec.courseId).populate('instructorId', 'name');
      if (courseObj) {
        populatedRecommendations.push({
          course: courseObj,
          reason: rec.reason
        });
      }
    }

    res.status(200).json(populatedRecommendations);

  } catch (error) {
    console.error("❌ AI Recommendation Critical Error:", error);
    res.status(500).json({ message: "Failed to fetch AI course recommendations." });
  }
};

export const generateVoiceQuestion = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseTitle, lectureTitle, courseDescription } = req.body;

    const prompt = `You are a university professor. We are checking the mastery of a student for the lesson: "${lectureTitle}" in the course: "${courseTitle}".
    Course Description: ${courseDescription}

    Create exactly one (1) extremely simple, short open-ended conceptual question to test if they understood this lesson. 
    The question must be very direct and answerable in a single, short sentence of 5-15 words. Keep it easy and quick.
    
    Return ONLY a raw JSON object (no markdown, no backticks):
    {
      "question": "The question text"
    }`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();
    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    res.status(200).json(JSON.parse(cleanText));
  } catch (error) {
    console.error("❌ Generate Voice Question Error:", error);
    res.status(500).json({ message: "Failed to generate conceptual question." });
  }
};

export const verifyVoiceAnswer = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { question, answer, courseTitle, lectureTitle } = req.body;

    const prompt = `You are a university professor grading an oral exam answer.
    Lesson Context: "${lectureTitle}" in course "${courseTitle}".
    Question: "${question}"
    Student's Answer: "${answer}"

    Grade the student's answer. It should be evaluated very leniently for a live demonstration.
    If the response is conceptually related to the topic, pass it.
    The response is expected to be extremely brief (a single short sentence or phrase of 5-15 words).
    Keep your feedback response very short and concise (maximum 1 sentence of 5-10 words).

    Return ONLY a raw JSON object (no markdown, no backticks):
    {
      "passed": true or false,
      "feedback": "A very brief explanation (1 sentence maximum)."
    }`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();
    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    res.status(200).json(JSON.parse(cleanText));
  } catch (error) {
    console.error("❌ Verify Voice Answer Error:", error);
    res.status(500).json({ message: "Failed to evaluate answer." });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseTitle, lectureTitle, description } = req.body;

    const prompt = `You are a professional educational assistant. Provide a highly polished, detailed study summary of the lesson: "${lectureTitle}" in the course: "${courseTitle}".
    Lesson Details/Description: ${description || "General conceptual guide"}

    Return ONLY a raw JSON object (no markdown, no backticks):
    {
      "summary": "Your detailed summary here. Format with bullet points or numbered lists using newlines where appropriate."
    }`;

    const result = await generateWithFallback(genAI, prompt);
    let responseText = await result.response.text();
    let cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    res.status(200).json(JSON.parse(cleanText));
  } catch (error) {
    console.error("❌ Generate Summary Error:", error);
    res.status(500).json({ message: "Failed to generate lesson summary." });
  }
};