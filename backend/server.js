const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const signupRoutes = require('./routes/signup');

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));


app.options(/.*/, cors());

app.use(express.json());

const dbURI = process.env.MONGO_URI || 'mongodb+srv://gen_ai:genai1234@gen-ai.rgn9g92.mongodb.net/';
async function connectDB() {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
connectDB();

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

app.use('/api', signupRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
