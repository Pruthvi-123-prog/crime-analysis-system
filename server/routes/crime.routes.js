const express = require('express');
const router = require('express').Router();
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

// Register new crime
router.post('/', async (req, res) => {
  try {
    console.log('Received crime data:', req.body); // Debug log

    const newCrime = new Crime({
      title: req.body.title,
      description: req.body.description,
      location: {
        lat: parseFloat(req.body.location.lat),
        lng: parseFloat(req.body.location.lng)
      },
      type: req.body.type,
      status: 'pending'
    });

    const savedCrime = await newCrime.save();
    console.log('Saved crime:', savedCrime); // Debug log
    res.status(201).json(savedCrime);
  } catch (error) {
    console.error('Error saving crime:', error);
    res.status(400).json({ 
      message: 'Failed to register crime',
      error: error.message 
    });
  }
});

module.exports = router;
