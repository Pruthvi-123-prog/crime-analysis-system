const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// MongoDB connection with proper options
mongoose.connect('mongodb://localhost:27017/crimeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(5000, () => {
    console.log('Server running on port 5000');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const crimeRoutes = require('./routes/crime.routes');
const placesRouter = require('./routes/places');

// Use routes
app.use('/api/crimes', crimeRoutes);
app.use('/api/places', placesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;