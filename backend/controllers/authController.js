// controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { ok, fail } = require('../utils/response');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.emailExists(email))
      return fail(res, 'Email already registered. Please login instead.', 409);

    const user  = await User.create({ name, email, password });
    const token = signToken(user.id, user.role);
    return ok(res, { data: { user, token } }, 'Account created successfully! 🎉', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await User.comparePassword(password, user.password)))
      return fail(res, 'Invalid email or password', 401);

    await User.updateLastLogin(user.id);
    const token = signToken(user.id, user.role);
    const { password: _, ...safeUser } = user;
    return ok(res, { data: { user: safeUser, token } }, 'Welcome back! 👋');
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return ok(res, { data: { user } });
  } catch (err) { next(err); }
};
