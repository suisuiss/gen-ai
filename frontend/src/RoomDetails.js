import React, { useEffect, useState } from 'react';
import Header from './Header';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';

const RoomDetails = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/rooms/available', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await response.json();
                setRooms(data.rooms || []);
            } catch (err) {
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return <div><Header /><Box p={4}><Typography>Loading room details...</Typography></Box></div>;
    if (!rooms.length) return <div><Header /><Box p={4}><Typography>No room details found.</Typography></Box></div>;

    // Example static booking details
    const booking = {
        date: 'June, 16th, 2025',
        from: '15:00 PM',
        to: '16:00 PM',
    };

    return (
        <div>
            <Header />
            <Box p={4} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h5" mb={2}>Room Details</Typography>
                <Box sx={{ maxWidth: 900, width: '100%' }}>
                    {rooms.map((room, idx) => (
                        <Paper key={room.id} sx={{ mb: 4, p: 3, borderRadius: 3 }}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <img
                                    src={'/rooms/classroom.jpg'}
                                    alt={room.name}
                                    style={{ width: '100%', maxWidth: 700, height: 'auto', borderRadius: 8, marginBottom: 16 }}
                                />
                            </Box>
                            <Grid container spacing={2} sx={{ bgcolor: '#e0e0e0', borderRadius: 2, mt: 1, p: 2 }}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        Building D, 1st floor<br />
                                        Room Name: {room.name}<br />
                                        Capacity: up to {room.capacity} people
                                    </Typography>
                                    <Typography variant="body2" mt={2}>
                                        A spacious and modern meeting room designed for mid-sized groups.<br />
                                        Features include a whiteboard, TV, and a high-quality conference sound system. Ideal for presentations, workshops, and collaborative meetings.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                        <Box width="100%">
                                            <Typography variant="body1" fontWeight="bold">Start Date</Typography>
                                            <Box bgcolor="#cbe7f6" p={1} borderRadius={1} textAlign="center" mb={1}>{booking.date}</Box>
                                        </Box>
                                        <Box display="flex" gap={1} width="100%">
                                            <Box flex={1}>
                                                <Typography variant="body2">From</Typography>
                                                <Box bgcolor="#e6f2fa" p={1} borderRadius={1} textAlign="center">{booking.from}</Box>
                                            </Box>
                                            <Box flex={1}>
                                                <Typography variant="body2">To</Typography>
                                                <Box bgcolor="#e6f2fa" p={1} borderRadius={1} textAlign="center">{booking.to}</Box>
                                            </Box>
                                        </Box>
                                        <Button variant="contained" sx={{ bgcolor: '#7fd0f7', color: '#222', mt: 2, width: '100%' }}>
                                            BOOK NOW
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </div>
    );
};

export default RoomDetails;
