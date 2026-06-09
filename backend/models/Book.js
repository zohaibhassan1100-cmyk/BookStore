// models/Book.js
const { pool } = require('../config/database');

const BASE_SELECT = `
  SELECT b.*, c.name AS category_name, c.color AS category_color,
    u.name AS created_by_name
  FROM books b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN users      u ON b.created_by  = u.id
`;

class Book {
  static async getAll({ search='', page=1, limit=10, sortBy='created_at', sortOrder='DESC', category='', status='' }) {
    const offset = (page-1)*limit;
    const allowed = { title:'b.title', author:'b.author', price:'b.price', rating:'b.rating', created_at:'b.created_at', total_sold:'b.total_sold' };
    const col   = allowed[sortBy] || 'b.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conds = [], params = [];
    if (search.trim()) {
      conds.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }
    if (category) { conds.push('c.slug = ?'); params.push(category); }
    if (status)   { conds.push('b.status = ?'); params.push(status); }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM books b LEFT JOIN categories c ON b.category_id=c.id ${where}`, params);

    const [rows] = await pool.query(
      `${BASE_SELECT} ${where} ORDER BY ${col} ${order} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]);

    return { books: rows, total: parseInt(total), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total/limit) };
  }

  static async findById(id) {
    const [r] = await pool.query(`${BASE_SELECT} WHERE b.id=? LIMIT 1`, [id]);
    return r[0] || null;
  }

  static async findByISBN(isbn, excludeId = null) {
    let q = 'SELECT id FROM books WHERE isbn=?';
    const p = [isbn];
    if (excludeId) { q += ' AND id!=?'; p.push(excludeId); }
    const [r] = await pool.query(q, p);
    return r[0] || null;
  }

  static async create(data, userId) {
    const { title, author, price, original_price, isbn, published_date, description,
            category_id, stock, pages, language, publisher, cover_image, is_featured } = data;
    const [r] = await pool.query(
      `INSERT INTO books (title,author,price,original_price,isbn,published_date,description,
        category_id,stock,pages,language,publisher,cover_image,is_featured,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [title,author,parseFloat(price),original_price||null,isbn,published_date,
       description||null,category_id||null,parseInt(stock)||0,pages||null,
       language||'English',publisher||null,cover_image||null,is_featured?1:0,userId||null]);
    return this.findById(r.insertId);
  }

  static async update(id, data) {
    const { title, author, price, original_price, isbn, published_date, description,
            category_id, stock, pages, language, publisher, cover_image, is_featured, status } = data;
    await pool.query(
      `UPDATE books SET title=?,author=?,price=?,original_price=?,isbn=?,published_date=?,
        description=?,category_id=?,stock=?,pages=?,language=?,publisher=?,
        cover_image=?,is_featured=?,status=? WHERE id=?`,
      [title,author,parseFloat(price),original_price||null,isbn,published_date,
       description||null,category_id||null,parseInt(stock)||0,pages||null,
       language||'English',publisher||null,cover_image||null,is_featured?1:0,
       status||'active',id]);
    return this.findById(id);
  }

  static async delete(id) {
    const [r] = await pool.query('DELETE FROM books WHERE id=?', [id]);
    return r.affectedRows > 0;
  }

  static async getStats() {
    const [[s]] = await pool.query(`
      SELECT
        COUNT(*) AS total_books,
        SUM(stock) AS total_stock,
        ROUND(AVG(price),2) AS avg_price,
        MAX(price) AS max_price,
        MIN(price) AS min_price,
        COUNT(DISTINCT author) AS total_authors,
        SUM(total_sold) AS total_sold,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active_books,
        SUM(CASE WHEN is_featured=1 THEN 1 ELSE 0 END) AS featured_books,
        SUM(CASE WHEN stock=0 THEN 1 ELSE 0 END) AS out_of_stock
      FROM books`);
    const [topBooks] = await pool.query(
      'SELECT id,title,author,total_sold,rating,cover_image FROM books ORDER BY total_sold DESC LIMIT 5');
    const [catStats] = await pool.query(`
      SELECT c.name, c.color, COUNT(b.id) as book_count
      FROM categories c LEFT JOIN books b ON c.id=b.category_id
      GROUP BY c.id ORDER BY book_count DESC LIMIT 6`);
    return { ...s, top_books: topBooks, category_stats: catStats };
  }

  static async getFeatured(limit = 6) {
    const [r] = await pool.query(
      `${BASE_SELECT} WHERE b.is_featured=1 AND b.status='active' ORDER BY b.rating DESC LIMIT ?`, [limit]);
    return r;
  }

  static async toggleFeatured(id) {
    await pool.query('UPDATE books SET is_featured = NOT is_featured WHERE id=?', [id]);
    return this.findById(id);
  }

  // Categories
  static async getAllCategories() {
    const [r] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return r;
  }
}

module.exports = Book;
