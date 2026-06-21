const mongoose = require('mongoose');
const guestSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  phone: String,
  city: String
});
module.exports = mongoose.model('Guest', guestSchema, 'guests');