require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');  // Add logging middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Add logging for debugging

// Routes
const placesRouter = require('./routes/places');
app.use('/api/places', placesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});