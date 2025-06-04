// server/models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['otp', 'reset', 'email', 'activation'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1d' // Automatically delete after 1 day
  }
});

module.exports = mongoose.model('Token', tokenSchema);