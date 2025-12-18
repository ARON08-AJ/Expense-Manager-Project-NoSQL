const express = require('express');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const { Types } = require('mongoose');

const router = express.Router();

router.get('/daily', auth, async (req, res) => {
  try {
const q = (req.query.date || '').trim();         // e.g. "2025-11-21"
const base = q ? new Date(q + "T00:00:00") : new Date();
const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0,0,0,0);
const end   = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23,59,59,999);
    const userObjId = new Types.ObjectId(req.userId);

    const items = await Expense.find({ userId: userObjId, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    const catRows = await Expense.aggregate([
      { $match: { userId: userObjId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const total = items.reduce((s, e) => s + (e.amount || 0), 0);

    res.json({
      date: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`,
      total,
      byCategory: catRows.map(r => ({ category: r._id, total: r.total, count: r.count })),
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/monthly', auth, async (req, res) => {
  try {
    const y = parseInt(req.query.year, 10) || new Date().getFullYear();
    const m1 = parseInt(req.query.month, 10);
    const monthIndex = !isNaN(m1) ? (m1 - 1) : new Date().getMonth();

    const start = new Date(y, monthIndex, 1, 0, 0, 0, 0);
    const end = new Date(y, monthIndex + 1, 0, 23, 59, 59, 999);
    const userObjId = new Types.ObjectId(req.userId);

    const byCategory = await Expense.aggregate([
      { $match: { userId: userObjId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const byDay = await Expense.aggregate([
      { $match: { userId: userObjId, date: { $gte: start, $lte: end } } },
      { $group: { _id: { d: { $dayOfMonth: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.d': 1 } }
    ]);

    const items = await Expense.find({ userId: userObjId, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    const total = items.reduce((s, e) => s + (e.amount || 0), 0);

    res.json({
      year: y,
      month: monthIndex + 1,
      total,
      byCategory: byCategory.map(r => ({ category: r._id, total: r.total, count: r.count })),
      byDay: byDay.map(r => ({ day: r._id.d, total: r.total })),
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
