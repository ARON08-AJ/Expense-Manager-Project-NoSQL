const express = require('express');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const { Types } = require('mongoose');

const router = express.Router();

router.get('/export.csv', auth, async (req,res)=>{
  const userObjId = new Types.ObjectId(req.userId);
  const from = req.query.from ? new Date(req.query.from) : null;
  const to   = req.query.to   ? new Date(req.query.to)   : null;
  const q = { userId: userObjId };
  if(from || to){
    q.date = {};
    if(from) q.date.$gte = from;
    if(to){ to.setHours(23,59,59,999); q.date.$lte = to; }
  }
  const items = await Expense.find(q).sort({ date: -1 });
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="expenses.csv"');
  res.write('date,description,category,amount\n');
  items.forEach(r=>{
    const date = new Date(r.date).toISOString();
    const desc = (r.description||'').replace(/"/g,'""');
    const cat  = (r.category||'').replace(/"/g,'""');
    res.write(`"${date}","${desc}","${cat}",${Number(r.amount||0).toFixed(2)}\n`);
  });
  res.end();
});

module.exports = router;
