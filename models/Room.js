const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  _id: Number,
  type: String,
  price: Number,
  facilities: [String],
  status: String,
  floor: Number
});
module.exports = mongoose.model('Room', roomSchema, 'rooms');