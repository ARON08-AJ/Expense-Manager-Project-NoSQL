const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req,res)=>{
  try{
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ message:'Username and password required' });
    const exists = await User.findOne({ username });
    if(exists) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ username, password });
    await user.save();
    return res.json({ message: 'User registered successfully' });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    return res.json({ message: 'Login successful', userId: user._id, token });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
