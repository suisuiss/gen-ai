const express = require("express");
const router = express.Router();
const { askGemini } = require("../utils/gemini");

router.post("/query", async (req, res) => {
  const { query } = req.body;

  const prompt = `
You are a helpful assistant that extracts structured room booking information 
from natural language. Always respond in compact JSON format with only these fields:

{
  "date": "YYYY-MM-DD",
  "starttime": "HH:MM",
  "endtime": "HH:MM",
  "capacity": number,
  "equipment": ["item1", "item2"]
}

If a field is missing in the user request, use null or an empty array (for equipment).
When a future date is asked in words, give the date referring to today's date. Ex. Next Monday date should be the next Monday from today in date format.
No explanation, no extra text.
Query: ${query}
`;

  try {
    const result = await askGemini(prompt);
    res.json({ success: true, parsed: result }); // Expect Gemini to respond with JSON
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ success: false, error: "Gemini query failed" });
  }
});

module.exports = router;
