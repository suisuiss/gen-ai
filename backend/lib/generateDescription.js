const askGemini = require('./askGemini');

async function generateDescription(room) {
    const { roomName, roomType, capacity, equipment, building, floor, status } = room;

    const prompt = `
    Write a brief and easy to understand description of a ${roomType} named "${roomName}".
    
    The description must clearly mention:
    - The room seats exactly ${capacity} people.
    - The room is located on floor ${floor} of ${building}.
    - The room is currently ${status}.
    - The room includes: ${equipment.join(', ')}.

    Use warm language and not too much informal, but make sure these facts appear explicitly.
    `.trim();

    console.log('➡️ Gemini prompt:', prompt);
    const text = await askGemini(prompt);
    console.log('⬅️ Gemini output:', text);
    return text;
}

module.exports = generateDescription;
