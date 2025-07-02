require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/room');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const res = await Room.updateMany(
        {},
        { $set: { building: '', floor: '', description: '' } }
    );
    console.log(`✅ Updated ${res.modifiedCount} docs`);
    process.exit(0);
}

run();