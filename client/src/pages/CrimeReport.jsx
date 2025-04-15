import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      }
    }
  },
  '& .MuiInputLabel-root': {
    backgroundColor: theme.palette.background.default,
    padding: '0 4px',
    '&.Mui-focused': {
      color: theme.palette.primary.main
    }
  },
  '& .MuiSelect-select': {
    maxWidth: '200px' // Limit dropdown button width
  }
}));

const MapContainer = styled(Box)(({ theme }) => ({
  height: '500px',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(2)
}));

export default function CrimeReport() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: {
      lat: '',
      lng: ''
    }
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    maptilersdk.config.apiKey = 'O2qg6AC8VtSjtTZ5KKc6';
    
    const newMap = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [77.2090, 28.6139],
      zoom: 12
    });

    map.current = newMap;

    newMap.on('load', () => {
      // Add click event to map
      newMap.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new maptilersdk.Marker()
            .setLngLat([lng, lat])
            .addTo(newMap);
        }

        setFormData(prev => ({
          ...prev,
          location: {
            lat: lat.toFixed(6),
            lng: lng.toFixed(6)
          }
        }));
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.type || !formData.location.lat || !formData.location.lng) {
        throw new Error('Please fill in all required fields and select a location on the map');
      }

      const response = await axios.post('http://localhost:5000/api/crimes', formData);
      console.log('Crime registered:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 800,
      mx: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Report an Incident
        </Typography>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Incident Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <StyledTextField
                select
                fullWidth
                label="Incident Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        maxWidth: '200px', // Limit dropdown menu width
                        '& .MuiMenuItem-root': {
                          whiteSpace: 'normal', // Allow text wrapping in menu items
                          padding: '8px 16px'
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="Theft">Theft</MenuItem>
                <MenuItem value="Robbery">Robbery</MenuItem>
                <MenuItem value="Assault">Assault</MenuItem>
                <MenuItem value="Vandalism">Vandalism</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
            Click on the map to select incident location
          </Typography>
          
          <MapContainer>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          </MapContainer>

          {formData.location.lat && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Selected location: {formData.location.lat}, {formData.location.lng}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            sx={{
              mt: 4,
              py: 1.5
            }}
          >
            Submit Report
          </Button>
        </Paper>
      </motion.div>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">
          Crime reported successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}