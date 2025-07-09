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
  const canBook =
    form.date?.isValid() &&
    form.from?.isValid() &&
    form.to?.isValid();
  // 4) On BOOK NOW click: validate date/time
  const handleBookClick = () => {
    // 1) convert user’s picks into old format
    const oldDate = form.date.format('YYYY-MM-DD');
    const oldFrom = form.from.format('HH:mm');
    const oldTo = form.to.format('HH:mm');

    // 2) plug oldDate/oldFrom/oldTo into your current validation
    const now = dayjs();
    const dateStamp = dayjs(oldDate);
    const startStamp = dayjs(`${oldDate}T${oldFrom}`);
    const endStamp = dayjs(`${oldDate}T${oldTo}`);

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
      return;
    }

    // 3) update form to the old-string version so confirmDialog + confirmBooking
    //    and your existing API call can just `form.date`, `form.from`, `form.to`
    setForm({
      date: dayjs(oldDate, 'YYYY-MM-DD'),
      from: dayjs(oldFrom, 'HH:mm'),
      to: dayjs(oldTo, 'HH:mm')
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

    const res = await fetch(`/api/bookings/${selectedRoom._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                      bgcolor="#d0e9f7"
                      p={3}
                      borderRadius={6}
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      alignItems="stretch"
                      maxWidth={400}
                      width="100%"
                      mt={{ xs: 3, md: 0 }}
                    >
                      <DatePicker
                        label="Start Date"
                        inputFormat="MM/DD/YYYY"
                        value={form.date}
                        onChange={d => setForm(f => ({ ...f, date: d }))}
                        renderInput={params => <TextField {...params} fullWidth />}
                      />
                      <Box display="flex" gap={1} width="100%">
                        <TimePicker
                          label="From"
                          ampm
                          inputFormat="hh:mm A"
                          value={form.from}
                          onChange={t => t && setForm(f => ({ ...f, from: t }))}
                          renderInput={params => <TextField {...params} fullWidth />}
                        />
                        <TimePicker
                          label="To"
                          ampm
                          inputFormat="hh:mm A"
                          value={form.to}
                          onChange={t => t && setForm(f => ({ ...f, to: t }))}
                          renderInput={params => <TextField {...params} fullWidth />}
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
                  </LocalizationProvider>
                </Box>
              )}

             <Box display="flex" justifyContent="center">
  <Box
    component="img"
    src={selectedRoom.photoURL}
    alt={selectedRoom.roomName}
    sx={{ width: '100%', maxWidth: 1200, borderRadius: 4, mb: 2 }}
  />
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
            <strong>{form.date?.format('MM/DD/YYYY') ?? ''}</strong> from{' '}
            <strong>{form.from?.format('hh:mm A') ?? ''}</strong> to{' '}
            <strong>{form.to?.format('hh:mm A') ?? ''}</strong>.
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
            <strong>{form.date?.format('MM/DD/YYYY') ?? ''}</strong> from{' '}
            <strong>{form.from?.format('hh:mm A') ?? ''}</strong> to{' '}
            <strong>{form.to?.format('hh:mm A') ?? ''}</strong> is confirmed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setBookingSuccess(false); navigate('/homepage');  }}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoomDetails;

