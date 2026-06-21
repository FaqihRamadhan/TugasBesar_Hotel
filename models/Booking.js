const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  _id: String,
  guest_id: String,
  room_id: Number,
  check_in: Date,
  check_out: Date,
  total_payment: Number,
  status: String
});
module.exports = mongoose.model('Booking', bookingSchema, 'bookings');