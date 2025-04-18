import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Collapse,
  CircularProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DirectionsIcon from '@mui/icons-material/Directions';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

// Styled components
const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh', // Changed from height to minHeight
  width: '60vw',
  margin: '0 auto',
  boxShadow: theme.shadows[3],
  overflow: 'auto' // Changed from hidden to auto
}));

const MapContainer = styled(Box)(({ theme }) => ({
  flex: '0 0 auto', // Changed from 1 1 auto
  height: '60vh', // Fixed height instead of minHeight
  transition: 'all 0.3s ease',
  position: 'relative'
}));

const AlertsWrapper = styled(Box)(({ theme }) => ({
  flex: '0 0 auto', // Changed from display: flex
  height: 'auto', // Changed from fixed height
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper
}));

const AlertsContainer = styled(Paper)(({ theme }) => ({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8
}));

const ScrollableList = styled(List)(({ theme }) => ({
  maxHeight: props => props.expanded ? '50vh' : '35vh', // Added maxHeight
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  paddingRight: '6px'
}));

const ManageAlertsWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  position: 'sticky', // Add sticky positioning
  bottom: 0, // Stick to bottom
  zIndex: 1 // Ensure it stays on top
}));

// Add new styled component for the popup
const AlertDetailPopup = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  zIndex: 1300,
  borderRadius: theme.shape.borderRadius,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  }
}));

// Add after AlertDetailPopup
const ManageAlertsPopup = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '400px',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  zIndex: 1300,
  borderRadius: theme.shape.borderRadius
}));

const HelpPopup = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: '80px',
  right: '30px',
  width: '350px',
  maxHeight: '500px',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  zIndex: 1300,
  borderRadius: theme.shape.borderRadius,
  overflowY: 'auto'
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
  marginBottom: theme.spacing(2)
}));

const StatsBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(0, 2, 2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center'
}));

export default function Home() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [acceptedReports, setAcceptedReports] = useState([]);
  const [allReports, setAllReports] = useState([]); // Add this with other state declarations
  const [expandedReports, setExpandedReports] = useState({});
  const [showManageAlerts, setShowManageAlerts] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reports and setup WebSocket
  useEffect(() => {
    const fetchAcceptedReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/crimes/accepted');
        setAcceptedReports(response.data);
        setAllReports(response.data); // Store original data
      } catch (error) {
        console.error('Error fetching accepted reports:', error);
      }
    };

    fetchAcceptedReports();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAcceptedReports(data);
      setAllReports(data); // Update original data with websocket updates
    };

    return () => ws.close();
  }, []);

  // Map initialization and marker handling
  useEffect(() => {
    if (!mapContainer.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    maptilersdk.config.apiKey = apiKey;
    
    const newMap = new maptilersdk.Map({
      container: mapContainer.current,
      style: `${import.meta.env.VITE_MAPTILER_STYLE_URL}?key=${apiKey}`,
      center: [77.2090, 28.6139],
      zoom: 12
    });

    map.current = newMap;

    const updateMapBounds = () => {
      if (acceptedReports.length === 0) return;
      const bounds = new maptilersdk.LngLatBounds();
      acceptedReports.forEach(report => {
        bounds.extend([report.location.lng, report.location.lat]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    };

    newMap.on('load', () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      acceptedReports.forEach(report => {
        const marker = new maptilersdk.Marker()
          .setLngLat([report.location.lng, report.location.lat])
          .setPopup(new maptilersdk.Popup().setHTML(
            `<h3>${report.title}</h3>
             <p>Type: ${report.type}</p>
             <p>${report.description}</p>`
          ))
          .addTo(newMap);
        
        markers.current.push(marker);
      });

      updateMapBounds();
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [acceptedReports]);

  // Handler functions
  const handleSort = () => {
    const sorted = [...acceptedReports].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    setAcceptedReports(sorted);
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleFilter = (type) => {
    if (type === 'all') {
      setAcceptedReports(allReports);
    } else {
      const filtered = allReports.filter(report => report.type === type);
      setAcceptedReports(filtered);
    }
    setFilterType(type);
    setShowManageAlerts(false); // Close the manage alerts popup
  };

  const handleExport = () => {
    const csvContent = acceptedReports.map(report => {
      return [
        report.title,
        report.type,
        report.description,
        `${report.location.lat}, ${report.location.lng}`,
        new Date(report.createdAt).toLocaleString()
      ].join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crime-alerts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleDetails = (report) => {
    setSelectedReport(selectedReport?.id === report._id ? null : report);
  };

  const fetchNearbyPoliceStations = async (lat, lng) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/places/nearby`, {
        params: {
          lat,
          lng
        }
      });
      console.log('Police stations response:', response.data); // Debug log
    } catch (error) {
      console.error('Error fetching police stations:', error);
    }
  };

  const handlePoliceStationSearch = async (searchInput) => {
    try {
      // You can either pass coordinates or location name
      const response = await axios.get(`http://localhost:5000/api/places/nearby`, {
        params: {
          location: searchInput // or { lat, lng } if using coordinates
        }
      });

      if (response.data.redirectUrl) {
        // Open in new tab
        window.open(response.data.redirectUrl, '_blank');
      }
    } catch (error) {
      console.error('Error searching police stations:', error);
    }
  };

  const handleHelpClick = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const url = `https://www.google.com/maps/search/police+stations/@${position.coords.latitude},${position.coords.longitude},14z`;
          window.open(url, '_blank');
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <StyledBox>
      <HeaderSection>
        <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" sx={{ mb: 1 }}>
          Crime Alert System
        </Typography>
        <Typography variant="subtitle1">
          Real-time crime monitoring and reporting for a safer community
        </Typography>
      </HeaderSection>

      <StatsBox>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">{acceptedReports.length}</Typography>
          <Typography variant="body2" color="text.secondary">Active Alerts</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">24/7</Typography>
          <Typography variant="body2" color="text.secondary">Monitoring</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">{"< 5 min"}</Typography>
          <Typography variant="body2" color="text.secondary">Response Time</Typography>
        </Box>
      </StatsBox>

      <MapContainer>
        <Box sx={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          zIndex: 1, 
          bgcolor: 'rgba(255,255,255,0.9)',
          p: '1px',
          borderRadius: '1px'
        }}>
          <Typography variant="caption" color="text.secondary">
            🔴 Live Crime Incidents Map
          </Typography>
        </Box>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </MapContainer>

      <AlertsWrapper>
        <AlertsContainer>
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider', 
            bgcolor: 'black', // Changed from error.light to black
            color: 'error.main' // Added to make text red
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 500, 
                    color: 'error.main' // Changed from error.dark to error.main
                  }}
                >
                  Active Crime Alerts
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  borderRadius: 2,
                  bgcolor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  }
                }}
                onClick={() => setShowManageAlerts(true)}
              >
                Manage Alerts
              </Button>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1, 
                display: 'block',
                color: 'error.light' // Changed from error.dark to error.light
              }}
            >
              These alerts are verified by local law enforcement. Stay vigilant and report suspicious activities.
            </Typography>
          </Box>

          <ScrollableList expanded={showManageAlerts}>
            {acceptedReports.map((report) => (
              <ListItem key={report._id} sx={{ 
                flexDirection: 'column', 
                alignItems: 'stretch',
                py: 0.5
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                        {report.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {`${report.type} - ${new Date(report.createdAt).toLocaleString()}`}
                      </Typography>
                    }
                  />
                  <Button
                    startIcon={<InfoIcon sx={{ fontSize: '0.9rem' }} />}
                    size="small"
                    sx={{ ml: 1, minWidth: 'auto', px: 1 }}
                    onClick={() => toggleDetails(report)}
                  >
                    Show
                  </Button>
                </Box>
                <Divider sx={{ my: 0.5 }} />
              </ListItem>
            ))}
          </ScrollableList>
        </AlertsContainer>
      </AlertsWrapper>

      {selectedReport && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1200,
              cursor: 'pointer'
            }}
            onClick={() => setSelectedReport(null)}
          />
          <AlertDetailPopup>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">
                {selectedReport.title}
              </Typography>
              <Button
                size="small"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedReport.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Type: {selectedReport.type}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Location: {selectedReport.location.lat}, {selectedReport.location.lng}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Date: {new Date(selectedReport.createdAt).toLocaleString()}
            </Typography>
          </AlertDetailPopup>
        </>
      )}

      {showManageAlerts && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1200,
              cursor: 'pointer'
            }}
            onClick={() => setShowManageAlerts(false)}
          />
          <ManageAlertsPopup>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                Manage Alerts
              </Typography>
              <Button
                size="small"
                onClick={() => setShowManageAlerts(false)}
              >
                Close
              </Button>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 2
            }}>
              <Button 
                variant="outlined"
                fullWidth
                onClick={() => handleFilter(filterType === 'all' ? 'Theft' : 'all')}
              >
                {filterType === 'all' ? 'Show Theft Only' : 'Show All'}
              </Button>
              <Button 
                variant="outlined"
                fullWidth
                onClick={handleSort}
              >
                Sort by Date {sortOrder === 'desc' ? '(Newest First)' : '(Oldest First)'}
              </Button>
              <Button 
                variant="outlined"
                fullWidth
                onClick={handleExport}
              >
                Export to CSV
              </Button>
            </Box>
          </ManageAlertsPopup>
        </>
      )}

      {/* Floating Location Button */}
      <Tooltip 
        title="Find Police Stations Near You"
        placement="left"
        arrow
      >
        <Fab
          color="primary"
          aria-label="find-police"
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '30px',
            zIndex: 1000,
            bgcolor: 'error.main',
            '&:hover': {
              bgcolor: 'error.dark',
            }
          }}
          onClick={handleHelpClick}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <LocationOnIcon />}
        </Fab>
      </Tooltip>
    </StyledBox>
  );
}