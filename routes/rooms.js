const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET: Search + Filter + Sorting + Pagination
router.get('/', async (req, res) => {
  try {
    // Ambil parameter dari query string (URL)
    const { search, floor, sortBy, order, page = 1, limit = 5 } = req.query;
    let query = {};

    // A. Fitur Search: Cari berdasarkan Tipe Kamar (Insensitive Case)
    if (search) {
      query.type = { $regex: search, $options: 'i' };
    }

    // B. Fitur Filter: Saring berdasarkan Lantai Kamar
    if (floor) {
      query.floor = parseInt(floor);
    }

    // C. Fitur Sorting: Urutkan berdasarkan field tertentu (default: _id ascending)
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions['_id'] = 1;
    }

    // D. Fitur Pagination: Membaca data per baris halaman
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Eksekusi Query ke MongoDB
    const rooms = await Room.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalData = await Room.countDocuments(query);

    res.json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalData / limit),
      totalData: totalData,
      data: rooms
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Tambah data (Dari Jobsheet 10)
router.post('/', async (req, res) => {
  const room = new Room(req.body);
  try {
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Update Data Kamar berdasarkan ID
router.put('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: "Kamar tidak ditemukan" });
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Hapus Data Kamar berdasarkan ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: "Kamar tidak ditemukan" });
    res.json({ message: "Data kamar berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;