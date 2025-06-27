const express = require('express');
const Room = require('../models/room');

const router = express.Router();

// Create a new room
router.post('/', async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();               // triggers LLM + validation hook
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// (Optional) List all rooms
router.get('/', async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

module.exports = router;
