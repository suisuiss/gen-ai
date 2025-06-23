import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';

const RoomSuggestions = () => {
  const location = useLocation();
  const parsedResult = location.state?.parsedResult || {};
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const { date, starttime: from, endtime: to, capacity, equipment } = parsedResult;

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!date || !from || !to) return;

      setLoading(true);
      try {
        const response = await fetch('/api/rooms/available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date, from, to, capacity, equipment }),
        });
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableRooms();
  }, [date, from, to, capacity, equipment]);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Room booking suggestions based on your requirements:
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2}>
          <TextField label="Start Date" value={date || ''} fullWidth disabled variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField label="From" value={from || ''} fullWidth disabled variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField label="To" value={to || ''} fullWidth disabled variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField label="Capacity" value={capacity || ''} fullWidth disabled variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Equipment" value={equipment || ''} fullWidth disabled variant="outlined" />
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      {loading ? (
        <Typography>Loading available rooms...</Typography>
      ) : rooms.length > 0 ? (
        rooms.map((room) => (
          <Card key={room.id} sx={{ display: 'flex', my: 2, bgcolor: '#f3f3f3' }}>
            <CardMedia
              component="img"
              sx={{ width: 250 }}
              image={room.imageUrl}
              alt={room.name}
            />
            <CardContent>
              <Typography variant="h5">Room “{room.name}”</Typography>
              <Typography variant="body1">Capacity: {room.capacity}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No rooms available for the selected criteria</Typography>
      )}
    </Box>
  );
};

export default RoomSuggestions;
