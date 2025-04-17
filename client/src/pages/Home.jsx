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
  Collapse
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

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

  return (
    <StyledBox>
      <MapContainer>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </MapContainer>

      <AlertsWrapper>
        <AlertsContainer>
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                Recent Alerts
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ minWidth: 'auto', px: 2, borderRadius: 2 }}
                onClick={() => setShowManageAlerts(true)}
              >
                Manage Alerts
              </Button>
            </Box>
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
    </StyledBox>
  );
}