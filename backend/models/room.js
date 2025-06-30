// models/Room.js
const mongoose = require('mongoose');
const generateDescription = require('../lib/generateDescription');
const { validateDescription } = require('../lib/validateDescription');

const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },     // “YYYY-MM-DD”
    from: { type: String, required: true },     // “HH:mm”
    to: { type: String, required: true },     // “HH:mm”
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    roomType: { type: String, required: true },
    capacity: { type: Number, required: true },
    equipment: [String],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    photoURL: String,
    building: { type: String, default: '' },
    floor: { type: String, default: '' },
    description: { type: String, default: '' },
    bookings: [bookingSchema]
}, { timestamps: true });

roomSchema.pre('save', async function (next) {
    // regenerate whenever description is empty or key fields change
    if (!this.description ||
        this.isModified('roomName') ||
        this.isModified('roomType') ||
        this.isModified('capacity') ||
        this.isModified('equipment') ||
        this.isModified('building') ||
        this.isModified('floor') ||
        this.isModified('status')) {
        let draft, result;
        const maxAttempts = 5;
        let attempt = 0;

        do {
            attempt++;
            try {
                // 1) generate a new draft
                draft = await generateDescription(this);
                console.log(`🔄 Attempt ${attempt}: draft generated`);
                // 2) validate it
                result = await validateDescription(draft, this);
                if (!result.ok) {
                    console.warn(`⚠️ Validation failed (attempt ${attempt}):`, result.issues);
                }
            } catch (err) {
                console.error(`✍️ Error on attempt ${attempt}:`, err);
                result = { ok: false, issues: [err.message] };
            }
        } while (!result.ok && attempt < maxAttempts);

        if (result.ok) {
            console.log(`✅ Description accepted on attempt ${attempt}`);
            this.description = draft;
        } else {
            console.error(`❌ All ${maxAttempts} attempts failed. Leaving description blank.`);
            // Optionally throw to block the save:
            // throw new Error('Unable to generate valid description');
        }
    }
    next();
});

//module.exports = mongoose.model('Room', roomSchema);
