const express = require('express');
const router = express.Router();
const Room = require('../models/rooms');  // your Room schema with embedded bookings

// simple overlap test: does [reqStart,reqEnd) overlap [existStart,existEnd)?
const hasConflict = (existStart, existEnd, reqStart, reqEnd) =>
  reqStart < existEnd && reqEnd > existStart;

async function getAvailableRooms({ date, from, to, capacity, equipment }) {
  // parse exactly what your front-end passed:
  const requestedStart = new Date(from);
  const requestedEnd = new Date(to);

  // normalize equipment → array of lowercase strings
  const eqList = (Array.isArray(equipment) ? equipment : [equipment] || [])
    .filter(Boolean)
    .map(e => e.toLowerCase());

  // 1) find all rooms matching capacity/equipment/active
  const matchingRooms = await Room.find({
    status: 'active',
    capacity: { $gte: capacity },
    equipment: { $all: eqList }
  });

  // 2) filter out any room that has at least one embedded booking on "date"
  //    whose time-window overlaps [requestedStart, requestedEnd)
  const available = matchingRooms.filter(room => {
    return !room.bookings
      .filter(b => b.date === date)       // same calendar day
      .some(b => {
        // build each booking’s full Date objects:
        const existStart = new Date(`${b.date}T${b.from}:00`);
        const existEnd = new Date(`${b.date}T${b.to}:00`);
        return hasConflict(existStart, existEnd, requestedStart, requestedEnd);
      });
  });

  // 3) shape the payload exactly as before
  return available.map(r => ({
    roomName: r.roomName,
    roomType: r.roomType,
    capacity: r.capacity,
    equipment: r.equipment,
    imageUrl: r.photoURL,
    description: r.description
  }));
}

router.post('/available', async (req, res) => {
  const { date, from, to, capacity, equipment } = req.body;

  // early validation
  if (!date || !from || !to || !capacity) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const rooms = await getAvailableRooms({ date, from, to, capacity, equipment });

    if (rooms.length === 0) {
      return res
        .status(200)
        .json({ message: 'Booking conflict. No rooms available.' });
    }

    res.json({ rooms });
  } catch (err) {
    console.error('Error fetching available rooms:', err);
    res.status(500).json({ error: 'Unable to fetch available rooms.' });
  }
});

module.exports = router;
