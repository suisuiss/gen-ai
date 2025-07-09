// RoomDetails.js
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
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

const RoomDetails = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({ date: '', time: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingErrorOpen, setBookingError] = useState(false);
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');
  const [bookingSuccessOpen, setBookingSuccess] = useState(false);
  const { state } = useLocation();
  const incomingRoom = state?.room;
  const incomingDate = state?.date;
  const incomingFrom = state?.from;
  const incomingTo = state?.to;

  const [form, setForm] = useState({
    date: incomingDate ? dayjs(incomingDate, 'YYYY-MM-DD') : null,
    from: incomingFrom ? dayjs(`${incomingDate}T${incomingFrom}`) : null,
    to: incomingTo ? dayjs(`${incomingDate}T${incomingTo}`) : null,
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
        // Try to re-select incomingRoom if exists
        if (incomingRoom) {
          const matched = data.find(r => r.roomName === incomingRoom.roomName);
          setSelectedRoom(matched || data[0] || null);
        } else {
          setSelectedRoom(data[0] || null);
        }
      } catch (e) {
        console.error('Failed to load rooms', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 3) Enable BOOK NOW only when date, from, to are set
  const canBook = form.date?.isValid() && form.from?.isValid() && form.to?.isValid();

  // 4) On BOOK NOW click: validate date/time
  const handleBookClick = () => {
    // 1) convert user’s picks into old format
    const oldDate = form.date.format('YYYY-MM-DD');
    const oldFrom = form.from.format('HH:mm');
    const oldTo = form.to.format('HH:mm');

    // 2) plug oldDate/oldFrom/oldTo into your current validation
    const now = dayjs();
    const startStamp = dayjs(`${oldDate}T${oldFrom}`);
    const endStamp = dayjs(`${oldDate}T${oldTo}`);
    const errs = { date: '', time: '' };
    let ok = true;

    if (!startStamp.isValid() || startStamp.isBefore(now)) {
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
      return;
    }

    // 3) update form to the old-string version so confirmDialog + confirmBooking
    //    and your existing API call can just `form.date`, `form.from`, `form.to`
    setForm({
      date: dayjs(oldDate, 'YYYY-MM-DD'),
      from: dayjs(oldFrom, 'HH:mm'),
      to: dayjs(oldTo, 'HH:mm'),
    });

    setConfirmOpen(true);
  };

  // 5) On Confirm: POST to booking endpoint, then reload rooms & keep selection
  const confirmBooking = async () => {
    setConfirmOpen(false);
    const payload = {
      date: form.date.format('YYYY-MM-DD'),
      from: form.from.format('HH:mm'),
      to: form.to.format('HH:mm'),
    };

    try {
      const res = await fetch(`/api/bookings/${selectedRoom._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setBookingErrorMsg('That time slot was just taken.');
        setBookingError(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

  // Loading State
  if (loading) {
    return <>
      <Header />
      <Box p={4}><Typography>Loading rooms…</Typography></Box>
    </>;
  }

  // Empty Room State
  if (!rooms.length) {
    return <>
      <Header />
      <Box p={4}><Typography>No rooms available.</Typography></Box>
    </>;
  }

  return (
    <div>
      <Header />
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} sx={{ height: '100vh' }}>
        {/* Sidebar: Room List */}
        <Box
          minWidth={300}
          p={3}
          sx={{ borderRight: '1px solid #ddd', bgcolor: '#f9f9f9' }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Room Overview
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rooms</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
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
                      bgcolor: selectedRoom?._id === r._id ? '#e6f7ff' : undefined
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
        <Box flex={1} p={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Room Details
          </Typography>

          {selectedRoom && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
              {/* Info and Booking First */}
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Room Info */}
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedRoom.roomName}</Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>Building:</strong> {selectedRoom.building}<br />
                    <strong>Floor:</strong> {selectedRoom.floor}<br />
                    <strong>Capacity:</strong> up to {selectedRoom.capacity} people
                  </Typography>
                  {selectedRoom.description && (
                    <Typography sx={{ mt: 2 }}>{selectedRoom.description}</Typography>
                  )}
                </Box>

                {/* Booking Form */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box
                    bgcolor="#f0f8ff"
                    p={3}
                    borderRadius={3}
                    width={{ xs: '100%', md: 360 }}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                  >
                    <DatePicker
                      label="Start Date"
                      value={form.date}
                      onChange={d => setForm(f => ({ ...f, date: d }))}
                      renderInput={params => <TextField {...params} fullWidth />}
                    />
                    <Box display="flex" gap={1}>
                      <TimePicker
                        label="From"
                        value={form.from}
                        onChange={t => t && setForm(f => ({ ...f, from: t }))}
                        renderInput={params => <TextField {...params} fullWidth />}
                      />
                      <TimePicker
                        label="To"
                        value={form.to}
                        onChange={t => t && setForm(f => ({ ...f, to: t }))}
                        renderInput={params => <TextField {...params} fullWidth />}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleBookClick}
                      disabled={!canBook}
                      sx={{ fontWeight: 'bold' }}
                    >
                      BOOK NOW
                    </Button>
                  </Box>
                </LocalizationProvider>
              </Box>

              {/* Image Second */}
              {selectedRoom.photoURL && (
                <Box mt={4} display="flex" justifyContent="center">
                  <Box
                    component="img"
                    src={selectedRoom.photoURL}
                    alt={selectedRoom.roomName}
                    sx={{
                      width: '100%',
                      maxWidth: 800,
                      borderRadius: 3,
                      boxShadow: 3,
                      objectFit: 'cover',
                    }}
                  />
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
            <strong>{form.date?.format('MM/DD/YYYY')}</strong> from{' '}
            <strong>{form.from?.format('hh:mm A')}</strong> to{' '}
            <strong>{form.to?.format('hh:mm A')}</strong>.
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
            <strong>{form.date?.format('MM/DD/YYYY')}</strong> from{' '}
            <strong>{form.from?.format('hh:mm A')}</strong> to{' '}
            <strong>{form.to?.format('hh:mm A')}</strong> is confirmed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBookingSuccess(false); navigate('/homepage'); }}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoomDetails;
