const Crime = require('../models/Crime');

const sampleCrimes = [
  {
    title: "Robbery at ATM",
    description: "Armed robbery reported at SBI ATM",
    location: {
      lat: 28.6139,
      lng: 77.2090
    },
    type: "Robbery",
    status: "investigating"
  },
  {
    title: "Vehicle Theft",
    description: "Car stolen from parking area",
    location: {
      lat: 28.6229,
      lng: 77.2100
    },
    type: "Theft",
    status: "pending"
  }
];

const seedDatabase = async () => {
  try {
    await Crime.deleteMany({});
    await Crime.insertMany(sampleCrimes);
    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

module.exports = seedDatabase;