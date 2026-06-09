// models/User.js
const { pool } = require('../config/database');
const bcrypt   = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [r] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email)=LOWER(?) AND is_active=1 LIMIT 1', [email]);
    return r[0] || null;
  }

  static async findById(id) {
    const [r] = await pool.query(
      'SELECT id,name,email,role,avatar,phone,last_login,created_at FROM users WHERE id=? AND is_active=1 LIMIT 1', [id]);
    return r[0] || null;
  }

  static async create({ name, email, password, role = 'user' }) {
    const hash = await bcrypt.hash(password, 12);
    const [r] = await pool.query(
      'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      [name.trim(), email.toLowerCase().trim(), hash, role]);
    return this.findById(r.insertId);
  }

  static async emailExists(email) {
    const [r] = await pool.query('SELECT id FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1', [email]);
    return r.length > 0;
  }

  static async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  static async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login=NOW() WHERE id=?', [id]);
  }

  static async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      'SELECT id,name,email,role,is_active,last_login,created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');
    return { users: rows, total: parseInt(total) };
  }

  static async toggleStatus(id) {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id=?', [id]);
    return this.findById(id);
  }
}

module.exports = User;
