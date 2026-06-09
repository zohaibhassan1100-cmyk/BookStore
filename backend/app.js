// app.js
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const { errorHandler, notFound } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV, ts: new Date().toISOString() }));
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
