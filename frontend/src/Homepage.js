import React, { useState, useEffect } from 'react';
import {Typography, Box, Button, TextField,
  Paper, Grid, Divider, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import Header from './Header';

const generateCalendarDays = (year, month) => {
  const startDate = dayjs(new Date(year, month, 1));
  const endDate = startDate.endOf('month');
  const days = [];
  const startDay = startDate.day();

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= endDate.date(); d++) {
    days.push(d);
  }
  return days;
};

const HomePage = () => {
  const today = dayjs();
  const [year, setYear] = useState(today.year());
  const [month, setMonth] = useState(today.month());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

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

  const days = generateCalendarDays(year, month);

  return (
    <>
      <Header/>
      <Grid container sx={{ height: 'calc(100vh - 64px)', width: '100vw', overflow: 'hidden' }}>
        {/* Left Side Calendar */}
        <Grid item xs={3} sx={{ p: 2, backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2, backgroundColor: 'white' }}>
            <Typography variant="h6">Current Time</Typography>
            <Typography variant="body1">{currentTime}</Typography>
          </Box>

          <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={1}>
            <Tooltip title="Previous Month">
              <IconButton
                onClick={handlePrevMonth}
                color="primary"
                size="large"
                sx={{ bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            </Tooltip>

            <Typography variant="h5" sx={{ minWidth: 160, textAlign: 'center' }}>
              {dayjs(new Date(year, month)).format('MMMM YYYY')}
            </Typography>

            <Tooltip title="Next Month">
              <IconButton
                onClick={handleNextMonth}
                color="primary"
                size="large"
                sx={{ bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            mt={1}
            display="grid"
            gridTemplateColumns="repeat(7, 1fr)"
            gap={1}
            sx={{ border: '1px solid #ccc', borderRadius: 2, p: 1, backgroundColor: 'white' }}
          >
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <Typography key={idx} align="center" fontWeight="bold">{day}</Typography>
            ))}
            {days.map((day, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor:
                    year === today.year() && month === today.month() && day === today.date()
                      ? '#90caf9'
                      : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography>{day || ''}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0, borderRight: '3px solid #ccc' }} />

        {/* Main Content */}
        <Grid item xs={8.9} sx={{ p: 4, backgroundColor: '#dbeafe', overflowY: 'auto' }}>
          <Typography variant="h4" gutterBottom>Welcome to OptiRoom!</Typography>
          <Typography variant="body1" gutterBottom>
            Start booking your room right now!
          </Typography>

          <Box mt={3} sx={{ backgroundColor: '#f0f8ff', p: 3, borderRadius: 2 }}>
            <Typography variant="h6">Booking description</Typography>
            <Typography variant="body2" gutterBottom>
              Let us know your criteria and we’ll give you room suggestions!
            </Typography>

            <Paper sx={{ p: 2, mt: 1, backgroundColor: '#e0e0e0' }}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                variant="standard"
                placeholder='“Find a room for Monday 3pm, with whiteboard”'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ fontSize: '1.25rem' }}
              />
            </Paper>

            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#a7d6f1', color: 'black' }}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'FIND ROOM SUGGESTIONS'}
              </Button>
            </Box>
          </Box>

          {rooms.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6">Suggestions</Typography>
              <ul>
                {rooms.map((room, i) => (
                  <li key={i}>{room.name} - {room.capacity} people</li>
                ))}
              </ul>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
