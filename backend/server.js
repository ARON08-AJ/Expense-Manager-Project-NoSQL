// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// route modules
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const viewRoutes = require('./routes/viewRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// database
const MONGO = process.env.MONGO_URI || process.env.MONGOURI || 'mongodb://127.0.0.1:27017/expenseDB';
mongoose
  .connect(MONGO, { autoIndex: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Error', err));

// api routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/view', viewRoutes);
app.use('/api/reports', reportsRoutes);

// simple health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));