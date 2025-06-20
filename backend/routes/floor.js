// routes/floor.js
const express = require('express');
const router = express.Router();
const Floor = require('../models/floor');

// POST /api/floors - Create a new floor
router.post('/floors', async (req, res) => {
    try {
        const { name, image } = req.body;
        // Create a new Floor document
        const newFloor = new Floor({ name, image });
        await newFloor.save();
        res.status(201).json(newFloor);
    } catch (error) {
        console.error('Error creating floor:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/floors - Get all floors
router.get('/floors', async (req, res) => {
    try {
        const floors = await Floor.find();
        res.status(200).json(floors);
    } catch (error) {
        console.error('Error getting floors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
