import React, { useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from 'date-fns/format';

const RoomSuggestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const parsedResult = location.state?.parsedResult || {};

  const [date, setDate] = useState(parsedResult.date ? new Date(parsedResult.date) : null);
  const [fromTime, setFromTime] = useState(parsedResult.starttime ? new Date(`1970-01-01T${parsedResult.starttime}:00`) : null);
  const [toTime, setToTime] = useState(parsedResult.endtime ? new Date(`1970-01-01T${parsedResult.endtime}:00`) : null);
  const [capacity, setCapacity] = useState(parsedResult.capacity || '');
  const [equipment, setEquipment] = useState(parsedResult.equipment || '');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);

  const fetchAvailableRooms = async () => {
    if (!date || !fromTime || !toTime) return;

    setLoading(true);
    setConflict(false);
    setRooms([]);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const formattedFrom = new Date(`${formattedDate}T${format(fromTime, 'HH:mm')}:00`).toISOString();
      const formattedTo = new Date(`${formattedDate}T${format(toTime, 'HH:mm')}:00`).toISOString();

      console.log('Sending request to backend:', {
        formattedDate, formattedFrom, formattedTo, capacity, equipment
      });


      const response = await fetch('/api/rooms/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          from: formattedFrom,
          to: formattedTo,
          capacity,
          equipment,
        }),
      });

      const data = await response.json();

      if (data.message === 'Booking conflict. No rooms available.') {
        setConflict(true);
      } else {
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    navigate('/room-details', { state: { room, parsedResult }, });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Room booking suggestions based on your requirements:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <DatePicker
              label="Date"
              value={date}
              onChange={setDate}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TimePicker
              label="From"
              value={fromTime}
              onChange={setFromTime}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TimePicker
              label="To"
              value={toTime}
              onChange={setToTime}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button variant="contained" onClick={fetchAvailableRooms}>
            Get Room Suggestions
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {loading ? (
          <Typography>Loading available rooms...</Typography>
        ) : conflict ? (
          <Typography color="error">
            There is a conflict with previous bookings. Please select a different time slot.
          </Typography>
        ) : rooms.length > 0 ? (
          <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
            {rooms.map((room) => (
              <Card
                key={room.roomName}
                sx={{ display: 'flex', my: 2, bgcolor: '#f3f3f3', cursor: 'pointer' }}
                onClick={() => handleRoomClick(room)}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 250 }}
                  image={room.imageUrl}
                  alt={room.roomName}
                />
                <CardContent>
                  <Typography variant="h5">{room.roomName}</Typography>
                  <Typography variant="body1">Type: {room.roomType}</Typography>
                  <Typography variant="body1">Capacity: {room.capacity}</Typography>
                  <Typography variant="body2">Equipment:</Typography>
                  <ul>
                    {room.equipment.map((eq, index) => (
                      <li key={index}>{eq}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Typography>No rooms available for the selected criteria</Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default RoomSuggestions;
