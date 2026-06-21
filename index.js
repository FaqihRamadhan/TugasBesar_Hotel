const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Tambahkan cors

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Mengaktifkan CORS agar Frontend bisa mengakses API

// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/HotelDB')
  .then(() => console.log('Sukses terhubung ke MongoDB (HotelDB)...'))
  .catch(err => console.error('Gagal koneksi ke MongoDB:', err));

// Endpoint API Route
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/bookings', require('./routes/bookings'));

app.listen(PORT, () => {
  console.log(`Server Backend aktif di http://localhost:${PORT}`);
});