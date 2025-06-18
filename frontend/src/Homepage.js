// HomePage.js
import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper
} from '@mui/material';
import dayjs from 'dayjs';
import Header from './Header';

const HomePage = () => {
  // Get the current date in a friendly format, e.g. "Wednesday, June 18, 2025"
  const currentDate = dayjs().format('dddd, MMMM D, YYYY');

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setRooms([
        { name: 'Room A', capacity: 10 },
        { name: 'Room B', capacity: 5 },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          height: 'calc(100vh - 64px)',  // full height minus header
          width: '100vw',
          backgroundColor: '#f4f5f7',
          p: 2,
          fontFamily: 'Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 700,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {/* Welcome Box */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Welcome to OptiRoom!
            </Typography>
            <Typography variant="h6" sx={{ color: '#777', mt: 2 }}>
              {currentDate}
            </Typography>
          </Paper>

          {/* Booking Form Box */}
          <Paper
            sx={{
              p: 6,
              borderRadius: 3,
              boxShadow: 4,
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="body1"
              textAlign="center"
              gutterBottom
              sx={{ color: '#555', mb: 2 }}
            >
              Start booking your room immediately.
            </Typography>
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#f7f7f7',
                borderRadius: 2,
                mb: 3,
                width: '100%'
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={4}
                variant="standard"
                placeholder="Find a room for Monday 3pm, with whiteboard"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ fontSize: '1.4rem' }}
              />
            </Paper>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#336699',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'uppercase'
                }}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'FIND ROOM SUGGESTIONS'}
              </Button>
            </Box>
            {rooms.length > 0 && (
              <Box mt={4} sx={{ width: '100%' }}>
                <Typography variant="h6" textAlign="center">
                  Suggestions
                </Typography>
                <ul
                  style={{
                    listStylePosition: 'inside',
                    padding: 0,
                    fontSize: '1.1rem'
                  }}
                >
                  {rooms.map((room, i) => (
                    <li key={i}>
                      {room.name} - {room.capacity} people
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
