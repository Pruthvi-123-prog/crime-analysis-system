import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const LocationSearch = ({ onSearch, isLoading }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to search by input if location access denied
          onSearch({ location: searchInput });
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      onSearch({ location: searchInput });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2
      }}
    >
      <TextField
        fullWidth
        placeholder="Enter area, city or pincode"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        disabled={isLoading}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </Box>
  );
};

export default LocationSearch;