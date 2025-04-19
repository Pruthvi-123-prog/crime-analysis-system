import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Grid, Dialog, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/Map';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import CloseIcon from '@mui/icons-material/Close';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as d3 from 'd3';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Plot from 'react-plotly.js';
import { analysisData } from '../data/analysisData';

const D3RingChart = ({ data, isPreview }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current) {
      d3.select(d3Container.current).selectAll('*').remove();

      const margin = isPreview ? 20 : 40;
      const width = d3Container.current.clientWidth;
      const height = d3Container.current.clientHeight;
      const radius = Math.min(width, height) / 2 - margin;

      // Create SVG
      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      // Enhanced color scale with gradients
      const colorScale = d3.scaleSequential()
        .domain([0, data.weapons.length])
        .interpolator(d3.interpolateRainbow);

      // Create gradient definitions
      const defs = svg.append('defs');
      
      data.weapons.forEach((_, i) => {
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${i}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', colorScale(i))
          .attr('stop-opacity', 0.8);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', colorScale(i + 0.5))
          .attr('stop-opacity', 1);
      });

      // Center text group
      const centerText = svg.append('g')
        .attr('class', 'center-text')
        .attr('transform', `translate(0, 0)`);

      centerText.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0em')
        .attr('class', 'main-label')
        .style('fill', 'white')
        .style('font-size', isPreview ? '12px' : '16px')
        .text('Weapons');

      centerText.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('class', 'sub-label')
        .style('fill', '#999')
        .style('font-size', isPreview ? '10px' : '14px')
        .text('Hover for details');

      // Create multiple rings
      const rings = 2;
      const ringPadding = 0.12;  // Slightly reduced padding between rings
      const innerRadiusRatio = 0.65;  // Increased inner space for text clarity
      const outerRadiusRatio = 1.30;  // Increased outer radius for wider bars
      const ringWidth = (radius * (outerRadiusRatio - innerRadiusRatio - ringPadding)) / rings;

      for (let ring = 0; ring < rings; ring++) {
        const arc = d3.arc()
          .innerRadius(radius * innerRadiusRatio + (ring * ringWidth))
          .outerRadius(radius * innerRadiusRatio + ((ring + 1) * ringWidth) - (radius * 0.02))
          .padAngle(0.025)  // Slightly reduced gap between segments for wider bars
          .cornerRadius(4);  // Added corner radius for smoother look

        const pie = d3.pie()
          .value(d => d.values.reduce((sum, v) => sum + v.value, 0))
          .sort(null);

        const arcs = svg.selectAll(`arc-${ring}`)
          .data(pie(data.weapons.map((weapon, i) => ({
            weapon,
            values: data.cities.map((city, j) => ({
              city,
              value: data.values[j][i]
            }))
          })).slice(ring * 3, (ring + 1) * 3)))
          .enter()
          .append('g')
          .attr('class', 'arc')
          .style('cursor', 'pointer');

        arcs.append('path')
          .attr('d', arc)
          .attr('fill', (d, i) => `url(#gradient-${i + (ring * 3)})`)
          .attr('stroke', '#1a1a1a')
          .attr('stroke-width', 2)
          .style('transition', 'all 0.3s')
          .on('mouseover', function(event, d) {
            const el = d3.select(this);
            el.transition()
              .duration(200)
              .attr('transform', function(d) {
                const [x, y] = arc.centroid(d);
                return `translate(${x * 0.05},${y * 0.05})`;
              })
              .style('filter', 'brightness(1.2)');

            // Update center text
            const total = d.data.values.reduce((sum, v) => sum + v.value, 0);
            centerText.select('.main-label')
              .text(d.data.weapon)
              .transition()
              .duration(200)
              .style('font-size', isPreview ? '11px' : '15px');

            centerText.select('.sub-label')
              .text(`Total: ${total} cases`)
              .transition()
              .duration(200)
              .style('fill', colorScale(d.index));
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('transform', 'translate(0,0)')
              .style('filter', 'none');

            // Reset center text
            centerText.select('.main-label')
              .text('Weapons')
              .transition()
              .duration(200)
              .style('font-size', isPreview ? '12px' : '16px');

            centerText.select('.sub-label')
              .text('Hover for details')
              .transition()
              .duration(200)
              .style('fill', '#999');
          });
      }
    }
  }, [data, isPreview]);

  return (
    <div 
      ref={d3Container} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    />
  );
};

export default function Dashboard() {
  const [error, setError] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [openGenderModal, setOpenGenderModal] = useState(false);
  const [openWeaponModal, setOpenWeaponModal] = useState(false);

  // Preview plot configurations
  const previewConfig = {
    displayModeBar: false,
    responsive: true,
    scrollZoom: false
  };

  // Full modal plot configurations
  const modalConfig = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    toImageButtonOptions: {
      format: 'png',
      filename: 'crime_analysis',
      height: 1080,
      width: 1920,
      scale: 2
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    maptilersdk.config.apiKey = apiKey;
    
    const newMap = new maptilersdk.Map({
      container: mapContainer.current,
      style: `${import.meta.env.VITE_MAPTILER_STYLE_URL}?key=${apiKey}`,
      center: [78.9629, 20.5937],
      zoom: 4
    });

    newMap.on('load', () => {
      if (analysisData?.hotspots) {
        // Create bounds object
        const bounds = new maptilersdk.LngLatBounds();

        // Prepare data for heatmap
        const points = analysisData.hotspots.map(hotspot => ({
          'type': 'Feature',
          'properties': {
            'intensity': hotspot.intensity,
            'cases': hotspot.cases,
            'crimeType': hotspot.crimeType,
            'city': hotspot.city
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [hotspot.Longitude, hotspot.Latitude]
          }
        }));

        // Extend bounds
        points.forEach(point => {
          bounds.extend(point.geometry.coordinates);
        });

        // Add the source
        newMap.addSource('crime-points', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': points
          }
        });

        // Update the heatmap layer paint properties
        newMap.addLayer({
          'id': 'crime-heat',
          'type': 'heatmap',
          'source': 'crime-points',
          'paint': {
            // Smoother weight distribution
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 0,
              0.5, 0.5,  // Added middle point for smoother transition
              1, 1.5     // Reduced max weight for better blending
            ],
            // Smoother intensity scaling
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0.5,    // Lower base intensity
              9, 3       // Moderate max intensity
            ],
            // More gradual color transitions
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(236,222,239,0)',
              0.1, 'rgb(255,240,240)',  // Very light red
              0.3, 'rgb(255,190,190)',  // Light red
              0.5, 'rgb(255,120,120)',  // Medium red
              0.7, 'rgb(255,60,60)',    // Bright red
              0.9, 'rgb(200,0,0)',      // Dark red
              1, 'rgb(139,0,0)'         // Deep red
            ],
            // Larger radius for better blending
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 8,     // Increased base radius
              9, 40     // Increased max radius for more overlap
            ],
            // Slightly reduced opacity for better blending
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0.7,   // Lower opacity at low zoom
              9, 0.8    // Higher opacity at high zoom
            ]
          }
        });

        // Add click interaction for point details
        newMap.on('click', 'crime-heat', (e) => {
          if (!e.features.length) return;

          const feature = e.features[0];
          const coordinates = feature.geometry.coordinates.slice();
          const { intensity, cases, crimeType, city } = feature.properties;

          new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="color: black; padding: 8px;">
                <h3 style="margin: 0 0 8px 0;">${city}</h3>
                <p style="margin: 4px 0;"><strong>Crime Type:</strong> ${crimeType}</p>
                <p style="margin: 4px 0;"><strong>Cases:</strong> ${cases}</p>
                <p style="margin: 4px 0;"><strong>Risk Level:</strong> ${Math.round(intensity * 100)}%</p>
              </div>
            `)
            .addTo(newMap);
        });

        // Change cursor to pointer when hovering over heatmap
        newMap.on('mouseenter', 'crime-heat', () => {
          newMap.getCanvas().style.cursor = 'pointer';
        });

        newMap.on('mouseleave', 'crime-heat', () => {
          newMap.getCanvas().style.cursor = '';
        });

        // Fit map to bounds with padding
        newMap.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12
        });
      }
    });

    map.current = newMap;

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add this helper function to determine marker color
  const getMarkerColor = (intensity) => {
    if (intensity >= 0.8) return '#FF0000'; // High risk - Red
    if (intensity >= 0.6) return '#FF6B00'; // Medium-high risk - Orange
    if (intensity >= 0.4) return '#FFA500'; // Medium risk - Light Orange
    return '#FFCC00'; // Lower risk - Yellow
  };

  // 3D Gender Distribution Preview
  const renderGenderPlot = (isPreview = true) => {
    const genderData = analysisData.genderAnalysis;
    if (!genderData) return null;

    const chartOptions = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Arial, sans-serif'
        },
        // Adjust height only for preview
        height: isPreview ? 200 : '100%',  // Reduced preview height
        marginTop: isPreview ? 5 : 40,
        marginBottom: isPreview ? 5 : 40
      },
      title: {
        text: isPreview ? '' : 'Gender Distribution Over Time',
        style: {
          color: '#ffffff'
        }
      },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            color: '#ffffff'
          }
        },
        gridLineWidth: 1,
        gridLineColor: 'rgba(255, 255, 255, 0.1)',
        lineColor: '#ffffff',
        tickColor: '#ffffff'
      },
      yAxis: {
        title: {
          text: 'Number of Cases',
          style: {
            color: '#ffffff'
          }
        },
        labels: {
          style: {
            color: '#ffffff'
          }
        },
        gridLineColor: 'rgba(255, 255, 255, 0.1)'
      },
      series: genderData.labels.map((label, index) => ({
        name: label,
        data: Array(12).fill(null).map(() => 
          Math.floor(genderData.values[index] / 12 + Math.random() * 10)
        ),
        marker: {
          symbol: 'circle',
          radius: 4
        },
        lineWidth: 2
      })),
      legend: {
        enabled: !isPreview,
        itemStyle: {
          color: '#ffffff'
        },
        itemHoverStyle: {
          color: '#cccccc'
        }
      },
      colors: ['#FF4444', '#4169E1', '#32CD32'],
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        style: {
          color: '#ffffff'
        },
        borderWidth: 0,
        shared: true,
        crosshairs: true
      },
      plotOptions: {
        line: {
          animation: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          }
        },
        series: {
          states: {
            hover: {
              lineWidth: 3
            }
          }
        }
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            },
            yAxis: {
              labels: {
                enabled: false
              }
            }
          }
        }]
      },
      credits: {
        enabled: false
      }
    };

    return (
      <div style={{ 
        width: '100%', 
        height: isPreview ? '200px' : '100%'  // Match container height with chart
      }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
    );
  };

  // 3D Weapon Usage Preview
  const renderWeaponPlot = (isPreview = true) => {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'  // Add center alignment
      }}>
        <Box sx={{ 
          width: isPreview ? '90%' : '100%',  // Slightly smaller in preview
          height: isPreview ? '90%' : '100%',  // Slightly smaller in preview
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <D3RingChart data={analysisData.weaponAnalysis} isPreview={isPreview} />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3, 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      minHeight: '100vh'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%)',
          color: 'error.main',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}>
          <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" gutterBottom>
            Crime Statistics Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.light' }}>
            Comprehensive analysis of crime patterns and trends
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '400px',
                background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                color: 'error.light',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1,
                bgcolor: 'rgba(0,0,0,0.9)',
                color: 'error.main',
                p: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <MapIcon />
                <Typography variant="subtitle2">
                  Crime Hotspot Analysis
                </Typography>
              </Box>
              <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '300px',
                background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
                borderRadius: 2,
                position: 'relative',
                color: 'error.light',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)'
                }
              }}
              onClick={() => setOpenGenderModal(true)}
            >
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                  <AssessmentIcon />
                  <Typography variant="h6">Gender Distribution</Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'error.main' }}>
                  <ZoomOutMapIcon />
                </IconButton>
              </Box>
              <Box sx={{ width: '100%', height: 'calc(100% - 50px)' }}>
                {renderGenderPlot(true)}
              </Box>
            </Paper>

            <Dialog 
              fullWidth 
              maxWidth="md" 
              open={openGenderModal} 
              onClose={() => setOpenGenderModal(false)}
              PaperProps={{
                sx: { 
                  background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
                  borderRadius: 2,
                  height: '600px',  // Changed from 85vh to fixed height
                  maxHeight: '600px', // Changed from 900px to match height
                  boxShadow: '0 8px 12px rgba(0, 0, 0, 0.4)'
                }
              }}
            >
              <Box sx={{ 
                p: 3,
                height: '100%',  // Take full height
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Typography variant="h5" sx={{ color: 'error.main' }}>
                    Gender Distribution Analysis
                  </Typography>
                  <IconButton 
                    onClick={() => setOpenGenderModal(false)} 
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1 }}>  {/* Take remaining space */}
                  {renderGenderPlot(false)}
                </Box>
              </Box>
            </Dialog>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                height: '300px',
                background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
                borderRadius: 2,
                position: 'relative',
                color: 'error.light',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.3)'
                }
              }}
              onClick={() => setOpenWeaponModal(true)}
            >
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                  <TimelineIcon />
                  <Typography variant="h6">Weapon Usage by City</Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'error.main' }}>
                  <ZoomOutMapIcon />
                </IconButton>
              </Box>
              <Box sx={{ width: '100%', height: 'calc(100% - 50px)' }}>
                {renderWeaponPlot(true)}
              </Box>
            </Paper>

            <Dialog 
              fullWidth 
              maxWidth="md" 
              open={openWeaponModal} 
              onClose={() => setOpenWeaponModal(false)}
              PaperProps={{
                sx: { 
                  background: 'linear-gradient(135deg, #242424 0%, #1a1a1a 100%)',
                  borderRadius: 2,
                  height: '85vh',
                  maxHeight: '900px',
                  boxShadow: '0 8px 12px rgba(0, 0, 0, 0.4)'
                }
              }}
            >
              <Box sx={{ 
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Typography variant="h5" sx={{ color: 'error.main' }}>
                    Weapon Usage Analysis
                  </Typography>
                  <IconButton 
                    onClick={() => setOpenWeaponModal(false)} 
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  {renderWeaponPlot(false)}
                </Box>
              </Box>
            </Dialog>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}