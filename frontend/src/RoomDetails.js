import React, { useEffect, useState } from 'react';
import Header from './Header';
import {
  Box, Typography, Grid, Button, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
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
        // Select the first room by default if none selected
        if (!selectedRoom && data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
      } catch (err) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
    // eslint-disable-next-line
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
      <Box display="flex" width="100%">
  
        {/* Room Overview (same size header as Room Details) */}
        <Box
          minWidth={350}
          maxWidth={350}
          p={2}
          sx={{
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            height: '100vh',
            bgcolor: '#f5f5f5',
            borderRight: '1px solid #ddd'
          }}
          
        >
          <Typography variant="h5" align="center" mb={2} sx={{ fontSize: '24px', fontFamily: 'Roboto, sans-serif'}}>Room Overview</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '20px' }}>Rooms</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '20px' }}>Capacity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow
                    key={room.id}
                    hover
                    onClick={() => setSelectedRoom(room)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedRoom && selectedRoom.id === room.id ? '#b6f5b6' : undefined,
                    }}
                  >
                    <TableCell sx={{ fontSize: '16px' }}>{room.name}</TableCell>
                    <TableCell sx={{ fontSize: '16px' }}>{room.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
  
        {/* Room Details shifted slightly left */}
        <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="flex-start" sx={{ ml: { xs: 0, md: 'calc(150px + -80px)' } }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontSize: '26px', fontFamily: 'Roboto, sans-serif', ml: 60, fontWeight: 'bold' }}>Room Details</Typography>
          {selectedRoom && (
            <Paper sx={{ p: 6, borderRadius: 4, bgcolor: '#ffffff', width: '100%', maxWidth: 1200 }}>
              {/* Image */}
              <Box display="flex" justifyContent="center">
                <Box
                  component="img"
                  src={roomImages[Math.floor(Math.random() * roomImages.length)]}
                  alt={selectedRoom.name}
                  sx={{ width: '100%', maxWidth: 1200, borderRadius: 4, mb: 2 }}
                />
              </Box>
  
              {/* Description and Booking aligned */}
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} bgcolor="#e0e0e0" p={3} borderRadius={4}>
                <Box flex={1} pr={{ md: 3 }}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '22px' }}>
                    Building D, 1st floor<br />
                    Room Name: {selectedRoom.name}<br />
                    Capacity: up to {selectedRoom.capacity} people
                  </Typography>
                  <Typography sx={{ mt: 4, maxWidth: '600px', fontSize: '18px' }}>
                    A spacious and modern meeting room designed for mid-sized groups. Features include a whiteboard, TV, and a high-quality conference sound system. Ideal for presentations, workshops, and collaborative meetings, providing a comfortable and productive environment for your team or guests.
                  </Typography>
                </Box>
  
                {/* Booking */}
                <Box
                  bgcolor="#d0e9f7"
                  p={3}
                  borderRadius={6}
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  alignItems="center"
                  maxWidth={400}
                  width="100%"
                  mt={{ xs: 3, md: 0 }}
                >
                  <TextField
                    label="Start Date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <Box display="flex" gap={1} width="100%">
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
                    sx={{ bgcolor: '#7fd0f7', fontWeight: 'bold', color: '#222', mt: 1 }}
                    onClick={handleBook}
                    fullWidth
                  >
                    BOOK NOW
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </div>
  );
  
}

export default RoomDetails;
