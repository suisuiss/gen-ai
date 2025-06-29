// routes/bookings.js
const express = require('express');
const router = express.Router();
const Room = require('../models/room');

// Helper to detect overlap
function overlaps(b, date, from, to) {
    // only bookings on the same date can overlap
    if (b.date !== date) return false;
    return !(to <= b.from || from >= b.to);
}

// routes/bookings.js
router.post('/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const { date, from, to } = req.body;
    if (!date || !from || !to) {
        return res.status(400).json({ error: 'date, from & to required' });
    }

    const room = await Room.findOneAndUpdate(
        {
            _id: roomId,
            // only update if NO existing booking on this date overlaps
            bookings: {
                $not: {
                    $elemMatch: {
                        date,
                        from: { $lt: to },  // existing start before new end
                        to: { $gt: from }   // existing end   after new start
                    }
                }
            }
        },
        { $push: { bookings: { date, from, to } } },
        { new: true }
    );

    if (!room) {
        // either not found or atomic check failed
        return res.status(409).json({ error: 'Time slot already booked' });
    }

    res.json({ success: true, room });
});
  

module.exports = router;
