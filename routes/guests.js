const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');

// GET: Search + Filter + Sorting + Pagination
router.get('/', async (req, res) => {
  try {
    const { search, city, sortBy, order, page = 1, limit = 5 } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions['_id'] = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const guests = await Guest.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalData = await Guest.countDocuments(query);

    res.json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalData / limit),
      totalData: totalData,
      data: guests
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Tambah data
router.post('/', async (req, res) => {
  const guest = new Guest(req.body);
  try {
    const newGuest = await guest.save();
    res.status(201).json(newGuest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Update Tamu berdasarkan ID
router.put('/:id', async (req, res) => {
  try {
    const updatedGuest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGuest) return res.status(404).json({ message: "Tamu tidak ditemukan" });
    res.json(updatedGuest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Hapus Tamu berdasarkan ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedGuest = await Guest.findByIdAndDelete(req.params.id);
    if (!deletedGuest) return res.status(404).json({ message: "Tamu tidak ditemukan" });
    res.json({ message: "Data tamu berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;