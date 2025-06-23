
// HomePage.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import Header from './Header';

const HomePage = () => {
  // Get the current date in a friendly format, e.g. "Wednesday, June 18, 2025"
  const currentDate = dayjs().format('dddd, MMMM D, YYYY');

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [parsedResult, setParsedResult] = useState(null);
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

  const handleSearch = async () => {
    console.log('Submitting query:', query);
    setLoading(true);
    try {
      const res = await fetch('/api/llm/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        console.log('Parsed LLM response:', data.parsed);
        let raw = data.parsed.trim();
        raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const info = JSON.parse(raw);
        setParsedResult(info);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Grid
        container
        sx={{ height: 'calc(100vh - 64px)', width: '100vw', overflow: 'hidden' }}
      >
        <Grid
          item
          xs={3}
          sx={{ p: 2, backgroundColor: '#f5f5f5', overflowY: 'auto' }}
        >
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: 'white',
            }}
          >
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
                &#8592;
              </IconButton>
            </Tooltip>
            <Typography
              variant="h5"
              sx={{ minWidth: 160, textAlign: 'center' }}
            >
              {dayjs(new Date(year, month)).format('MMMM YYYY')}
            </Typography>
            <Tooltip title="Next Month">
              <IconButton
                onClick={handleNextMonth}
                color="primary"
                size="large"
                sx={{ bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
              >
                &#8594;
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
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Typography key={idx} align="center" fontWeight="bold">
                {day}
              </Typography>
            ))}
            {days.map((day, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor:
                    year === today.year() &&
                    month === today.month() &&
                    day === today.date()
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
        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0, borderRight: '3px solid #ccc' }}
        />
        <Grid
          item
          xs={8.9}
          sx={{ p: 4, backgroundColor: '#dbeafe', overflowY: 'auto' }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to OptiRoom!
          </Typography>
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
                placeholder="“Find a room for Monday 3pm, with whiteboard”"
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
          </Box>

          {parsedResult && (
            <Box mt={4} p={2} bgcolor="#f9f9f9" borderRadius={2}>
              <Typography variant="h6" gutterBottom>
                Booking request summary
              </Typography>
              {parsedResult.date ||
              parsedResult.time ||
              parsedResult.capacity ||
              parsedResult.equipment ? (
                <>
                  {parsedResult.date && (
                    <Typography>
                      <strong>Date:</strong> {parsedResult.date}
                    </Typography>
                  )}
                  {parsedResult.time && (
                    <Typography>
                      <strong>Time:</strong> {parsedResult.time}
                    </Typography>
                  )}
                  {parsedResult.capacity && (
                    <Typography>
                      <strong>Capacity:</strong> {parsedResult.capacity}
                    </Typography>
                  )}
                  {Array.isArray(parsedResult.equipment) &&
                    parsedResult.equipment.length > 0 && (
                      <Typography>
                        <strong>Equipment:</strong>{' '}
                        {parsedResult.equipment.join(', ')}
                      </Typography>
                    )}
                </>
              ) : (
                <pre>{JSON.stringify(parsedResult, null, 2)}</pre>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
// This code defines the HomePage component for the OptiRoom application.