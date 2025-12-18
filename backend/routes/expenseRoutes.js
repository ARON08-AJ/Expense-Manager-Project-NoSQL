const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req,res)=>{
  try{
    const { description, amount, category, date } = req.body;
    if(!description || amount==null || !category){
      return res.status(400).json({ message: 'description, amount, category required' });
    }
    const expense = new Expense({
      userId: req.userId,
      description,
      amount,
      category,
      date: date ? new Date(date) : new Date()
    });
    await expense.save();
    return res.json(expense);
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, async (req,res)=>{
  try{
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    return res.json(expenses);
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req,res)=>{
  try{
    const del = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if(!del) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
