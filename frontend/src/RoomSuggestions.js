import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useLocation, useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import Header from './Header';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';

const inputHeight = { '& .MuiInputBase-root': { height: '56px' } };

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
  const [searched, setSearched] = useState(false);

  const fetchAvailableRooms = async () => {
    if (!date || !fromTime || !toTime) return;
    setLoading(true);
    setConflict(false);
    setRooms([]);
    setSearched(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const formattedFrom = new Date(`${formattedDate}T${format(fromTime, 'HH:mm')}:00`).toISOString();
      const formattedTo = new Date(`${formattedDate}T${format(toTime, 'HH:mm')}:00`).toISOString();
      const eqList = typeof equipment === 'string'
        ? equipment.toLowerCase().split(/\s*(?:,|and)\s*/).map(e => e.trim()).filter(Boolean)
        : equipment;

      const response = await fetch('/api/rooms/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formattedDate, from: formattedFrom, to: formattedTo, capacity, equipment: eqList }),
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

  useEffect(() => {
    if (parsedResult.date && parsedResult.starttime && parsedResult.endtime) {
      fetchAvailableRooms();
    }
  }, [parsedResult.date, parsedResult.starttime, parsedResult.endtime]);

  const handleRoomClick = room => {
    const name = encodeURIComponent(room.roomName);
    navigate(`/room-details/${name}`, {
      state: {
        room,
        date: date?.toISOString().slice(0, 10),
        from: format(fromTime, 'HH:mm'),
        to: format(toTime, 'HH:mm'),
      }
    });
  };

  return (
    <>
      <Header />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', py: 4 }}>
          <Box maxWidth="1000px" mx="auto">

            {/* Filter Section */}
            <Paper elevation={3} sx={{ px: 4, py: 4, mb: 8 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Filter Criteria
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={setDate}
                    slotProps={{
                      textField: { fullWidth: true, sx: inputHeight }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="From"
                    value={fromTime}
                    onChange={setFromTime}
                    slotProps={{
                      textField: { fullWidth: true, sx: inputHeight }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TimePicker
                    label="To"
                    value={toTime}
                    onChange={setToTime}
                    slotProps={{
                      textField: { fullWidth: true, sx: inputHeight }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    fullWidth
                    sx={inputHeight}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={9}>
                  <TextField
                    label="Equipment"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    fullWidth
                    sx={inputHeight}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#3c6e9e',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 1.5,
                      px: 4,
                      height: '56px',
                      '&:hover': { backgroundColor: '#325b82' },
                      width: '100%'
                    }}
                    onClick={fetchAvailableRooms}
                  >
                    ROOM SUGGESTIONS
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Results */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Results
            </Typography>
            {loading ? (
              <Typography>Loading available rooms...</Typography>
            ) : conflict ? (
              <Typography color="error">There is a conflict with previous bookings. Please select a different time slot.</Typography>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <Card
                  key={room.roomName}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    my: 2,
                    px: 2,
                    py: 2,
                    bgcolor: '#fafafa',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 }
                  }}
                  onClick={() => handleRoomClick(room)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 180, height: 140, objectFit: 'cover', borderRadius: 1 }}
                    image={room.imageUrl}
                    alt={room.roomName}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Grid container spacing={10}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h6">{room.roomName}</Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <MeetingRoomIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">{room.roomType}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">Capacity: {room.capacity}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography fontWeight="bold" gutterBottom>
                          Equipment
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {room.equipment.map((eq, index) => (
                            <Chip key={index} label={eq} variant="outlined" size="small" />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : searched ? (
              <Typography>No rooms available for the selected criteria</Typography>
            ) : null}
          </Box>
        </Box>
      </LocalizationProvider>
    </>
  );
};

export default RoomSuggestions;
