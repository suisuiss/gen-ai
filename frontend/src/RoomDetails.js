
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
import { useParams, useLocation } from 'react-router-dom'; 

const RoomDetails = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState({ date: '', time: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingErrorOpen, setBookingError] = useState(false);
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');
  const [bookingSuccessOpen, setBookingSuccess] = useState(false);
  const { roomId } = useParams();
  const { state } = useLocation();
  const incomingRoom = state?.room;
  const incomingDate = state?.date;
  const incomingFrom = state?.from;
  const incomingTo = state?.to;

  const [form, setForm] = useState({
    date: incomingDate || dayjs().format('YYYY-MM-DD'),
    from: incomingFrom || '',
    to: incomingTo || ''
  });
  const [selectedRoom, setSelectedRoom] = useState(incomingRoom || null);
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
    const dateStamp = dayjs(form.date);
    const startStamp = dayjs(`${form.date}T${form.from}`);
    const endStamp = dayjs(`${form.date}T${form.to}`);
    const errs = { date: '', time: '' };
    let ok = true;

    if (!dateStamp.isValid() || startStamp.isBefore(now)) {
      errs.date = 'Selected start time is in the past';
      ok = false;
    }

    if (!endStamp.isAfter(startStamp)) {
      errs.time = 'End time must be after start time';
      ok = false;
    }
    

    setErrors(errs);

    if (!ok) {
      setErrorMsg(errs.date || errs.time);
      setErrorOpen(true);
    } else {
      setConfirmOpen(true);
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
    <div>
      <Header />
      <Box display="flex" width="100%">
        {/* Sidebar: Room List */}
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
          <Typography variant="h5" align="center" mb={2} sx={{ fontSize: '24px', fontFamily: 'Roboto, sans-serif' }}>Room Overview</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '20px' }}>Rooms</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '20px' }}>Capacity</TableCell>
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
                          : undefined
                    }}
                  >
                    <TableCell sx={{ fontSize: '16px' }}>{r.roomName}</TableCell>
                    <TableCell sx={{ fontSize: '16px' }}>{r.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Detail & Booking */}
        <Box flex={1} p={4} display="flex" flexDirection="column" alignItems="flex-start" sx={{ ml: { xs: 0, md: 'calc(150px + -80px)' } }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontSize: '26px', fontFamily: 'Roboto, sans-serif', ml: 60, fontWeight: 'bold' }}>Room Details</Typography>
          {selectedRoom.photoURL && (
            <Paper sx={{ p: 6, borderRadius: 4, bgcolor: '#ffffff', width: '100%', maxWidth: 1200 }}>
              <Box display="flex" justifyContent="center">
                <Box
                  component="img"
                  src={selectedRoom.photoURL}
                  alt={selectedRoom.roomName}
                  sx={{ width: '100%', maxWidth: 1200, borderRadius: 4, mb: 2 }}
                />
              </Box>

              {selectedRoom && (
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} bgcolor="#e0e0e0" p={3} borderRadius={4}>
                  <Box flex={1} pr={{ md: 3 }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '22px' }}>
                      {selectedRoom.roomName}
                    </Typography>
                    <Typography sx={{ mb: 2, fontSize: '20px' }}>
                      <strong>Building:</strong> {selectedRoom.building}<br />
                      <strong>Floor:</strong> {selectedRoom.floor}<br />
                      <strong>Capacity:</strong> up to {selectedRoom.capacity} people
                    </Typography>


                    {selectedRoom.description && (
                      <Typography sx={{ mt: 4, maxWidth: '600px', fontSize: '16px' }}>
                        {selectedRoom.description}
                      </Typography>
                    )}</Box>

                  {/* Booking Form */}
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
                      label="Start Date" name="date" type="date"
                      InputLabelProps={{ shrink: true }}
                      value={form.date} onChange={handleInput}
                      error={!!errors.date}
                      helperText={errors.date}
                      fullWidth
                    />
                    <Box display="flex" gap={1} width="100%">
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
                        error={!!errors.time}
                        helperText={errors.time}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      disabled={!canBook}
                      onClick={handleBookClick}
                      sx={{ bgcolor: '#7fd0f7', fontWeight: 'bold', color: '#222', mt: 1 }}
                      fullWidth
                    >
                      BOOK NOW
                    </Button>
                  </Box>
                </Box>
              )}
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
    </div>
  );
};

export default RoomDetails;

