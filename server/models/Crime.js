const mongoose = require('mongoose');

const CrimeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  type: {
    type: String,
    enum: ['Theft', 'Robbery', 'Assault', 'Vandalism', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Crime', CrimeSchema);