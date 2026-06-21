const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET: Menampilkan Semua Pemesanan + JOIN RELASI (Guests & Rooms) + Pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Menggunakan Framework Agregasi MongoDB ($lookup) untuk melakukan JOIN Relasi data
    const bookings = await Booking.aggregate([
      {
        // Join ke koleksi guests
        $lookup: {
          from: 'guests',
          localField: 'guest_id',
          foreignField: '_id',
          as: 'guest_detail'
        }
      },
      { $unwind: { path: '$guest_detail', preserveNullAndEmptyArrays: true } },
      {
        // Join ke koleksi rooms
        $lookup: {
          from: 'rooms',
          localField: 'room_id',
          foreignField: '_id',
          as: 'room_detail'
        }
      },
      { $unwind: { path: '$room_detail', preserveNullAndEmptyArrays: true } },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalData = await Booking.countDocuments();

    res.json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalData / limit),
      totalData: totalData,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Tambah Transaksi Baru
router.post('/', async (req, res) => {
  const booking = new Booking(req.body);
  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Update Transaksi
router.put('/:id', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Hapus Transaksi
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;