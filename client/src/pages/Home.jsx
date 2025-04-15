import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Button, Container, CircularProgress } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { initializeMap, updateCrimeData } from '../config/mapConfig';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4)
  },
  fontFamily: '"Inter", sans-serif'
}));

const MapWrapper = styled(Paper)(({ theme }) => ({
  height: '60vh',
  minHeight: '500px',
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& .maplibregl-canvas': {
    width: '100% !important',
    height: '100% !important'
  },
  '& .maplibregl-map': {
    position: 'absolute !important',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100% !important',
    height: '100% !important'
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s, border-color 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main
  }
}));

const AlertPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  '& .MuiTouchRipple-root': {
    display: 'none'
  },
  '&.MuiButton-contained': {
    color: '#fff',
    '&:hover': {
      color: '#fff'
    },
    '&:active': {
      boxShadow: 'none'
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'none'
    }
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2)
  }
}));

const Home = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertDetailsOpen, setAlertDetailsOpen] = useState(false);
  const [manageAlertsOpen, setManageAlertsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [recentAlerts] = useState([
    { message: "Robbery reported in Connaught Place", timestamp: "2 hours ago" },
    { message: "Suspicious activity near Metro Station", timestamp: "5 hours ago" }
  ]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      console.log('Initializing map...');
      const newMap = initializeMap(mapContainer.current);
      map.current = newMap;

      newMap.on('load', () => {
        console.log('Map loaded, adding markers...');
        updateCrimeData(newMap);
        setIsMapLoading(false);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsMapLoading(false);
    }
  }, []);

  const handleEnableAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setAlertDetailsOpen(true);
  };

  const handleManageAlerts = () => {
    setManageAlertsOpen(true);
  };

  return (
    <StyledContainer>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '1400px' }}
        >
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              mb: { xs: 4, sm: 6 },
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontFamily: '"Roboto", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.01em'
            }}
          >
            Crime Analysis System
          </Typography>

          <Grid 
            container 
            spacing={{ xs: 2, sm: 2, md: 4 }} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {[
              {
                title: 'Report Incidents',
                description: 'Submit details about criminal activities',
                path: '/report-crime'
              },
              {
                title: 'View Analytics',
                description: 'Analyze crime patterns and statistics',
                path: '/dashboard'
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <StyledPaper elevation={2}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontFamily: '"Roboto", sans-serif',
                      fontWeight: 500
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ mb: 3, color: 'text.secondary' }}
                  >
                    {item.description}
                  </Typography>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    href={item.path}
                    fullWidth
                    sx={{ maxWidth: 200 }}
                  >
                    Learn More
                  </StyledButton>
                </StyledPaper>
              </Grid>
            ))}
          </Grid>

          <MapWrapper elevation={2}>
            {isMapLoading && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <CircularProgress />
              </Box>
            )}
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          </MapWrapper>

          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              width: '100%'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Roboto", sans-serif',
                  fontWeight: 500
                }}
              >
                Recent Alerts
              </Typography>
              <StyledButton 
                startIcon={<NotificationsIcon />}
                sx={{ textTransform: 'none' }}
                onClick={handleManageAlerts}
              >
                Manage Alerts
              </StyledButton>
            </Box>

            {recentAlerts.map((alert, index) => (
              <AlertPaper key={index}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {alert.timestamp}
                    </Typography>
                  </Box>
                  <StyledButton 
                    size="small" 
                    variant="contained" 
                    color="error"
                    onClick={() => handleViewDetails(alert)}
                    sx={{ 
                      bgcolor: 'error.dark',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                  >
                    View Details
                  </StyledButton>
                </Box>
              </AlertPaper>
            ))}
          </Paper>

          {/* Alert Details Dialog */}
          <StyledDialog
            open={alertDetailsOpen}
            onClose={() => setAlertDetailsOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Alert Details
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => setAlertDetailsOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedAlert && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedAlert.message}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reported: {selectedAlert.timestamp}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Location: {selectedAlert.location || 'Not specified'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Status: {selectedAlert.status || 'Active'}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <StyledButton onClick={() => setAlertDetailsOpen(false)}>
                Close
              </StyledButton>
            </DialogActions>
          </StyledDialog>

          {/* Manage Alerts Dialog */}
          <StyledDialog
            open={manageAlertsOpen}
            onClose={() => setManageAlertsOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Manage Alerts
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => setManageAlertsOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Alert Preferences
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {['Theft', 'Robbery', 'Assault', 'Vandalism'].map((type) => (
                        <Box
                          key={type}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                          }}
                        >
                          <Typography>{type} Alerts</Typography>
                          <StyledButton
                            size="small"
                            variant="outlined"
                          >
                            Enable
                          </StyledButton>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <StyledButton onClick={() => setManageAlertsOpen(false)}>
                Save Changes
              </StyledButton>
            </DialogActions>
          </StyledDialog>

          <Box sx={{ 
            mt: 4, 
            textAlign: 'center', 
            p: { xs: 2, sm: 3 },
            borderRadius: 1
          }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 500
              }}
            >
              Emergency? Call 112
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For immediate assistance, please contact emergency services
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </StyledContainer>
  );
};

export default Home;