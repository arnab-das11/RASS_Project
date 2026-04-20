import { GoogleGenerativeAI } from "@google/generative-ai";

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