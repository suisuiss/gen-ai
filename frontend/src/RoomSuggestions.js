import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as dateFns from 'date-fns';

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
  Chip,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from 'date-fns/format';
import Header from './Header';

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
        ? equipment
          .toLowerCase()
          .split(/\s*(?:,|and)\s*/)
          .map(e => e.trim())
          .filter(Boolean)
        : equipment;

      const response = await fetch('/api/rooms/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          from: formattedFrom,
          to: formattedTo,
          capacity,
          equipment: eqList
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

  useEffect(() => {
    if (parsedResult.date && parsedResult.starttime && parsedResult.endtime) {
      fetchAvailableRooms();
    }
  }, []);

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
        <Box p={3} sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>

          {/* --- Filter Section --- */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Filter Criteria
          </Typography>

          <Box mt={3} mb={4}>
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
          </Box>

          <Box mb={5}>
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 2,
                fontSize: '1rem',
                backgroundColor: '#31689e',
                '&:hover': {
                  backgroundColor: '#26527d',
                },
              }}
              onClick={fetchAvailableRooms}
            >
              FIND ROOM SUGGESTIONS
            </Button>
          </Box>

          {/* --- Results Section --- */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Results
          </Typography>
          <Divider sx={{ mb: 3 }} />

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
                  sx={{
                    display: 'flex',
                    my: 2,
                    bgcolor: '#f5f5f5',
                    cursor: 'pointer',
                    transition: '0.3s',
                    '&:hover': { boxShadow: 4 }
                  }}
                  onClick={() => handleRoomClick(room)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 250 }}
                    image={room.imageUrl}
                    alt={room.roomName}
                  />
                <CardContent sx={{ flex: 1, px: 3, py: 2 }}>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    }}
  >
    {/* Left: Room Info */}
    <Box sx={{ textAlign: 'left', minWidth: 250 }}>
      <Typography variant="h5" fontWeight="bold">
        {room.roomName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
        Type: {room.roomType}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Capacity: {room.capacity}
      </Typography>
    </Box>

    {/* Equipment Section (moved slightly left, still spaced) */}
    <Box
      sx={{
        ml: 8, // adjusts how far from left side (experiment with 6–10)
        flexGrow: 1,
        textAlign: 'left',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Equipment
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {room.equipment.map((eq, index) => (
          <Chip key={index} label={eq} variant="outlined" size="medium" />
        ))}
      </Box>
    </Box>
  </Box>
</CardContent>


                </Card>
              ))}
            </Box>
          ) : searched ? (
            <Typography>No rooms available for the selected criteria</Typography>
          ) : null}
        </Box>
      </LocalizationProvider>
    </>
  );
};

export default RoomSuggestions;
