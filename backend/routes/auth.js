// routes/auth.js
const r = require('express').Router();
const c = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../validations');
const { protect } = require('../middleware/auth');

r.post('/register', registerRules, validate, c.register);
r.post('/login',    loginRules,    validate, c.login);
r.get('/me',        protect,                c.getMe);
module.exports = r;
