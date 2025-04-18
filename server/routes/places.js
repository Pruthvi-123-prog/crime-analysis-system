const express = require('express');
const router = express.Router();
const axios = require('axios');

// Add MapTiler API key - get from environment variables
const MAPTILER_KEY = process.env.MAPTILER_KEY || '6GHnwlK28StRFj4GuH8E';

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

router.get('/nearby', async (req, res) => {
  const { lat, lng, location } = req.query;
  
  try {
    // Create a Google Maps search URL
    let searchUrl;
    
    if (location) {
      // If location (area/city/pincode) is provided
      const encodedLocation = encodeURIComponent(`police stations in ${location}`);
      searchUrl = `https://www.google.com/maps/search/${encodedLocation}`;
    } else if (lat && lng) {
      // If coordinates are provided
      searchUrl = `https://www.google.com/maps/search/police+stations/@${lat},${lng},14z`;
    } else {
      return res.status(400).json({ 
        error: 'Either location or coordinates (lat/lng) are required' 
      });
    }

    res.json({ 
      redirectUrl: searchUrl,
      query: {
        location,
        coordinates: lat && lng ? { lat, lng } : null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

module.exports = router;