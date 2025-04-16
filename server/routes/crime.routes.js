const express = require('express');
const router = express.Router();
const Crime = require('../models/Crime');

// Get all crimes
router.get('/', async (req, res) => {
  try {
    const crimes = await Crime.find().sort('-createdAt');
    res.json(crimes);
  } catch (error) {
    console.error('Error fetching crimes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get accepted crimes
router.get('/accepted', async (req, res) => {
  try {
    const acceptedCrimes = await Crime.find({ status: 'accepted' });
    res.json(acceptedCrimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register new crime
router.post('/', async (req, res) => {
  try {
    const newCrime = new Crime({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      location: {
        lat: req.body.location.lat,
        lng: req.body.location.lng
      },
      status: 'pending'
    });

    const savedCrime = await newCrime.save();
    res.status(201).json(savedCrime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update crime status
router.patch('/:id', async (req, res) => {
  try {
    const updatedCrime = await Crime.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedCrime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update crime details
router.put('/:id', async (req, res) => {
  try {
    const { title, description, type, status, location } = req.body;
    
    const updatedCrime = await Crime.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        status,
        location
      },
      { new: true, runValidators: true }
    );

    if (!updatedCrime) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(updatedCrime);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
