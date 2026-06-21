const mongoose = require('mongoose');

// 1. KONEKSI KE DATABASE MONGODB (HotelDB)
const url = 'mongodb://127.0.0.1:27017/HotelDB';
mongoose.connect(url)
  .then(() => console.log('Sukes Terhubung ke MongoDB (HotelDB)...'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// 2. DEFINISI SCHEMA & MODEL UNTUK KOLEKSI 'rooms'
const roomSchema = new mongoose.Schema({
  _id: Number,
  type: String,
  price: Number,
  facilities: [String],
  status: String,
  floor: Number
});
const Room = mongoose.model('Room', roomSchema, 'rooms');

// 3. DEFINISI SCHEMA & MODEL UNTUK KOLEKSI 'guests'
const guestSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  phone: String,
  city: String
});
const Guest = mongoose.model('Guest', guestSchema, 'guests');

// 4. DEFINISI SCHEMA & MODEL UNTUK KOLEKSI 'bookings'
const bookingSchema = new mongoose.Schema({
  _id: String,
  guest_id: String,
  room_id: Number,
  check_in: Date,
  check_out: Date,
  total_payment: Number,
  status: String
});
const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

// 5. DATA YANG AKAN DI-INSERT KE MASING-MASING KOLEKSI
const dataRooms = [
  { _id: 101, type: "Deluxe", price: 750000, facilities: ["AC", "WiFi", "TV"], status: "Available", floor: 1 },
  { _id: 102, type: "Suite", price: 1500000, facilities: ["AC", "WiFi", "TV", "Mini Bar", "Bathtub"], status: "Occupied", floor: 1 },
  { _id: 103, type: "Deluxe", price: 750000, facilities: ["AC", "WiFi", "TV"], status: "Available", floor: 1 },
  { _id: 201, type: "Superior", price: 500000, facilities: ["AC", "WiFi"], status: "Available", floor: 2 },
  { _id: 202, type: "Superior", price: 500000, facilities: ["AC", "WiFi"], status: "Maintenance", floor: 2 },
  { _id: 203, type: "Suite", price: 1500000, facilities: ["AC", "WiFi", "TV", "Mini Bar", "Bathtub"], status: "Available", floor: 2 },
  { _id: 301, type: "Penthouse", price: 5000000, facilities: ["AC", "WiFi", "TV", "Pool", "Kitchen"], status: "Available", floor: 3 },
  { _id: 302, type: "Deluxe", price: 750000, facilities: ["AC", "WiFi", "TV"], status: "Available", floor: 3 },
  { _id: 303, type: "Deluxe", price: 750000, facilities: ["AC", "WiFi", "TV"], status: "Occupied", floor: 3 },
  { _id: 304, type: "Superior", price: 500000, facilities: ["AC", "WiFi"], status: "Available", floor: 3 }
];

const dataGuests = [
  { _id: "G001", name: "Andi Pratama", email: "andi@mail.com", phone: "0812345678", city: "Semarang" },
  { _id: "G002", name: "Siti Aminah", email: "siti@mail.com", phone: "0899887766", city: "Jakarta" },
  { _id: "G003", name: "Budi Santoso", email: "budi@mail.com", phone: "0811223344", city: "Surabaya" },
  { _id: "G004", name: "Dewi Lestari", email: "dewi@mail.com", phone: "0855667788", city: "Bandung" },
  { _id: "G005", name: "Eko Prasetyo", email: "eko@mail.com", phone: "0877112233", city: "Yogyakarta" },
  { _id: "G006", name: "Fani Rahma", email: "fani@mail.com", phone: "0822334455", city: "Semarang" },
  { _id: "G007", name: "Gilang Ramadhan", email: "gilang@mail.com", phone: "0833445566", city: "Medan" },
  { _id: "G010", name: "Joko Susilo", email: "joko@mail.com", phone: "0888990011", city: "Semarang" }
];

const dataBookings = [
  { _id: "B001", guest_id: "G002", room_id: 102, check_in: new Date("2024-05-10"), check_out: new Date("2024-05-12"), total_payment: 3000000, status: "Completed" },
  { _id: "B002", guest_id: "G001", room_id: 101, check_in: new Date("2024-06-01"), check_out: new Date("2024-06-03"), total_payment: 1500000, status: "Completed" },
  { _id: "B003", guest_id: "G010", room_id: 303, check_in: new Date("2024-06-15"), check_out: new Date("2024-06-20"), total_payment: 3750000, status: "On-Going" }
];

// 6. FUNGSI UTAMA UNTUK MENJALANKAN INSERT DATA (CREATE MODE MULTI-DOKUMEN)
async function runInsertTask() {
  try {
    // Menghapus data lama terlebih dahulu agar tidak error Duplicate ID saat di-run ulang
    await Room.deleteMany({});
    await Guest.deleteMany({});
    await Booking.deleteMany({});
    console.log('Membersihkan koleksi lama...');

    // Proses Insert Data Menggunakan insertMany sesuai instruksi Jobsheet 9
    const resRooms = await Room.insertMany(dataRooms);
    console.log(`Sukses menambahkan ${resRooms.length} data ke koleksi 'rooms'`);

    const resGuests = await Guest.insertMany(dataGuests);
    console.log(`Sukses menambahkan ${resGuests.length} data ke koleksi 'guests'`);

    const resBookings = await Booking.insertMany(dataBookings);
    console.log(`Sukses menambahkan ${resBookings.length} data ke koleksi 'bookings'`);

  } catch (error) {
    console.error('Terjadi kesalahan saat proses insert:', error);
  } finally {
    // Memutus koneksi database jika proses selesai
    mongoose.connection.close();
    console.log('Koneksi database ditutup.');
  }
}

// Jalankan fungsi setelah koneksi database siap
mongoose.connection.on('connected', () => {
  runInsertTask();
});