require('dotenv').config();
const fetch = require('node-fetch');
const { toWords } = require('number-to-words');

async function checkEntities(text, room) {
    const missing = [];

    for (let [key, val] of [
        ['roomName', room.roomName],
        ['roomType', room.roomType],
        ['capacity', `${room.capacity}`],
        ['building', room.building],
        ['floor', room.floor]
    ]) {
        if (key === 'capacity') {
            // capacity can appear as "8" or "eight"
            const numeric = String(val);
            const word = toWords(val);       // e.g. "eight"
            const reNum = new RegExp(numeric, 'i');
            const reWord = new RegExp(`\\b${word}\\b`, 'i');
            if (!reNum.test(text) && !reWord.test(text)) {
                missing.push(key);
            }
        }
        else {
            const safe = val.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const re = new RegExp(safe, 'i');
            if (!re.test(text)) {
                missing.push(key);
            }
        }
    }

    return missing;
  }

async function checkGrammar(text) {
    const resp = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `text=${encodeURIComponent(text)}&language=en-US`
    });
    const { matches } = await resp.json();
    return matches; // array of grammar issues
}

// Local Flesch Reading Ease calculation
function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

function calculateReadability(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0).length || 1;
    const words = text.match(/\b\w+\b/g) || [];
    const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

    const wordCount = words.length;
    const fleschReadingEase = 206.835 - (1.015 * (wordCount / sentences)) - (84.6 * (syllables / wordCount));

    return { fleschKincaid: 0, fleschReadingEase: fleschReadingEase.toFixed(1) };
}

async function checkReadability(text) {
    return calculateReadability(text);
}

async function validateDescription(text, room) {
    // 1) Entity check
    const missing = await checkEntities(text, room);
    if (missing.length) {
        return { ok: false, issues: [`Missing fields: ${missing.join(', ')}`] };
    }

    // 2) Grammar check
    const grammarIssues = await checkGrammar(text);
    if (grammarIssues.length > 5) {
        return { ok: false, issues: [`Too many grammar issues (${grammarIssues.length})`] };
    } else {
        console.log(`✅ Grammar check passed (${grammarIssues.length} issues)`);
    }

    // 3) Readability check
    const { fleschReadingEase } = await checkReadability(text);
    if (fleschReadingEase < 50) {
        return { ok: false, issues: [`Low readability score (${fleschReadingEase})`] };
    } else {
        console.log(`✅ Readability check passed (score: ${fleschReadingEase})`);
    }

    return { ok: true, issues: [] };
}
  
module.exports = { validateDescription };
