import * as maptilersdk from '@maptiler/sdk';

// Static crime data for demonstration
const CRIME_DATA = [
  {
    location: 'Delhi',
    coordinates: [77.2090, 28.6139],
    incidents: [
      { type: 'Theft', count: 150 },
      { type: 'Assault', count: 75 },
      { type: 'Robbery', count: 45 }
    ]
  },
  {
    location: 'Mumbai',
    coordinates: [72.8777, 19.0760],
    incidents: [
      { type: 'Theft', count: 120 },
      { type: 'Assault', count: 60 },
      { type: 'Robbery', count: 35 }
    ]
  },
  {
    location: 'Bangalore',
    coordinates: [77.5946, 12.9716],
    incidents: [
      { type: 'Theft', count: 90 },
      { type: 'Assault', count: 40 },
      { type: 'Robbery', count: 25 }
    ]
  }
];

export const initializeMap = (container) => {
  maptilersdk.config.apiKey = '6GHnwlK28StRFj4GuH8E';
  
  const map = new maptilersdk.Map({
    container,
    style: maptilersdk.MapStyle.DARK,
    center: [78.9629, 20.5937], // Center of India
    zoom: 4
  });

  return map;
};

export const updateCrimeData = (map) => {
  if (!map) return;

  CRIME_DATA.forEach(location => {
    const totalCrimes = location.incidents.reduce((sum, incident) => sum + incident.count, 0);
    const color = getTotalCrimeColor(totalCrimes);

    new maptilersdk.Marker({ color })
      .setLngLat(location.coordinates)
      .setPopup(
        new maptilersdk.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 12px;">
              <h4 style="margin: 0 0 8px 0;">${location.location}</h4>
              ${location.incidents.map(incident => 
                `<p style="margin: 4px 0;">${incident.type}: ${incident.count}</p>`
              ).join('')}
              <p style="margin: 8px 0 0 0; font-weight: bold;">Total: ${totalCrimes}</p>
            </div>
          `)
      )
      .addTo(map);
  });
};

const getTotalCrimeColor = (total) => {
  if (total > 200) return '#FF0000';
  if (total > 150) return '#FF4500';
  if (total > 100) return '#FFA500';
  return '#FFD700';
};