const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Room = require('../models/rooms');
const Booking = require('../models/bookings');

// Helper function to check for booking conflicts
const hasConflict = (existingBooking, requestedStart, requestedEnd) => {
  return (
    (requestedStart < existingBooking.endTime) &&
    (requestedEnd > existingBooking.startTime)
  );
};

const getAvailableRooms = async ({ date, from, to, capacity, equipment }) => {
  const requestedDate = new Date(date);
  const requestedStart = new Date(from);
  const requestedEnd = new Date(to);

  console.log('Incoming request:', { date, from, to, capacity, equipment });
  console.log("Incoming equipment type:", typeof equipment, equipment);


  // Step 1: Find rooms that match capacity and include the equipment
  // Convert all equipment values to lowercase
    const normalizedEquipment = equipment.map(item => item.toLowerCase());
  const matchingRooms = await Room.find({
    capacity: { $gte: capacity },
    equipment: { $all: normalizedEquipment }, // Ensures all requested equipment is included
  });

  console.log('Matching rooms (capacity & equipment):', matchingRooms);

  const availableRooms = [];

  // Step 2: For each matching room, check for booking conflicts
  for (const room of matchingRooms) {
    console.log(`Checking bookings for room: ${room.roomName}`);
    const bookings = await Booking.find({
      roomName: room.roomName,
      startTime: { $lte: requestedEnd },
      endTime: { $gte: requestedStart },
    });

    console.log(`Conflicting bookings for ${room.roomName}:`, bookings);

    const conflict = bookings.some((booking) =>
      hasConflict(booking, requestedStart, requestedEnd)
    );

    if (!conflict) {
      availableRooms.push({
        roomName: room.roomName,
        roomType: room.roomType,
        capacity: room.capacity,
        equipment: room.equipment,
        imageUrl: room.photoURL,
        description: room.description
      });
    }
  }

  console.log('Available rooms after conflict check:', availableRooms);

  return availableRooms;
};

router.post('/available', async (req, res) => {
  const { date, from, to, capacity, equipment } = req.body;

  if (!date || !from || !to || !capacity) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const suggestions = await getAvailableRooms({ date, from, to, capacity, equipment });

    if (suggestions.length === 0) {
      return res.status(200).json({ message: 'Booking conflict. No rooms available.' });
    }

    res.json({ rooms: suggestions });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Unable to fetch available rooms.' });
  }
});

module.exports = router;
