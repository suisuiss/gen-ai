const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export a function to call Gemini
async function askGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Adjust version as needed
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return response.trim();
}

module.exports = { askGemini };
// This module initializes the Gemini AI client with the API key from environment variables