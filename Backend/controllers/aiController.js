import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Course from "../models/Course.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Free-tier only models — pro has 0 free quota, so excluded
const MODEL_FALLBACK_CHAIN = [
  "gemini-3-flash-preview",        // Best free-tier model right now
  "gemini-3.1-flash-lite-preview", // Lighter, faster fallback
  "gemini-1.5-flash",              // Stable older model, very reliable
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
    
    const user = await User.findById(userId).populate('enrolledCourses');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch all approved courses not enrolled by user
    const availableCourses = await Course.find({
      status: 'approved',
      _id: { $nin: user.enrolledCourses }
    });

    if (availableCourses.length === 0) {
      return res.status(200).json([]);
    }

    const prompt = `You are a professional educational advisor. We want to recommend relevant programming courses to a student.
    
    Student Profile:
    - Declared Skills: ${JSON.stringify(user.skills || [])}
    - Currently Enrolled / Finished Courses: ${user.enrolledCourses.map(c => `"${c.title}" (${c.category})`).join(', ') || 'None'}
    
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