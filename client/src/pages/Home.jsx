import { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Collapse 
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

<<<<<<< HEAD
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4)
  },
  fontFamily: '"Inter", sans-serif'
}));

const MapWrapper = styled(Paper)(({ theme }) => ({
  height: {
    xs: '40vh',  // Smaller height on mobile
    sm: '50vh',  // Medium height on tablets
    md: '60vh'   // Full height on desktop
  },
  minHeight: {
    xs: '300px', // Minimum height on mobile
    sm: '400px', // Minimum height on tablets
    md: '500px'  // Minimum height on desktop
  },
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
    bottom: 0
  },
  // Add touch scrolling support for mobile
  '& .maplibregl-canvas-container': {
    touchAction: 'pan-y pinch-zoom'
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
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    '& .MuiButton-root': {
      minWidth: 'auto',
      padding: '6px 12px'
    }
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
=======
export default function Home() {
>>>>>>> 8903ac9 (Safe)
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [acceptedReports, setAcceptedReports] = useState([]);
  const [expandedReports, setExpandedReports] = useState({});
  const [showManageAlerts, setShowManageAlerts] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');

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
    const filtered = acceptedReports.filter(report => 
      type === 'all' ? true : report.type === type
    );
    setAcceptedReports(filtered);
    setFilterType(type);
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

  useEffect(() => {
    const fetchAcceptedReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/crimes/accepted');
        setAcceptedReports(response.data);
      } catch (error) {
        console.error('Error fetching accepted reports:', error);
      }
    };

    // Initial fetch
    fetchAcceptedReports();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAcceptedReports(data);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    maptilersdk.config.apiKey = apiKey;
    
    const newMap = new maptilersdk.Map({
      container: mapContainer.current,
      style: `${import.meta.env.VITE_MAPTILER_STYLE_URL}?key=${apiKey}`,
      center: [77.2090, 28.6139], // Default center (Delhi)
      zoom: 12
    });

    map.current = newMap;

    // Function to update map bounds based on markers
    const updateMapBounds = () => {
      if (acceptedReports.length === 0) return;

      const bounds = new maptilersdk.LngLatBounds();
      
      // Extend bounds to include all marker locations
      acceptedReports.forEach(report => {
        bounds.extend([report.location.lng, report.location.lat]);
      });

      // Add padding to bounds and fit map
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000 // Animation duration in milliseconds
      });
    };

    newMap.on('load', () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add markers for accepted reports
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

      // Update map bounds after adding markers
      updateMapBounds();
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [acceptedReports]); // Add acceptedReports as dependency

  const toggleDetails = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      width: '50vw',
      overflow: 'hidden'
    }}>
      {/* Map Container - will shrink when alerts expand */}
      <Box sx={{ 
        flex: '1 1 auto',
        minHeight: '30vh', // Minimum height for map
        transition: 'all 0.3s ease'
      }}>
<<<<<<< HEAD
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
              mb: { xs: 2, sm: 4, md: 6 },
              fontSize: { 
                xs: '1.75rem',
                sm: '2.25rem', 
                md: '3rem' 
              },
              fontFamily: '"Roboto", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              wordBreak: 'break-word' // Prevent text overflow on small screens
            }}
          >
            Crime Analysis System
          </Typography>

          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }} 
            justifyContent="center"
            sx={{ 
              mb: { xs: 2, sm: 3, md: 4 },
              px: { xs: 1, sm: 2, md: 3 } // Add padding on smaller screens
            }}
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
                <StyledPaper 
                  elevation={2}
                  sx={{ 
                    minHeight: { xs: 'auto', sm: '200px' },
                    p: { xs: 2, sm: 3 } // Adjust padding for different screens
                  }}
                >
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
=======
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </Box>

      {/* Alerts Section - will expand smoothly */}
      <Paper sx={{ 
        flex: '0 1 auto',
        maxHeight: showManageAlerts ? '70vh' : '35vh', // Adjust max height based on panel state
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
              Recent Alerts
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ minWidth: 'auto', px: 2 }}
              onClick={() => setShowManageAlerts(!showManageAlerts)}
            >
              {showManageAlerts ? 'Hide Alerts' : 'Manage Alerts'}
            </Button>
          </Box>
>>>>>>> 8903ac9 (Safe)

          <List sx={{ 
            overflowY: 'auto',
            maxHeight: showManageAlerts ? 'calc(70vh - 120px)' : 'calc(35vh - 80px)',
            transition: 'all 0.3s ease',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
            }
          }}>
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
                    onClick={() => toggleDetails(report._id)}
                  >
                    {expandedReports[report._id] ? 'Hide' : 'Show'}
                  </Button>
                </Box>
                
                <Collapse in={expandedReports[report._id]} timeout="auto" unmountOnExit>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'background.paper', 
                    mt: 0.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    wordBreak: 'break-word' // Prevent text overflow
                  }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {report.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Location: {report.location.lat}, {report.location.lng}
                    </Typography>
                  </Box>
                </Collapse>
                <Divider sx={{ my: 0.5 }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Manage Alerts Panel - integrated into main Paper */}
      <Collapse in={showManageAlerts}>
        <Box sx={{ 
          p: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            flexWrap: 'wrap'
          }}>
            <Button 
              variant="outlined"
              size="small"
              sx={{ minWidth: 'auto', px: 2 }}
              onClick={() => handleFilter(filterType === 'all' ? 'Theft' : 'all')}
            >
              {filterType === 'all' ? 'Show Theft Only' : 'Show All'}
            </Button>
            <Button 
              variant="outlined"
              size="small"
              sx={{ minWidth: 'auto', px: 2 }}
              onClick={handleSort}
            >
              Sort {sortOrder === 'desc' ? '↑' : '↓'}
            </Button>
            <Button 
              variant="outlined"
              size="small"
              sx={{ minWidth: 'auto', px: 2 }}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}