import React, { useEffect, useState } from 'react';
import Header from './Header';
import {
  Box, Typography, Grid, Button, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import Snackbar from '@mui/material/Snackbar';

const RoomDetails = () => {
  const location = useLocation();
  // Get booking params if coming from Room Suggestions
  const suggestionParams = location.state?.parsedResult || {};

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: suggestionParams.date || dayjs().format('YYYY-MM-DD'),
    from: suggestionParams.starttime || '',
    to: suggestionParams.endtime || '',
    capacity: suggestionParams.capacity || '',
    equipment: suggestionParams.equipment || '',
    roomName: '',
  });
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dateError, setDateError] = useState('');
  const [capacityError, setCapacityError] = useState('');
  const [success, setSuccess] = useState(false);

  const roomImages = [
    '/rooms/modern-classroom.jpg',
    '/rooms/lecture-hall.jpg',
    '/rooms/meeting-room.jpg',
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/rooms/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBook = (room) => {
    // Validate date: must be today or in the future, and year must be 4 digits
    const today = dayjs().startOf('day');
    const selected = dayjs(form.date);
    let valid = true;
    if (!selected.isValid() || selected.isBefore(today) || form.date.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setDateError('Please select a valid date (today or future, 4-digit year).');
      valid = false;
    } else {
      setDateError('');
    }
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) <= 0) {
      setCapacityError('Capacity must be a positive number.');
      valid = false;
    } else {
      setCapacityError('');
    }
    if (!valid) return;
    setSelectedRoom(room);
    setForm((prev) => ({ ...prev, roomName: room.name }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRoom(null);
  };

  const handleConfirm = () => {
    // Simulate booking (no backend yet)
    setOpen(false);
    setSelectedRoom(null);
    setSuccess(true);
    setForm({
      date: dayjs().format('YYYY-MM-DD'),
      from: '',
      to: '',
      capacity: '',
      equipment: '',
      roomName: '',
    });
    // Optionally, show a snackbar or redirect
  };

  if (loading) return <div><Header /><Box p={4}><Typography>Loading room details...</Typography></Box></div>;
  if (!rooms.length) return <div><Header /><Box p={4}><Typography>No room details found.</Typography></Box></div>;

  return (
    <div>
      <Header />
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h5" mb={2}>Room Details</Typography>
        <Box sx={{ maxWidth: 900, width: '100%' }}>
          {rooms.map((room) => {
            // Randomly pick an image for each room
            const imgSrc = roomImages[Math.floor(Math.random() * roomImages.length)];
            return (
              <Paper key={room.id} sx={{ mb: 4, p: 3, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <img
                    src={imgSrc}
                    alt={room.name}
                    style={{ width: '100%', maxWidth: 700, height: 'auto', borderRadius: 8, marginBottom: 16 }}
                  />
                </Box>
                <Grid container spacing={2} sx={{ bgcolor: '#e0e0e0', borderRadius: 2, mt: 1, p: 2 }}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Building D, 1st floor<br />
                      Room Name: {room.name}<br />
                      Capacity: up to {room.capacity} people
                    </Typography>
                    <Typography variant="body2" mt={2}>
                      A spacious and modern meeting room designed for mid-sized groups.<br />
                      Features include a whiteboard, TV, and a high-quality conference sound system. Ideal for presentations, workshops, and collaborative meetings.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box component="form" display="flex" flexDirection="column" gap={2}>
                      <TextField
                        label="Start Date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        inputProps={{ min: dayjs().format('YYYY-MM-DD'), pattern: '\\d{4}-\\d{2}-\\d{2}' }}
                        error={!!dateError}
                        helperText={dateError}
                      />
                      <Box display="flex" gap={1}>
                        <TextField
                          label="From"
                          name="from"
                          type="time"
                          value={form.from}
                          onChange={handleInputChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                        <TextField
                          label="To"
                          name="to"
                          type="time"
                          value={form.to}
                          onChange={handleInputChange}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                        />
                      </Box>
                      <TextField
                        label="Capacity"
                        name="capacity"
                        type="number"
                        value={form.capacity}
                        onChange={handleInputChange}
                        fullWidth
                        inputProps={{ min: 1 }}
                        error={!!capacityError}
                        helperText={capacityError}
                      />
                      <TextField
                        label="Equipment"
                        name="equipment"
                        value={form.equipment}
                        onChange={handleInputChange}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#7fd0f7', color: '#222', mt: 2, width: '100%' }}
                        onClick={() => handleBook(room)}
                      >
                        BOOK NOW
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Booking Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedRoom && (
                <>
                  You are about to book <b>{selectedRoom.name}</b> on <b>{form.date}</b> from <b>{form.from}</b> to <b>{form.to}</b>.<br />
                  Capacity: {form.capacity}<br />
                  Equipment: {form.equipment}
                </>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleConfirm} variant="contained">Confirm</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          message="Booking confirmed!"
        />
      </Box>
    </div>
  );
};

export default RoomDetails;
