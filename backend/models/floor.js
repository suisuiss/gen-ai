const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    building: { type: String, required: true },
    image: { type: String, required: true },
});

module.exports = mongoose.model('Floor', floorSchema);
