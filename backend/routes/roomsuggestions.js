const express = require('express');
const router = express.Router();

// This is a placeholder. Replace it with actual database call.
const getAvailableRooms = async ({ date, from, to, capacity, equipment }) => {
  // Fake example data. Replace with your actual database query.
  const rooms = [
    {
      id: 1,
      name: 'Long Island',
      capacity: 5,
      equipment: ['Whiteboard', 'Projector'],
      available: true,
      imageUrl: '/images/long-island.png',
    },
    {
      id: 2,
      name: 'New York',
      capacity: 15,
      equipment: ['Whiteboard', 'TV Screen'],
      available: true,
      imageUrl: '/images/new-york.png',
    },
  ];

  return rooms.filter((room) => {
    const isCapacityOK = !capacity || room.capacity >= Number(capacity);
    const hasEquipment = !equipment || room.equipment.includes(equipment);
    // In reality, also check for availability using date, from, and to.
    return isCapacityOK && hasEquipment && room.available;
  });
};

router.post('/available', async (req, res) => {
  const { date, from, to, capacity, equipment } = req.body;

  try {
    const availableRooms = await getAvailableRooms({ date, from, to, capacity, equipment });
    res.json({ rooms: availableRooms });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Unable to fetch available rooms.' });
  }
});

module.exports = router;
