import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Grid } from '@mui/material';

const room = {
    name: 'Room New York',
    capacity: 15,
    equipment: ['Whiteboard', 'TV', 'Conference Sound System'],
    location: 'Building D, 1st floor',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2', // Replace with your own image if needed
    description: `A spacious and modern meeting room designed for mid-sized groups.
  Features include a whiteboard, TV, and a high-quality conference sound system. Ideal for presentations, workshops, and collaborative meetings.`,
};

const RoomDetails = () => {
    const [date, setDate] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const handleBook = () => {
        alert(`Booked ${room.name} on ${date} from ${from} to ${to}!`);
    };

    return (
        <Box p={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <img src={room.image} alt={room.name} style={{ width: '100%', borderRadius: '16px' }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>{room.name}</Typography>
                            <Typography><b>Location:</b> {room.location}</Typography>
                            <Typography><b>Capacity:</b> {room.capacity} people</Typography>
                            <Typography><b>Equipment:</b> {room.equipment.join(', ')}</Typography>
                            <Box my={2}>
                                <Typography>{room.description}</Typography>
                            </Box>
                            <Box mt={2}>
                                <Typography variant="h6">Book this room:</Typography>
                                <TextField
                                    label="Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="From"
                                            type="time"
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            value={from}
                                            onChange={e => setFrom(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="To"
                                            type="time"
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            value={to}
                                            onChange={e => setTo(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handleBook}
                                >
                                    BOOK NOW
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RoomDetails;
