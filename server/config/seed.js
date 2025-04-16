const WebSocket = require('ws');
const Crime = require('./models/Crime');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/crimeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const wss = new WebSocket.Server({ port: 8080 });

// Watch for changes in the Crime collection
Crime.watch().on('change', async () => {
  // When changes occur, send updates to all connected clients
  const acceptedCrimes = await Crime.find({ status: 'accepted' })
    .sort({ createdAt: -1 })
    .limit(10);
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(acceptedCrimes));
    }
  });
});

wss.on('connection', async (ws) => {
  console.log('Client connected');
  
  // Send initial data when client connects
  const acceptedCrimes = await Crime.find({ status: 'accepted' })
    .sort({ createdAt: -1 })
    .limit(10);
  
  ws.send(JSON.stringify(acceptedCrimes));
});

console.log('WebSocket server running on port 8080');