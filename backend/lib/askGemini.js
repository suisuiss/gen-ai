require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async function askGemini(promptText) {
    // 1) pick a chat model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 2) call generateContent()
    const res = await model.generateContent(promptText);

    // 3) extract the text
    const text = res.response.text();
    return text.trim();
};
