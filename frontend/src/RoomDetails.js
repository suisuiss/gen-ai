// src/components/RoomDetails.jsx
import React, { useEffect, useState } from 'react';
import Header from './Header';
import dayjs from 'dayjs';
import {
  Box, Typography, Button, Paper,
  TextField, Dialog, DialogTitle,
  DialogContent, DialogContentText,
  DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TableRow
} from '@mui/material';

const RoomDetails = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    from: '', to: ''
  });
  const [errors, setErrors] = useState({ date: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingErrorOpen, setBookingError] = useState(false);
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');
  const [bookingSuccessOpen, setBookingSuccess] = useState(false);

  // Utility: fetch all rooms from the backend
  async function loadRooms() {
    const res = await fetch('/api/detail');
    const data = await res.json();
    setRooms(data);
    return data;
  }

  // 1) Initial load on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await loadRooms();
        if (data.length) setSelectedRoom(data[0]);
      } catch (e) {
        console.error('Failed to load rooms', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Handle form inputs
  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 3) Enable BOOK NOW only when date, from, to are set
  const canBook =
    form.date.trim() !== '' &&
    form.from.trim() !== '' &&
    form.to.trim() !== '';

  // 4) On BOOK NOW click: validate date/time
  const handleBookClick = () => {
    const now = dayjs();
    const startStamp = dayjs(`${form.date}T${form.from}`);
    let ok = true;
    const errs = { date: '' };

    if (!startStamp.isValid() || startStamp.isBefore(now)) {
      errs.date = 'Selected start time is in the past';
      ok = false;
    }
    setErrors(errs);

    if (ok) {
      setConfirmOpen(true);
    } else {
      setErrorMsg(errs.date);
      setErrorOpen(true);
    }
  };

  // 5) On Confirm: POST to booking endpoint, then reload rooms & keep selection
  const confirmBooking = async () => {
    setConfirmOpen(false);
    try {
      const res = await fetch(
        `/api/bookings/${selectedRoom._id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: form.date,
            from: form.from,
            to: form.to
          })
        }
      );
      if (res.status === 409) {
        setBookingErrorMsg('That time slot was just taken.');
        setBookingError(true);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      // success
      setBookingSuccess(true);
      setLoading(true);
      const data = await loadRooms();
      // re-select same room if still present
      const updated = data.find(r => r._id === selectedRoom._id);
      setSelectedRoom(updated || data[0] || null);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingErrorMsg('Unexpected error, please try again.');
      setBookingError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <>
      <Header />
      <Box p={4}><Typography>Loading rooms…</Typography></Box>
    </>;
  }

  if (!rooms.length) {
    return <>
      <Header />
      <Box p={4}><Typography>No rooms available.</Typography></Box>
    </>;
  }

  return (
    <>
      <Header />
      <Box display="flex" p={4} gap={4}>
        {/* Sidebar: Room List */}
        <Box minWidth={220}>
          <Typography variant="h6" mb={2}>Rooms</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Room</TableCell>
                  <TableCell>Capacity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map(r => (
                  <TableRow
                    key={r._id}
                    hover
                    onClick={() => setSelectedRoom(r)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor:
                        selectedRoom?._id === r._id
                          ? '#b6f5b6'
                          : 'inherit'
                    }}
                  >
                    <TableCell>{r.roomName}</TableCell>
                    <TableCell>{r.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Detail & Booking */}
        <Box flex={1}>
          {selectedRoom.photoURL && (
            <Box textAlign="center" mb={2}>
              <img
                src={selectedRoom.photoURL}
                alt={selectedRoom.roomName}
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            </Box>
          )}
          {selectedRoom && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                {selectedRoom.roomName}
              </Typography>
              <Typography mb={2}>
                <strong>Building:</strong> {selectedRoom.building}<br />
                <strong>Floor:</strong> {selectedRoom.floor}<br />
                <strong>Capacity:</strong> up to {selectedRoom.capacity} people
              </Typography>
              
              {selectedRoom.description && (
                <Typography mb={2}>
                  {selectedRoom.description}
                </Typography>
              )}

              {/* Booking Form */}
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Date" name="date" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.date} onChange={handleInput}
                  error={!!errors.date}
                  helperText={errors.date}
                />
                <Box display="flex" gap={1}>
                  <TextField
                    label="From" name="from" type="time"
                    InputLabelProps={{ shrink: true }}
                    value={form.from} onChange={handleInput}
                    fullWidth
                  />
                  <TextField
                    label="To" name="to" type="time"
                    InputLabelProps={{ shrink: true }}
                    value={form.to} onChange={handleInput}
                    fullWidth
                  />
                </Box>
                <Button
                  variant="contained"
                  disabled={!canBook}
                  onClick={handleBookClick}
                  sx={{ bgcolor: '#7fd0f7' }}
                >
                  BOOK NOW
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Past‐time Error Dialog */}
      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
        <DialogTitle>Invalid Time</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Booking Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You’re booking <strong>{selectedRoom?.roomName}</strong> on{' '}
            <strong>{form.date}</strong> from{' '}
            <strong>{form.from}</strong> to{' '}
            <strong>{form.to}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmBooking} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Booking Conflict Dialog */}
      <Dialog open={bookingErrorOpen} onClose={() => setBookingError(false)}>
        <DialogTitle>Booking Conflict</DialogTitle>
        <DialogContent>
          <DialogContentText>{bookingErrorMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingError(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Booking Success Dialog */}
      <Dialog open={bookingSuccessOpen} onClose={() => setBookingSuccess(false)}>
        <DialogTitle>Booking Confirmed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your booking for <strong>{selectedRoom?.roomName}</strong> on{' '}
            <strong>{form.date}</strong> from{' '}
            <strong>{form.from}</strong> to{' '}
            <strong>{form.to}</strong> is confirmed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingSuccess(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoomDetails;
